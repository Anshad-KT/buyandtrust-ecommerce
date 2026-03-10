import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

type GrandSessionRequestBody = {
  email?: string;
  phone?: string;
  password?: string;
  verification_token?: string;
  name?: string;
  enforce_email_uniqueness?: boolean;
};

type ExistingAuthUser = {
  id: string;
};

type AuthUserMetadata = Record<string, unknown> | null | undefined;
type UsersRow = {
  user_id: string;
  email: string | null;
  phone: string | null;
};
type UsersLookupResult = {
  ownerUserId: string | null;
  error: { message: string; code?: string } | null;
};
type UsersWriteError = {
  message: string;
  code?: string;
};
const OTP_EXPIRED_MESSAGE = "OTP has expired. Please request a new OTP.";
const OTP_INVALID_MESSAGE = "Invalid OTP. Please try again.";

function getUsersUpsertRpcNames() {
  const configured = String(process.env.USERS_UPSERT_RPC_NAME || "").trim();
  const candidates = [configured, "upsert_user", "upsert_users"];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function getUsersUpsertRpcArgs() {
  const configured = String(process.env.USERS_UPSERT_RPC_ARG || "").trim();
  const candidates = [configured, "p_user_data", "p_users_data", "p_user", "user_data"];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function isRpcDefinitionError(error: { code?: string; message?: string; details?: string }) {
  const code = String(error.code || "").toUpperCase();
  const text = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return code === "PGRST202" || text.includes("could not find the function") || text.includes("does not exist");
}

function sanitizeOtpErrorMessage(raw: unknown, fallbackMessage: string): string {
  const message = String(raw ?? "").trim();
  if (!message) {
    return fallbackMessage;
  }

  const lowered = message.toLowerCase();
  const isExpired =
    lowered.includes("expired") ||
    lowered.includes("invalid or has expired") ||
    (lowered.includes("email link") && lowered.includes("invalid"));
  if (isExpired) {
    return OTP_EXPIRED_MESSAGE;
  }

  const isInvalid =
    lowered.includes("invalid otp") ||
    lowered.includes("otp is invalid") ||
    lowered.includes("invalid token") ||
    lowered.includes("token is invalid") ||
    lowered.includes("invalid verification code");
  if (isInvalid) {
    return OTP_INVALID_MESSAGE;
  }

  return fallbackMessage;
}

function getUsersEmail(email: string) {
  if (!email || email.endsWith("@dummy.buyandtrust.local")) {
    return "";
  }
  return email;
}

async function findUsersIdentityOwner(params: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>;
  email: string;
  phone: string;
}): Promise<UsersLookupResult> {
  const usersEmail = getUsersEmail(params.email);
  let rowByEmail: UsersRow | null = null;
  let rowByPhone: UsersRow | null = null;

  if (usersEmail) {
    const { data, error } = await params.supabaseAdmin
      .from("users")
      .select("user_id,email,phone")
      .eq("email", usersEmail)
      .maybeSingle();

    if (error) {
      return { ownerUserId: null, error };
    }

    rowByEmail = (data as UsersRow | null) || null;
  }

  if (params.phone) {
    const { data, error } = await params.supabaseAdmin
      .from("users")
      .select("user_id,email,phone")
      .eq("phone", params.phone)
      .maybeSingle();

    if (error) {
      return { ownerUserId: null, error };
    }

    rowByPhone = (data as UsersRow | null) || null;
  }

  if (rowByEmail && rowByPhone && rowByEmail.user_id !== rowByPhone.user_id) {
    return {
      ownerUserId: null,
      error: { message: "Conflicting users records found for the provided email and phone." },
    };
  }

  return {
    ownerUserId: rowByEmail?.user_id || rowByPhone?.user_id || null,
    error: null,
  };
}

function normalizeEmail(input: unknown): string {
  return String(input ?? "").trim().toLowerCase();
}

function normalizePhoneNumber(input: unknown): string {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return "";
  }

  const digits = raw.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    return "";
  }

  return `+${digits}`;
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL).");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getOtpHashSecret() {
  const secret = (process.env.OTP_HASH_SECRET || process.env.SUPABASE_JWT_SECRET || "").trim();
  if (!secret) {
    throw new Error("Missing OTP hash secret. Set OTP_HASH_SECRET (or SUPABASE_JWT_SECRET).");
  }
  return secret;
}

function hashPhoneVerificationToken(phoneNumber: string, token: string, secret: string) {
  return crypto
    .createHash("sha256")
    .update(`phone_verify:${phoneNumber}:${token}:${secret}`)
    .digest("hex");
}

function getPhoneCandidates(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return { canonical: "", legacy: "", candidates: [] as string[] };
  }

  const canonical = `+${digits}`;
  const legacy = digits;
  const candidates = canonical === legacy ? [canonical] : [canonical, legacy];
  return { canonical, legacy, candidates };
}

async function consumePhoneVerificationToken(phoneNumber: string, token: string) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { canonical, candidates } = getPhoneCandidates(phoneNumber);
  const targetCandidates = candidates.length > 0 ? candidates : [phoneNumber];

  const { data: primary, error: primaryError } = await supabaseAdmin
    .from("phone_verification_tokens")
    .select("phone_number, token_hash, expires_at")
    .eq("phone_number", targetCandidates[0])
    .maybeSingle();

  if (primaryError) {
    throw new Error(primaryError.message || "Phone verification has expired. Please verify OTP again.");
  }

  let stored = primary;
  if (!stored && targetCandidates.length > 1) {
    const { data: fallback, error: fallbackError } = await supabaseAdmin
      .from("phone_verification_tokens")
      .select("phone_number, token_hash, expires_at")
      .eq("phone_number", targetCandidates[1])
      .maybeSingle();

    if (fallbackError) {
      throw new Error(fallbackError.message || "Phone verification has expired. Please verify OTP again.");
    }

    stored = fallback;
  }

  if (!stored || !stored.token_hash) {
    throw new Error("Phone verification has expired. Please verify OTP again.");
  }

  if (!stored.expires_at || new Date(stored.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from("phone_verification_tokens").delete().in("phone_number", targetCandidates);
    throw new Error("Phone verification has expired. Please verify OTP again.");
  }

  const secret = getOtpHashSecret();
  const candidateHash = hashPhoneVerificationToken(
    stored.phone_number || canonical || phoneNumber,
    token,
    secret
  );
  if (stored.token_hash !== candidateHash) {
    throw new Error("Invalid phone verification token.");
  }

  const { error: deleteError } = await supabaseAdmin
    .from("phone_verification_tokens")
    .delete()
    .in("phone_number", targetCandidates);

  if (deleteError) {
    throw new Error(deleteError.message || "Failed to consume phone verification token.");
  }
}

async function createOtpSessionForEmail(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  email: string
) {
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError) {
    throw new Error(
      sanitizeOtpErrorMessage(linkError.message, "Unable to verify OTP right now. Please try again.")
    );
  }

  const tokenHash = linkData?.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("Missing token hash.");
  }

  const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });

  if (verifyError) {
    throw new Error(sanitizeOtpErrorMessage(verifyError.message, "Failed to verify OTP. Please try again."));
  }

  const accessToken = verifyData?.session?.access_token;
  const refreshToken = verifyData?.session?.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error("Session tokens were not generated.");
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: verifyData?.user ?? null,
  };
}

function resolveUserImage(metadata: AuthUserMetadata) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata.picture === "string") {
    return metadata.picture;
  }

  if (typeof metadata.avatar_url === "string") {
    return metadata.avatar_url;
  }

  return null;
}

function isUsersIdentityConflictError(error: { message?: string; code?: string } | null | undefined) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("a user already exists with this email.") ||
    message.includes("a user already exists with this phone number.")
  );
}

async function ensureUsersRow(params: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>;
  userId: string;
  email: string;
  phone: string;
  userMetadata?: AuthUserMetadata;
}) {
  const usersEmail = getUsersEmail(params.email);

  const { data: rowByUserId, error: rowByUserIdError } = await params.supabaseAdmin
    .from("users")
    .select("user_id,email,phone")
    .eq("user_id", params.userId)
    .maybeSingle();

  if (rowByUserIdError) {
    return rowByUserIdError;
  }

  if (usersEmail) {
    const { data: rowByEmail, error: rowByEmailError } = await params.supabaseAdmin
      .from("users")
      .select("user_id,email,phone")
      .eq("email", usersEmail)
      .maybeSingle();

    if (rowByEmailError) {
      return rowByEmailError;
    }

    if (rowByEmail && (rowByEmail as UsersRow).user_id !== params.userId) {
      return {
        message: "A user already exists with this email.",
      };
    }
  }

  if (params.phone) {
    const { data: rowByPhone, error: rowByPhoneError } = await params.supabaseAdmin
      .from("users")
      .select("user_id,email,phone")
      .eq("phone", params.phone)
      .maybeSingle();

    if (rowByPhoneError) {
      return rowByPhoneError;
    }

    if (rowByPhone && (rowByPhone as UsersRow).user_id !== params.userId) {
      return {
        message: "A user already exists with this phone number.",
      };
    }
  }

  if (rowByUserId) {
    const existingRow = rowByUserId as UsersRow;
    const updates: Record<string, string> = {};
    if (usersEmail && existingRow.email !== usersEmail) {
      updates.email = usersEmail;
    }
    if (params.phone && existingRow.phone !== params.phone) {
      updates.phone = params.phone;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await params.supabaseAdmin
        .from("users")
        .update(updates)
        .eq("user_id", params.userId);

      if (updateError) {
        return updateError;
      }
    }

    return null;
  }

  const usersPayload = {
    user_id: params.userId,
    name: "",
    email: usersEmail || null,
    phone: params.phone || null,
    image: resolveUserImage(params.userMetadata),
  };

  const rpcNames = getUsersUpsertRpcNames();
  const rpcArgs = getUsersUpsertRpcArgs();
  let lastRpcDefinitionError: UsersWriteError | null = null;

  for (const rpcName of rpcNames) {
    for (const rpcArg of rpcArgs) {
      const { error } = await params.supabaseAdmin.rpc(rpcName, {
        [rpcArg]: usersPayload,
      });

      if (!error) {
        return null;
      }

      if (isRpcDefinitionError(error)) {
        lastRpcDefinitionError = {
          message: error.message || "Users upsert RPC is not available.",
          code: error.code || "RPC_NOT_FOUND",
        };
        continue;
      }

      return {
        message: error.message || "Failed to upsert users row via RPC.",
        code: error.code || "RPC_UPSERT_FAILED",
      };
    }
  }

  return (
    lastRpcDefinitionError || {
      message: "Users upsert RPC is not available.",
      code: "RPC_NOT_FOUND",
    }
  );
}

async function syncAuthIdentityForUser(params: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>;
  userId: string;
  email: string;
  phone: string;
}) {
  const { data: authUserData, error: authUserError } = await params.supabaseAdmin.auth.admin.getUserById(params.userId);
  if (authUserError) {
    throw new Error(authUserError.message || "Failed to fetch auth user.");
  }

  const authUser = authUserData?.user || null;
  const currentEmail = normalizeEmail(authUser?.email);
  const currentPhone = normalizePhoneNumber(authUser?.phone);
  const nextEmail = normalizeEmail(params.email);
  const nextPhone = normalizePhoneNumber(params.phone);
  const updatePayload: {
    email?: string;
    email_confirm?: boolean;
    phone?: string;
    phone_confirm?: boolean;
  } = {};

  if (nextEmail && currentEmail !== nextEmail) {
    updatePayload.email = nextEmail;
    updatePayload.email_confirm = true;
  }

  if (nextPhone && currentPhone !== nextPhone) {
    updatePayload.phone = nextPhone;
    updatePayload.phone_confirm = true;
  }

  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  const { error: updateError } = await params.supabaseAdmin.auth.admin.updateUserById(
    params.userId,
    updatePayload
  );

  if (updateError) {
    throw new Error(updateError.message || "Failed to update auth identity.");
  }
}

async function syncPhoneProfileName(params: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>;
  userId: string;
  name: string;
  phone: string;
}) {
  const normalizedName = String(params.name || "").trim();
  if (!normalizedName) {
    return;
  }

  const { data: authUserData, error: authUserError } = await params.supabaseAdmin.auth.admin.getUserById(params.userId);
  if (authUserError) {
    throw new Error(authUserError.message || "Failed to fetch auth user metadata.");
  }

  const authUser = authUserData?.user || null;
  const existingMetadata = (authUser?.user_metadata || {}) as Record<string, unknown>;
  const nextMetadata: Record<string, unknown> = {
    ...existingMetadata,
    name: normalizedName,
    user_name: normalizedName,
    phone_number: params.phone,
  };

  const { error: updateAuthMetadataError } = await params.supabaseAdmin.auth.admin.updateUserById(
    params.userId,
    {
      user_metadata: nextMetadata,
    }
  );

  if (updateAuthMetadataError) {
    throw new Error(updateAuthMetadataError.message || "Failed to update auth profile.");
  }

  const { error: updateUsersError } = await params.supabaseAdmin
    .from("users")
    .update({ name: normalizedName })
    .eq("user_id", params.userId);

  if (updateUsersError) {
    throw new Error(updateUsersError.message || "Failed to update users profile.");
  }

  const { error: updateCustomersError } = await params.supabaseAdmin
    .from("customers")
    .update({ name: normalizedName })
    .eq("customer_id", params.userId);

  if (updateCustomersError) {
    throw new Error(updateCustomersError.message || "Failed to update customer profile.");
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GrandSessionRequestBody;
    const emailInput = normalizeEmail(body?.email);
    const phone = normalizePhoneNumber(body?.phone);
    const password = String(body?.password ?? "").trim();
    const verificationToken = String(body?.verification_token ?? "").trim();
    const profileName = String(body?.name ?? "").trim();
    const enforceEmailUniqueness = body?.enforce_email_uniqueness === true;
    const email = emailInput;

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone is required." }, { status: 400 });
    }

    if (phone && !email) {
      return NextResponse.json({ error: "Email is required for phone session." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    if (phone && email && enforceEmailUniqueness) {
      const publicUsersEmailOwnerCheck = await findUsersIdentityOwner({
        supabaseAdmin,
        email,
        phone: "",
      });

      if (publicUsersEmailOwnerCheck.error) {
        return NextResponse.json(
          {
            error: "Failed to check users table.",
            details: publicUsersEmailOwnerCheck.error.message,
          },
          { status: 500 }
        );
      }

      if (publicUsersEmailOwnerCheck.ownerUserId) {
        return NextResponse.json(
          { error: "This email is already registered. Please use a different email." },
          { status: 409 }
        );
      }
    }

    const { data: userData, error: userError } = await supabaseAdmin.rpc("check_user_exists", {
      p_email: email || null,
      p_phone: phone || null,
    });

    if (userError) {
      return NextResponse.json(
        {
          error: "Failed to check user existence.",
          details: userError.message,
        },
        { status: 500 }
      );
    }

    const existingUser = Array.isArray(userData) && userData.length > 0
      ? (userData[0] as ExistingAuthUser)
      : null;

    if (existingUser?.id) {
      const usersInsertError = await ensureUsersRow({
        supabaseAdmin,
        userId: existingUser.id,
        email,
        phone,
      });
      const hasUsersIdentityConflict = isUsersIdentityConflictError(usersInsertError);

      if (usersInsertError && !hasUsersIdentityConflict) {
        const status = "code" in usersInsertError ? 500 : 409;
        return NextResponse.json(
          {
            error: "Failed to ensure users row.",
            details: usersInsertError.message,
          },
          { status }
        );
      }

      if (hasUsersIdentityConflict) {
        console.warn("[grand-session] users identity conflict encountered; continuing with session issuance.", {
          existingUserId: existingUser.id,
          email,
          phone,
          details: usersInsertError?.message || null,
        });
      }

      if (phone) {
        if (!hasUsersIdentityConflict) {
          try {
            await syncAuthIdentityForUser({
              supabaseAdmin,
              userId: existingUser.id,
              email,
              phone,
            });
          } catch (syncIdentityError) {
            return NextResponse.json(
              {
                error: "Failed to sync auth user identity.",
                details: syncIdentityError instanceof Error ? syncIdentityError.message : String(syncIdentityError),
              },
              { status: 500 }
            );
          }
        }

        if (!verificationToken) {
          return NextResponse.json(
            { error: "OTP verification token is required for phone session." },
            { status: 400 }
          );
        }

        try {
          await consumePhoneVerificationToken(phone, verificationToken);
        } catch (tokenError) {
          return NextResponse.json(
            {
              error: sanitizeOtpErrorMessage(
                tokenError instanceof Error ? tokenError.message : tokenError,
                "Invalid phone verification token."
              ),
            },
            { status: 401 }
          );
        }

        if (profileName && !hasUsersIdentityConflict) {
          try {
            await syncPhoneProfileName({
              supabaseAdmin,
              userId: existingUser.id,
              name: profileName,
              phone,
            });
          } catch (syncNameError) {
            return NextResponse.json(
              {
                error: "Failed to update profile details.",
                details: syncNameError instanceof Error ? syncNameError.message : String(syncNameError),
              },
              { status: 500 }
            );
          }
        }

        let sessionPayload: Awaited<ReturnType<typeof createOtpSessionForEmail>>;
        try {
          sessionPayload = await createOtpSessionForEmail(supabaseAdmin, email);
        } catch (sessionError) {
          const message = sessionError instanceof Error ? sessionError.message : "Unable to verify OTP right now. Please try again.";
          const status = message === "Missing token hash." || message === "Session tokens were not generated."
            ? 500
            : 400;
          return NextResponse.json({ error: message }, { status });
        }
        const sessionCustomerId =
          String((sessionPayload.user as { id?: string } | null)?.id || "").trim() || existingUser.id;

        return NextResponse.json(
          {
            message: "Customer already exists",
            customer_id: sessionCustomerId,
            access_token: sessionPayload.access_token,
            refresh_token: sessionPayload.refresh_token,
            user: sessionPayload.user,
            email,
            phone_number: phone,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          message: "Customer already exists",
          customer_id: existingUser.id,
        },
        { status: 200 }
      );
    }

    const usersOwnerCheck = await findUsersIdentityOwner({
      supabaseAdmin,
      email,
      phone,
    });

    if (usersOwnerCheck.error) {
      const status = usersOwnerCheck.error.code ? 500 : 409;
      return NextResponse.json(
        {
          error: usersOwnerCheck.error.code
            ? "Failed to check users table."
            : "Conflicting users records found.",
          details: usersOwnerCheck.error.message,
        },
        { status }
      );
    }

    if (usersOwnerCheck.ownerUserId) {
      return NextResponse.json(
        {
          error: "User already exists in users table.",
          customer_id: usersOwnerCheck.ownerUserId,
        },
        { status: 409 }
      );
    }

    const createPayload = phone
      ? {
          ...(email ? { email, email_confirm: true } : {}),
          phone,
          phone_confirm: true,
          user_metadata: {
            is_customer: true,
            phone_number: phone,
          },
        }
      : {
          email,
          ...(password ? { password } : {}),
          email_confirm: true,
          user_metadata: {
            is_customer: true,
          },
        };

    if (!phone && !password) {
      return NextResponse.json(
        {
          error: "Password is required to create a new email user.",
        },
        { status: 400 }
      );
    }

    const { data: authResp, error: authError } = await supabaseAdmin.auth.admin.createUser(createPayload);

    if (authError || !authResp?.user?.id) {
      return NextResponse.json(
        {
          error: "Failed to create user.",
          details: authError?.message || "Unknown error from Supabase Auth.",
        },
        { status: 500 }
      );
    }

    const createdUserId = authResp.user.id;
    const usersInsertError = await ensureUsersRow({
      supabaseAdmin,
      userId: createdUserId,
      email,
      phone,
      userMetadata: (authResp.user.user_metadata || {}) as Record<string, unknown>,
    });

    if (usersInsertError) {
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      const status = "code" in usersInsertError ? 500 : 409;

      return NextResponse.json(
        {
          error: "Failed to create users row.",
          details: rollbackError
            ? `${usersInsertError.message}. Rollback failed: ${rollbackError.message}`
            : usersInsertError.message,
        },
        { status }
      );
    }

    if (phone) {
      if (!verificationToken) {
        return NextResponse.json(
          { error: "OTP verification token is required for phone session." },
          { status: 400 }
        );
      }

      try {
        await consumePhoneVerificationToken(phone, verificationToken);
      } catch (tokenError) {
        return NextResponse.json(
          {
            error: sanitizeOtpErrorMessage(
              tokenError instanceof Error ? tokenError.message : tokenError,
              "Invalid phone verification token."
            ),
          },
          { status: 401 }
        );
      }

      if (profileName) {
        try {
          await syncPhoneProfileName({
            supabaseAdmin,
            userId: createdUserId,
            name: profileName,
            phone,
          });
        } catch (syncNameError) {
          return NextResponse.json(
            {
              error: "Failed to update profile details.",
              details: syncNameError instanceof Error ? syncNameError.message : String(syncNameError),
            },
            { status: 500 }
          );
        }
      }

      let sessionPayload: Awaited<ReturnType<typeof createOtpSessionForEmail>>;
      try {
        sessionPayload = await createOtpSessionForEmail(supabaseAdmin, email);
      } catch (sessionError) {
        const message = sessionError instanceof Error ? sessionError.message : "Unable to verify OTP right now. Please try again.";
        const status = message === "Missing token hash." || message === "Session tokens were not generated."
          ? 500
          : 400;
        return NextResponse.json({ error: message }, { status });
      }

      return NextResponse.json(
        {
          message: "Customer created successfully",
          customer_id: createdUserId,
          access_token: sessionPayload.access_token,
          refresh_token: sessionPayload.refresh_token,
          user: sessionPayload.user,
          email,
          phone_number: phone,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Customer created successfully",
        customer_id: createdUserId,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `An error occurred: ${message}` }, { status: 500 });
  }
}

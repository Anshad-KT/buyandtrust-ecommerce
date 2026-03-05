import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const DUMMY_SIGNUP_OTP = "0000";
const PHONE_OTP_REGEX = /^\d{4}$/;
const OTP_KEY_PREFIX = "auth:wa:otp";
const PHONE_VERIFY_KEY_PREFIX = "auth:wa:verified";
const PHONE_VERIFY_TTL_SECONDS = 10 * 60;
const OTP_EXPIRED_MESSAGE = "OTP has expired. Please request a new OTP.";
const OTP_INVALID_MESSAGE = "Invalid OTP. Please try again.";

type ExistingAuthUser = {
  id: string;
};

type StoredOtpPayload = {
  hash?: string;
  created_at?: string;
};

type StoredPhoneVerificationPayload = {
  hash?: string;
  created_at?: string;
};

type AuthUserMetadata = Record<string, unknown> | null | undefined;
type UsersRow = {
  user_id: string;
  email: string | null;
  phone: string | null;
};
type ExistingPhoneUserProfile = {
  id: string;
  email: string | null;
  name: string | null;
};
type UsersWriteError = {
  message: string;
  code?: string;
};

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

  if (message === "OTP expired or not found.") {
    return OTP_EXPIRED_MESSAGE;
  }

  if (message === "Invalid OTP.") {
    return OTP_INVALID_MESSAGE;
  }

  return fallbackMessage;
}

function normalizeEmail(input: unknown): string {
  return String(input ?? "").trim().toLowerCase();
}

function sanitizeSyntheticEmail(input: string | null | undefined): string | null {
  const normalized = normalizeEmail(String(input || ""));
  if (!normalized) {
    return null;
  }

  return /^phone_\d+@dummy\.buyandtrust\.local$/i.test(normalized) ? null : normalized;
}

function getUsersEmail(email: string) {
  if (!email || email.endsWith("@dummy.buyandtrust.local")) {
    return "";
  }
  return email;
}

function normalizePhoneNumber(input: unknown): string {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return "";
  }

  const hasPlusPrefix = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "";
  }

  return hasPlusPrefix ? `+${digits}` : digits;
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

function getRedisClient() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "").trim();

  if (!url || !token) {
    throw new Error("Missing Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  }

  return new Redis({ url, token });
}

function getOtpHashSecret() {
  const secret = (process.env.OTP_HASH_SECRET || process.env.SUPABASE_JWT_SECRET || "").trim();
  if (!secret) {
    throw new Error("Missing OTP hash secret. Set OTP_HASH_SECRET (or SUPABASE_JWT_SECRET).");
  }
  return secret;
}

function getOtpKey(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  return `${OTP_KEY_PREFIX}:${digits}`;
}

function getPhoneVerifyKey(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  return `${PHONE_VERIFY_KEY_PREFIX}:${digits}`;
}

function hashOtp(phoneNumber: string, otp: string, secret: string) {
  return crypto
    .createHash("sha256")
    .update(`${phoneNumber}:${otp}:${secret}`)
    .digest("hex");
}

function hashPhoneVerificationToken(phoneNumber: string, token: string, secret: string) {
  return crypto
    .createHash("sha256")
    .update(`phone_verify:${phoneNumber}:${token}:${secret}`)
    .digest("hex");
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

function resolveUserDisplayName(
  metadata: AuthUserMetadata,
  usersTableName: string | null | undefined
): string | null {
  const metadataRecord =
    metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : null;
  const candidateName = [
    metadataRecord?.user_name,
    metadataRecord?.name,
    metadataRecord?.full_name,
    usersTableName,
  ].find((value) => typeof value === "string" && String(value).trim().length > 0);

  if (!candidateName || typeof candidateName !== "string") {
    return null;
  }

  return candidateName.trim();
}

async function getExistingPhoneUserProfile(params: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>;
  phone: string;
}): Promise<ExistingPhoneUserProfile | null> {
  const { data: userData, error: userError } = await params.supabaseAdmin.rpc("check_user_exists", {
    p_email: null,
    p_phone: params.phone,
  });

  if (userError) {
    throw new Error(userError.message || "Failed to check existing phone user.");
  }

  const existingUser = Array.isArray(userData) && userData.length > 0
    ? (userData[0] as ExistingAuthUser)
    : null;

  if (!existingUser?.id) {
    return null;
  }

  const { data: usersRowData, error: usersRowError } = await params.supabaseAdmin
    .from("users")
    .select("name,email")
    .eq("user_id", existingUser.id)
    .maybeSingle();

  if (usersRowError) {
    throw new Error(usersRowError.message || "Failed to fetch existing users profile.");
  }

  const usersRow = (usersRowData as { name?: string | null; email?: string | null } | null) || null;
  const { data: authUserData, error: authUserError } = await params.supabaseAdmin.auth.admin.getUserById(existingUser.id);

  if (authUserError) {
    throw new Error(authUserError.message || "Failed to fetch auth user profile.");
  }

  const authUser = authUserData?.user || null;
  const authMetadata = (authUser?.user_metadata || null) as AuthUserMetadata;
  const authEmail = sanitizeSyntheticEmail(authUser?.email || null);
  const usersEmail = sanitizeSyntheticEmail(usersRow?.email || null);
  const resolvedEmail = authEmail || usersEmail || null;
  const resolvedName = resolveUserDisplayName(authMetadata, usersRow?.name || null);

  return {
    id: existingUser.id,
    email: resolvedEmail,
    name: resolvedName,
  };
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

async function verifyPhoneOtpFromRedis(phoneNumber: string, otp: string) {
  const redis = getRedisClient();
  const otpKey = getOtpKey(phoneNumber);
  const stored = await redis.get<StoredOtpPayload>(otpKey);

  if (!stored || typeof stored !== "object" || !stored.hash) {
    throw new Error("OTP expired or not found.");
  }

  const secret = getOtpHashSecret();
  const candidateHash = hashOtp(phoneNumber, otp, secret);

  if (stored.hash !== candidateHash) {
    throw new Error("Invalid OTP.");
  }

  await redis.del(otpKey);
}

async function issuePhoneVerificationToken(phoneNumber: string) {
  const redis = getRedisClient();
  const verifyKey = getPhoneVerifyKey(phoneNumber);
  const secret = getOtpHashSecret();
  const token = crypto.randomBytes(24).toString("hex");
  const payload: StoredPhoneVerificationPayload = {
    hash: hashPhoneVerificationToken(phoneNumber, token, secret),
    created_at: new Date().toISOString(),
  };

  await redis.set(verifyKey, payload, { ex: PHONE_VERIFY_TTL_SECONDS });
  return token;
}

async function consumePhoneVerificationToken(phoneNumber: string, token: string) {
  const redis = getRedisClient();
  const verifyKey = getPhoneVerifyKey(phoneNumber);
  const stored = await redis.get<StoredPhoneVerificationPayload>(verifyKey);

  if (!stored || typeof stored !== "object" || !stored.hash) {
    throw new Error("Phone verification has expired. Please verify OTP again.");
  }

  const secret = getOtpHashSecret();
  const candidateHash = hashPhoneVerificationToken(phoneNumber, token, secret);
  if (stored.hash !== candidateHash) {
    throw new Error("Invalid phone verification token.");
  }

  await redis.del(verifyKey);
}

async function ensureAuthUserForOtp(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  params: { email: string; phone?: string }
) {
  const { email, phone } = params;

  const { data: userData, error: userError } = await supabaseAdmin.rpc("check_user_exists", {
    p_email: email || null,
    p_phone: phone || null,
  });

  if (userError) {
    throw new Error(userError.message || "Failed to check user existence.");
  }

  const existingUser = Array.isArray(userData) && userData.length > 0
    ? (userData[0] as ExistingAuthUser)
    : null;

  if (existingUser?.id) {
    const usersInsertError = await ensureUsersRow({
      supabaseAdmin,
      userId: existingUser.id,
      email,
      phone: phone || "",
    });

    if (usersInsertError) {
      throw new Error(usersInsertError.message || "Failed to ensure users row.");
    }

    return existingUser.id;
  }

  const createPayload = phone
    ? {
        email,
        phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          is_customer: true,
          phone_number: phone,
        },
      }
    : {
        email,
        email_confirm: true,
        user_metadata: {
          is_customer: true,
        },
      };

  const { data: authResp, error: authError } = await supabaseAdmin.auth.admin.createUser(createPayload);

  if (authError || !authResp?.user?.id) {
    throw new Error(authError?.message || "Failed to create user.");
  }

  const createdUserId = authResp.user.id;
  const usersInsertError = await ensureUsersRow({
    supabaseAdmin,
    userId: createdUserId,
    email,
    phone: phone || "",
    userMetadata: (authResp.user.user_metadata || {}) as Record<string, unknown>,
  });

  if (usersInsertError) {
    const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(createdUserId);

    if (rollbackError) {
      throw new Error(
        `${usersInsertError.message || "Failed to create users row."}. Rollback failed: ${rollbackError.message}`
      );
    }

    throw new Error(usersInsertError.message || "Failed to create users row.");
  }

  return createdUserId;
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      phone_number?: string;
      phoneNumber?: string;
      otp?: string;
      verification_token?: string;
    };

    const email = normalizeEmail(body?.email);
    const normalizedPhone =
      normalizePhoneNumber(body?.phone_number) || normalizePhoneNumber(body?.phoneNumber);
    const otp = String(body?.otp ?? "").trim();

    if (normalizedPhone) {
      // Step 1: OTP verification.
      if (otp) {
        if (!PHONE_OTP_REGEX.test(otp)) {
          return NextResponse.json({ error: "Please enter a valid 4-digit OTP." }, { status: 400 });
        }
        try {
          await verifyPhoneOtpFromRedis(normalizedPhone, otp);
        } catch (error) {
          const message = sanitizeOtpErrorMessage(
            error instanceof Error ? error.message : error,
            OTP_INVALID_MESSAGE
          );
          return NextResponse.json({ error: message }, { status: 401 });
        }

        const supabaseAdmin = getSupabaseAdminClient();
        let existingUser: ExistingPhoneUserProfile | null = null;
        try {
          existingUser = await getExistingPhoneUserProfile({
            supabaseAdmin,
            phone: normalizedPhone,
          });
        } catch (profileLookupError) {
          console.warn("Unable to fetch existing phone user profile during OTP verification:", profileLookupError);
        }

        const hasExistingProfileDetails = Boolean(existingUser?.email && existingUser?.name);
        const token = await issuePhoneVerificationToken(normalizedPhone);
        return NextResponse.json(
          {
            message: hasExistingProfileDetails
              ? "OTP verified."
              : "OTP verified. Please complete your profile details to continue.",
            phone_number: normalizedPhone,
            verification_token: token,
            expires_in_seconds: PHONE_VERIFY_TTL_SECONDS,
            existing_user: existingUser,
            requires_profile_completion: !hasExistingProfileDetails,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          error: "OTP is already verified for this phone. Use /auth/grand-session to create session.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json({ error: "Phone number or email is required." }, { status: 400 });
    }

    if (!otp) {
      return NextResponse.json({ error: "OTP is required." }, { status: 400 });
    }

    if (otp !== DUMMY_SIGNUP_OTP) {
      // Keep email dummy flow unchanged for now.
      return NextResponse.json({ error: "Invalid OTP." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    await ensureAuthUserForOtp(supabaseAdmin, { email });

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

    return NextResponse.json({
      access_token: sessionPayload.access_token,
      refresh_token: sessionPayload.refresh_token,
      user: sessionPayload.user,
      email,
      phone_number: null,
    });
  } catch (error) {
    const message = sanitizeOtpErrorMessage(
      error instanceof Error ? error.message : error,
      "Unable to verify OTP right now. Please try again."
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

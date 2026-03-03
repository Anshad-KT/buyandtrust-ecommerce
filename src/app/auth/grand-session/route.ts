import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type GrandSessionRequestBody = {
  email?: string;
  phone?: string;
  password?: string;
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

  const hasPlusPrefix = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    return "";
  }

  return hasPlusPrefix ? `+${digits}` : digits;
}

function getSyntheticEmailFromPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  return `phone_${digits}@dummy.buyandtrust.local`;
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

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GrandSessionRequestBody;
    const emailInput = normalizeEmail(body?.email);
    const phone = normalizePhoneNumber(body?.phone);
    const password = String(body?.password ?? "").trim();
    const email = emailInput || (phone ? getSyntheticEmailFromPhone(phone) : "");

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone is required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

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

      if (usersInsertError) {
        const status = "code" in usersInsertError ? 500 : 409;
        return NextResponse.json(
          {
            error: "Failed to ensure users row.",
            details: usersInsertError.message,
          },
          { status }
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

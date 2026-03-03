import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const DUMMY_SIGNUP_OTP = "0000";
const PHONE_OTP_REGEX = /^\d{4}$/;
const OTP_KEY_PREFIX = "auth:wa:otp";

type ExistingAuthUser = {
  id: string;
};

type StoredOtpPayload = {
  hash?: string;
  created_at?: string;
};

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

function hashOtp(phoneNumber: string, otp: string, secret: string) {
  return crypto
    .createHash("sha256")
    .update(`${phoneNumber}:${otp}:${secret}`)
    .digest("hex");
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

  return authResp.user.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      phone_number?: string;
      phoneNumber?: string;
      otp?: string;
    };

    const email = normalizeEmail(body?.email);
    const normalizedPhone =
      normalizePhoneNumber(body?.phone_number) || normalizePhoneNumber(body?.phoneNumber);
    const otp = String(body?.otp ?? "").trim();
    const loginEmail = email || (normalizedPhone ? getSyntheticEmailFromPhone(normalizedPhone) : "");

    if (!loginEmail) {
      return NextResponse.json({ error: "Phone number or email is required." }, { status: 400 });
    }

    if (!otp) {
      return NextResponse.json({ error: "OTP is required." }, { status: 400 });
    }

    if (normalizedPhone) {
      if (!PHONE_OTP_REGEX.test(otp)) {
        return NextResponse.json({ error: "Please enter a valid 4-digit OTP." }, { status: 400 });
      }
      try {
        await verifyPhoneOtpFromRedis(normalizedPhone, otp);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid OTP.";
        return NextResponse.json({ error: message }, { status: 401 });
      }
    } else if (otp !== DUMMY_SIGNUP_OTP) {
      // Keep email dummy flow unchanged for now.
      return NextResponse.json({ error: "Invalid OTP." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    await ensureAuthUserForOtp(supabaseAdmin, {
      email: loginEmail,
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    });

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: loginEmail,
    });

    if (linkError) {
      return NextResponse.json(
        { error: linkError.message || "Failed to generate login link." },
        { status: 400 }
      );
    }

    const tokenHash = linkData?.properties?.hashed_token;
    if (!tokenHash) {
      return NextResponse.json({ error: "Missing token hash." }, { status: 500 });
    }

    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });

    if (verifyError) {
      return NextResponse.json(
        { error: verifyError.message || "Failed to verify OTP." },
        { status: 400 }
      );
    }

    const accessToken = verifyData?.session?.access_token;
    const refreshToken = verifyData?.session?.refresh_token;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Session tokens were not generated." }, { status: 500 });
    }

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: verifyData?.user ?? null,
      email: normalizedPhone ? null : loginEmail,
      phone_number: normalizedPhone || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error during OTP verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

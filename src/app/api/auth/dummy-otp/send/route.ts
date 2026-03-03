import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const OTP_TTL_SECONDS = 10 * 60;
const OTP_LENGTH = 4;
const OTP_KEY_PREFIX = "auth:wa:otp";
const DEFAULT_TEMPLATE_NAME = "duxbe_store_otp";
const DEFAULT_TEMPLATE_LANGUAGE = "en_US";

type StoredOtpPayload = {
  hash: string;
  created_at: string;
};

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

  return hasPlusPrefix ? `+${digits}` : `+${digits}`;
}

function toWhatsappRecipient(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
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

function generateOtp() {
  const maxValue = 10 ** OTP_LENGTH;
  return crypto.randomInt(0, maxValue).toString().padStart(OTP_LENGTH, "0");
}

async function sendWhatsappTemplateOtp(params: {
  to: string;
  otp: string;
  accessToken: string;
  phoneNumberId: string;
}) {
  const templateName = (process.env.WA_OTP_TEMPLATE_NAME || DEFAULT_TEMPLATE_NAME).trim();
  const templateLanguage = (process.env.WA_OTP_TEMPLATE_LANG || DEFAULT_TEMPLATE_LANGUAGE).trim();
  const contextText = (process.env.WA_OTP_CONTEXT_TEXT || "Buy and Trust").trim();
  const validityText = (process.env.WA_OTP_VALIDITY_TEXT || "10 minutes").trim();
  const supportPhone = (process.env.WA_OTP_SUPPORT_PHONE || "").trim();
  const includeUrlButton = (process.env.WA_OTP_INCLUDE_URL_BUTTON || "true").trim().toLowerCase() !== "false";
  const rawButtonParam = (process.env.WA_OTP_BUTTON_URL_PARAM || "{otp}").trim();
  const graphVersion = (process.env.WA_GRAPH_VERSION || "v22.0").trim();

  const endpoint = `https://graph.facebook.com/${graphVersion}/${params.phoneNumberId}/messages`;
  const headers = {
    Authorization: `Bearer ${params.accessToken}`,
    "Content-Type": "application/json",
  };

  const resolvedSupportPhone = supportPhone || `+${params.to}`;
  const resolvedButtonParam = rawButtonParam
    .replaceAll("{otp}", params.otp)
    .replaceAll("{phone}", `+${params.to}`);
  const components: Array<Record<string, unknown>> = [
    {
      type: "body",
      parameters: [
        { type: "text", text: params.otp },
        { type: "text", text: contextText },
        { type: "text", text: validityText },
        { type: "text", text: resolvedSupportPhone },
      ],
    },
  ];

  if (includeUrlButton) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: resolvedButtonParam }],
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    to: params.to,
    type: "template",
    template: {
      name: templateName,
      language: { code: templateLanguage },
      components,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const errorBody = await response.text().catch(() => "");
  throw new Error(`WhatsApp API error (${response.status}): ${errorBody || response.statusText}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      phone_number?: string;
      phoneNumber?: string;
    };

    const normalizedPhone =
      normalizePhoneNumber(body?.phone_number) || normalizePhoneNumber(body?.phoneNumber);

    if (!normalizedPhone) {
      return NextResponse.json({ error: "Valid phone number is required." }, { status: 400 });
    }

    const accessToken = (process.env.FACEBOOK_ACCESS_TOKEN || "").trim();
    const phoneNumberId = (process.env.WA_PHONE_NUMBER_ID || "").trim();

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: "Missing WhatsApp credentials. Set FACEBOOK_ACCESS_TOKEN and WA_PHONE_NUMBER_ID." },
        { status: 500 }
      );
    }

    const otp = generateOtp();
    const otpHashSecret = getOtpHashSecret();
    const otpHash = hashOtp(normalizedPhone, otp, otpHashSecret);

    const redis = getRedisClient();
    const otpKey = getOtpKey(normalizedPhone);
    const payload: StoredOtpPayload = {
      hash: otpHash,
      created_at: new Date().toISOString(),
    };

    await redis.set(otpKey, payload, { ex: OTP_TTL_SECONDS });

    const waRecipient = toWhatsappRecipient(normalizedPhone);
    try {
      await sendWhatsappTemplateOtp({
        to: waRecipient,
        otp,
        accessToken,
        phoneNumberId,
      });
    } catch (sendError) {
      await redis.del(otpKey);
      throw sendError;
    }

    const responseBody: Record<string, unknown> = {
      message: "OTP sent via WhatsApp.",
      phone_number: normalizedPhone,
      ttl_seconds: OTP_TTL_SECONDS,
    };

    if (process.env.NODE_ENV !== "production") {
      responseBody.debug_otp = otp;
    }

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while sending OTP.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

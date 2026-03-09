import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_STORE_NAME = "Buy and Trust";
const DEFAULT_TEMPLATE_NAME = "duxbe_store_order_confirmation";
const DEFAULT_TEMPLATE_LANGUAGE = "en_US";
const DEFAULT_GRAPH_VERSION = "v22.0";
const ALLOWED_ORDER_CONFIRMATION_BUSINESS_ID = "e6d8d773-6f3f-4383-9439-26169e4624ee";

type UsersRow = {
  email: string | null;
  phone: string | null;
  name: string | null;
};

type OrderRow = {
  sale_id: string | null;
  sale_invoice: string | null;
  total_amount: number | string | null;
  created_at: string | null;
  business_id?: string | null;
  platform?: string | null;
};

type DeliveryResult = {
  sent: boolean;
  provider_id?: string;
  skipped_reason?: string;
  error?: string;
};

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

function normalizeUserId(input: unknown): string {
  return String(input ?? "").trim();
}

function normalizeBusinessId(input: unknown): string {
  return String(input ?? "").trim();
}

function sanitizeSyntheticEmail(input: string | null | undefined): string | null {
  const normalized = String(input || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return /^phone_\d+@dummy\.buyandtrust\.local$/i.test(normalized) ? null : normalized;
}

function normalizePhoneNumber(input: unknown): string | null {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return null;
  }

  return `+${digits}`;
}

function toWhatsappRecipient(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
}

function pickString(...values: unknown[]): string | null {
  const candidate = values.find((value) => typeof value === "string" && String(value).trim().length > 0);
  if (!candidate || typeof candidate !== "string") {
    return null;
  }

  return candidate.trim();
}

function parseAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "").trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatAmountForTemplate(value: unknown): string {
  const amount = parseAmount(value);
  if (amount === null) {
    return "INR 0";
  }

  const hasDecimals = Math.abs(amount % 1) > Number.EPSILON;
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return `INR ${formatter.format(amount)}`;
}

async function getUserContactDetails(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string
) {
  const { data: usersData, error: usersError } = await supabaseAdmin
    .from("users")
    .select("email,phone,name")
    .eq("user_id", userId)
    .maybeSingle();

  if (usersError) {
    throw new Error(usersError.message || "Failed to fetch user contact details.");
  }

  const userRow = (usersData as UsersRow | null) || null;

  let authEmail: string | null = null;
  let authPhone: string | null = null;
  let authName: string | null = null;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (!authError && authData?.user) {
    const metadata = (authData.user.user_metadata || {}) as Record<string, unknown>;

    authEmail = sanitizeSyntheticEmail(authData.user.email || null);
    authPhone = normalizePhoneNumber(pickString(authData.user.phone, metadata.phone_number));
    authName = pickString(metadata.user_name, metadata.name, metadata.full_name);
  }

  return {
    email: sanitizeSyntheticEmail(userRow?.email || null) || authEmail,
    phone: normalizePhoneNumber(userRow?.phone || null) || authPhone,
    name: pickString(userRow?.name, authName),
  };
}

async function getLatestOrderForUser(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string,
  businessId: string
): Promise<OrderRow | null> {
  const candidates = [
    { table: "minimal_sale_view", select: "sale_id,sale_invoice,total_amount,created_at,business_id,platform" },
    { table: "sale_view", select: "sale_id,sale_invoice,total_amount,created_at,business_id,platform" },
    { table: "sale", select: "sale_id,sale_invoice,total_amount,created_at,business_id,platform" },
  ];

  for (const candidate of candidates) {
    let query = supabaseAdmin
      .from(candidate.table)
      .select(candidate.select)
      .eq("customer_id", userId)
      .eq("platform", "E-commerce")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1);

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      return data as unknown as OrderRow;
    }

    if (error) {
      console.warn(`Order lookup failed in ${candidate.table}:`, error.message || error);
    }
  }

  return null;
}

async function sendOrderConfirmationEmail(params: {
  to: string;
  storeName: string;
  orderId: string;
  amountText: string;
}): Promise<DeliveryResult> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    return {
      sent: false,
      skipped_reason: "Missing RESEND_API_KEY.",
    };
  }

  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || "onboarding@resend.dev"
  ).trim();

  const subject = `Order Confirmed - ${params.orderId}`;
  const text = [
    "Order Confirmed",
    "",
    "Hi,",
    `Your order has been successfully placed with ${params.storeName}.`,
    `Order ID: ${params.orderId}`,
    `Total Amount: ${params.amountText}`,
    "",
    "We will notify you when your order is shipped.",
    "Thank you for shopping with us!",
  ].join("\n");

  const html = [
    "<h2>Order Confirmed</h2>",
    "<p>Hi,</p>",
    `<p>Your order has been successfully placed with <strong>${params.storeName}</strong>.</p>`,
    `<p><strong>Order ID:</strong> ${params.orderId}<br/><strong>Total Amount:</strong> ${params.amountText}</p>`,
    "<p>We will notify you when your order is shipped.</p>",
    "<p>Thank you for shopping with us!</p>",
  ].join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [params.to],
      subject,
      text,
      html,
    }),
  });

  const rawBody = await response.text();
  let parsedBody: Record<string, unknown> | null = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    const details = parsedBody ? JSON.stringify(parsedBody) : rawBody || response.statusText;
    return {
      sent: false,
      error: `Resend API error (${response.status}): ${details}`,
    };
  }

  const providerId = parsedBody && typeof parsedBody.id === "string" ? parsedBody.id : undefined;
  return {
    sent: true,
    ...(providerId ? { provider_id: providerId } : {}),
  };
}

async function sendOrderConfirmationWhatsapp(params: {
  phone: string;
  storeName: string;
  orderId: string;
  amountText: string;
}): Promise<DeliveryResult> {
  const accessToken = String(process.env.FACEBOOK_ACCESS_TOKEN || "").trim();
  const phoneNumberId = String(process.env.WA_PHONE_NUMBER_ID || "").trim();

  if (!accessToken || !phoneNumberId) {
    return {
      sent: false,
      skipped_reason: "Missing WhatsApp credentials. Set FACEBOOK_ACCESS_TOKEN and WA_PHONE_NUMBER_ID.",
    };
  }

  const templateName =
    String(process.env.WA_ORDER_CONFIRMATION_TEMPLATE_NAME || DEFAULT_TEMPLATE_NAME).trim() ||
    DEFAULT_TEMPLATE_NAME;
  const templateLanguage =
    String(process.env.WA_ORDER_CONFIRMATION_TEMPLATE_LANG || DEFAULT_TEMPLATE_LANGUAGE).trim() ||
    DEFAULT_TEMPLATE_LANGUAGE;
  const graphVersion = String(process.env.WA_GRAPH_VERSION || DEFAULT_GRAPH_VERSION).trim() || DEFAULT_GRAPH_VERSION;
  const endpoint = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

  const headerImageLink = String(process.env.WA_ORDER_CONFIRMATION_HEADER_IMAGE_URL || "").trim();

  const components: Array<Record<string, unknown>> = [
    {
      type: "body",
      parameters: [
        { type: "text", text: params.storeName },
        { type: "text", text: params.orderId },
        { type: "text", text: params.amountText },
      ],
    },
  ];

  if (headerImageLink) {
    components.unshift({
      type: "header",
      parameters: [
        {
          type: "image",
          image: {
            link: headerImageLink,
          },
        },
      ],
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    to: toWhatsappRecipient(params.phone),
    type: "template",
    template: {
      name: templateName,
      language: { code: templateLanguage },
      components,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  let parsedBody: Record<string, unknown> | null = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    const details = parsedBody ? JSON.stringify(parsedBody) : rawBody || response.statusText;
    return {
      sent: false,
      error: `WhatsApp API error (${response.status}): ${details}`,
    };
  }

  let providerId: string | undefined;
  const maybeMessages = parsedBody ? (parsedBody.messages as unknown) : null;
  if (Array.isArray(maybeMessages) && maybeMessages.length > 0) {
    const first = maybeMessages[0] as { id?: unknown };
    if (typeof first?.id === "string") {
      providerId = first.id;
    }
  }

  return {
    sent: true,
    ...(providerId ? { provider_id: providerId } : {}),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      user_id?: string;
      userId?: string;
      business_id?: string;
      businessId?: string;
    };

    const userId = normalizeUserId(body?.user_id || body?.userId);
    const businessId = normalizeBusinessId(body?.business_id || body?.businessId);

    if (!userId || !businessId) {
      return NextResponse.json({ error: "user_id and business_id are required." }, { status: 400 });
    }

    if (businessId !== ALLOWED_ORDER_CONFIRMATION_BUSINESS_ID) {
      return NextResponse.json(
        {
          error: "Order confirmation is not enabled for this business_id.",
          business_id: businessId,
        },
        { status: 403 }
      );
    }
    if(userId != "0648f150-e16d-4d1d-be85-07577f684e4a"){
      return NextResponse.json(
        {
          error: "Order confirmation is not enabled for this user_id.",
          user_id: userId,
        },
        { status: 403 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const contact = await getUserContactDetails(supabaseAdmin, userId);

    if (!contact.email && !contact.phone) {
      return NextResponse.json(
        {
          error: "No email or phone number found for this user.",
          user_id: userId,
        },
        { status: 400 }
      );
    }

    const latestOrder = await getLatestOrderForUser(supabaseAdmin, userId, businessId);
    if (!latestOrder) {
      return NextResponse.json(
        {
          error: "No e-commerce order found for this user.",
          user_id: userId,
        },
        { status: 404 }
      );
    }

    const storeName = String(process.env.ORDER_CONFIRMATION_STORE_NAME || DEFAULT_STORE_NAME).trim() || DEFAULT_STORE_NAME;
    const orderId = String(latestOrder.sale_invoice || latestOrder.sale_id || "N/A").trim() || "N/A";
    const amountText = formatAmountForTemplate(latestOrder.total_amount);

    const emailResult = contact.email
      ? await sendOrderConfirmationEmail({
          to: contact.email,
          storeName,
          orderId,
          amountText,
        })
      : {
          sent: false,
          skipped_reason: "User email not found.",
        };

    const whatsappResult = contact.phone
      ? await sendOrderConfirmationWhatsapp({
          phone: contact.phone,
          storeName,
          orderId,
          amountText,
        })
      : {
          sent: false,
          skipped_reason: "User phone number not found.",
        };

    const deliveredAny = emailResult.sent || whatsappResult.sent;

    return NextResponse.json(
      {
        message: deliveredAny
          ? "Order confirmation notification processed."
          : "Order confirmation could not be delivered.",
        user_id: userId,
        order: {
          sale_id: latestOrder.sale_id || null,
          order_id: orderId,
          amount: amountText,
        },
        delivery: {
          email: emailResult,
          whatsapp: whatsappResult,
        },
      },
      { status: deliveredAny ? 200 : 502 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while sending order confirmation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

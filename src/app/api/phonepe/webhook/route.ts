import { NextRequest, NextResponse } from "next/server";
import { Env, StandardCheckoutClient } from "pg-sdk-node";

function getPhonePeClient() {
  const clientId = String(process.env.PHONEPE_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.PHONEPE_CLIENT_SECRET || "").trim();
  const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION || "1");
  const env = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

  if (!clientId || !clientSecret || !Number.isFinite(clientVersion)) {
    return null;
  }

  return StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
}

export async function POST(request: NextRequest) {
  const receivedAt = new Date().toISOString();
  const authorization = String(request.headers.get("authorization") || "").trim();
  const rawBody = await request.text();

  let parsedBody: any = null;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = null;
  }

  const username = String(process.env.PHONEPE_WEBHOOK_USERNAME || "").trim();
  const password = String(process.env.PHONEPE_WEBHOOK_PASSWORD || "").trim();
  const client = getPhonePeClient();

  let callbackResponse: any = null;
  let callbackValidated: boolean | null = null;

  if (username && password && client) {
    try {
      callbackResponse = client.validateCallback(username, password, authorization, rawBody);
      callbackValidated = true;
    } catch (error: any) {
      callbackValidated = false;
      console.error("[phonepe-webhook] Callback validation failed", {
        receivedAt,
        message: error?.message || "Unknown validation error",
      });

      return NextResponse.json(
        { ok: false, received: true, error: "Invalid PhonePe callback" },
        { status: 401 }
      );
    }
  }

  const event = String(parsedBody?.event || "").trim();
  const callbackTypeRaw = callbackResponse?.type ?? parsedBody?.type ?? null;
  const callbackType = String(callbackTypeRaw ?? "").trim();
  const payloadState = String(
    callbackResponse?.payload?.state || parsedBody?.payload?.state || parsedBody?.state || ""
  ).trim();
  const merchantOrderId = String(
    callbackResponse?.payload?.merchantOrderId ||
      callbackResponse?.payload?.originalMerchantOrderId ||
      parsedBody?.payload?.merchantOrderId ||
      parsedBody?.payload?.originalMerchantOrderId ||
      parsedBody?.merchantOrderId ||
      parsedBody?.originalMerchantOrderId ||
      ""
  ).trim();
  const orderId = String(
    callbackResponse?.payload?.orderId || parsedBody?.payload?.orderId || parsedBody?.orderId || ""
  ).trim();

  console.log("[phonepe-webhook] Fired", {
    receivedAt,
    event: event || null,
    callbackType: callbackType || null,
    payloadState: payloadState || null,
    merchantOrderId: merchantOrderId || null,
    orderId: orderId || null,
    authPresent: Boolean(authorization),
    callbackValidated,
  });

  const isCompleted =
    event === "checkout.order.completed" ||
    callbackType === "CHECKOUT_ORDER_COMPLETED" ||
    callbackType === "PG_ORDER_COMPLETED" ||
    callbackTypeRaw === 6 ||
    callbackTypeRaw === 0 ||
    payloadState.toUpperCase() === "COMPLETED";

  if (isCompleted) {
    console.log("[phonepe-webhook] ORDER COMPLETED", {
      receivedAt,
      event: event || null,
      callbackType: callbackType || null,
      merchantOrderId: merchantOrderId || null,
      orderId: orderId || null,
      payloadState: payloadState || null,
    });
  }

  return NextResponse.json(
    {
      ok: true,
      received: true,
      event: event || null,
      merchantOrderId: merchantOrderId || null,
      orderId: orderId || null,
      callbackValidated,
    },
    { status: 200 }
  );
}

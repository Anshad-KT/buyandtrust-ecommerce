import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const TARGET_BUSINESS_ID = "e6d8d773-6f3f-4383-9439-26169e4624ee";
const REDIS_TTL_SECONDS = 30;

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }

  return new Redis({ url, token });
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const record =
      body && typeof body === "object" && "record" in body
        ? (body as { record?: unknown }).record
        : undefined;

    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return NextResponse.json({ error: "Invalid payload: record is required." }, { status: 400 });
    }

    const itemId = (record as { item_id?: unknown }).item_id;
    const businessId = (record as { business_id?: unknown }).business_id;

    if (typeof itemId !== "string" || typeof businessId !== "string") {
      return NextResponse.json(
        { error: "Invalid payload: record.item_id and record.business_id must be strings." },
        { status: 400 }
      );
    }

    if (businessId !== TARGET_BUSINESS_ID) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const redis = getRedisClient();
    const itemKey = `items:${businessId}:${itemId}`;
    const itemIdsKey = `items:${businessId}:ids`;

    await Promise.all([
      redis.set(itemKey, record, { ex: REDIS_TTL_SECONDS }),
      redis.sadd(itemIdsKey, itemId),
      redis.expire(itemIdsKey, REDIS_TTL_SECONDS),
    ]);

    return NextResponse.json({ ok: true, key: itemKey }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to sync item create event to Redis:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

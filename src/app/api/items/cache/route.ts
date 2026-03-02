import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const TARGET_BUSINESS_ID = "e6d8d773-6f3f-4383-9439-26169e4624ee";
const REDIS_IDS_KEY = `items:${TARGET_BUSINESS_ID}:ids`;
const REDIS_READ_BATCH_SIZE = 200;
const REDIS_WRITE_BATCH_SIZE = 100;
const REDIS_TTL_SECONDS = 30;

type ItemRecord = {
  item_id: string;
  business_id: string;
  is_active?: boolean | null;
  item_category_id?: string | null;
  item_code?: string | null;
  [key: string]: unknown;
};

function getRedisClient() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "").trim();

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

function getItemKey(itemId: string) {
  return `items:${TARGET_BUSINESS_ID}:${itemId}`;
}

function isItemRecord(value: unknown): value is ItemRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as { item_id?: unknown; business_id?: unknown };
  return typeof candidate.item_id === "string" && typeof candidate.business_id === "string";
}

function filterItems(items: ItemRecord[], categoryId: string | null) {
  const activeItems = items.filter(
    (item) => item.business_id === TARGET_BUSINESS_ID && item.is_active !== false
  );

  if (!categoryId) {
    return activeItems;
  }

  return activeItems.filter((item) => item.item_category_id === categoryId);
}

async function getItemsFromRedis(redis: Redis) {
  const ids = await redis.smembers(REDIS_IDS_KEY);
  if (!Array.isArray(ids) || ids.length === 0) {
    return [] as ItemRecord[];
  }

  const itemIds = ids.filter((value): value is string => typeof value === "string");
  if (itemIds.length === 0) {
    return [] as ItemRecord[];
  }

  const values: unknown[] = [];
  for (let index = 0; index < itemIds.length; index += REDIS_READ_BATCH_SIZE) {
    const chunk = itemIds.slice(index, index + REDIS_READ_BATCH_SIZE);
    const chunkValues = await redis.mget(...chunk.map((itemId) => getItemKey(itemId)));
    if (Array.isArray(chunkValues) && chunkValues.length > 0) {
      values.push(...chunkValues);
    }
  }

  if (values.length === 0) {
    return [];
  }

  return values.filter(isItemRecord);
}

async function saveItemsToRedis(
  redis: Redis,
  items: ItemRecord[],
  options?: { replace?: boolean }
) {
  const replace = options?.replace === true;
  const validItems = items.filter(
    (item) => item.business_id === TARGET_BUSINESS_ID && item.is_active !== false
  );

  if (replace) {
    const existingIds = await redis.smembers(REDIS_IDS_KEY);
    const existingItemIds = Array.isArray(existingIds)
      ? existingIds.filter((value): value is string => typeof value === "string")
      : [];

    if (existingItemIds.length > 0) {
      for (let index = 0; index < existingItemIds.length; index += REDIS_READ_BATCH_SIZE) {
        const chunk = existingItemIds.slice(index, index + REDIS_READ_BATCH_SIZE);
        await redis.del(...chunk.map((itemId) => getItemKey(itemId)));
      }
    }

    await redis.del(REDIS_IDS_KEY);
  }

  for (let index = 0; index < validItems.length; index += REDIS_WRITE_BATCH_SIZE) {
    const chunk = validItems.slice(index, index + REDIS_WRITE_BATCH_SIZE);
    const pipeline = redis.pipeline();

    for (const item of chunk) {
      pipeline.set(getItemKey(item.item_id), item, { ex: REDIS_TTL_SECONDS });
      pipeline.sadd(REDIS_IDS_KEY, item.item_id);
    }
    pipeline.expire(REDIS_IDS_KEY, REDIS_TTL_SECONDS);

    await pipeline.exec();
  }

  return validItems.length;
}

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get("category_id");
    const itemCode = request.nextUrl.searchParams.get("item_code");
    const redis = getRedisClient();

    if (!redis) {
      return NextResponse.json(
        { error: "redis_not_configured" },
        { status: 503 }
      );
    }

    try {
      const items = await getItemsFromRedis(redis);
      if (items.length === 0) {
        return NextResponse.json(
          { error: "redis_cache_miss" },
          { status: 503 }
        );
      }

      const filteredItems = filterItems(items, categoryId);

      if (itemCode) {
        const normalizedItemCode = itemCode.trim().toLowerCase();
        const matchedItem = filteredItems.find(
          (item) =>
            typeof item.item_code === "string" &&
            item.item_code.trim().toLowerCase() === normalizedItemCode
        );

        if (!matchedItem) {
          return NextResponse.json(
            { error: "redis_item_not_found" },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            source: "redis",
            cached: true,
            data: matchedItem,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          source: "redis",
          cached: true,
          count: filteredItems.length,
          data: filteredItems,
        },
        { status: 200 }
      );
    } catch (redisError: unknown) {
      const message = redisError instanceof Error ? redisError.message : "redis_request_failed";
      console.error("Redis cache read failed:", redisError);
      return NextResponse.json(
        {
          error: "redis_request_failed",
          message,
        },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    console.error("Failed to read items from cache:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ error: "redis_not_configured" }, { status: 503 });
    }

    const body: unknown = await request.json();
    const payload =
      body && typeof body === "object" && !Array.isArray(body) ? body : {};

    const inputItems = (payload as { items?: unknown }).items;
    const replace = (payload as { replace?: unknown }).replace === true;

    if (!Array.isArray(inputItems)) {
      return NextResponse.json({ error: "items_array_required" }, { status: 400 });
    }

    const records = inputItems.filter(isItemRecord);
    const written = await saveItemsToRedis(redis, records, { replace });

    return NextResponse.json(
      {
        ok: true,
        source: "redis",
        written,
        replace,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Redis cache write failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "redis_write_failed", message },
      { status: 503 }
    );
  }
}

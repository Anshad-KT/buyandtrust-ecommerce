import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ExistingAuthUser = {
  id: string;
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      phone?: string;
      phone_number?: string;
      phoneNumber?: string;
    };

    const email = normalizeEmail(body?.email);
    const phone =
      normalizePhoneNumber(body?.phone) ||
      normalizePhoneNumber(body?.phone_number) ||
      normalizePhoneNumber(body?.phoneNumber);

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

    return NextResponse.json(
      {
        exists: !!existingUser?.id,
        customer_id: existingUser?.id || null,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `An error occurred: ${message}` }, { status: 500 });
  }
}


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
      return NextResponse.json(
        {
          message: "Customer already exists",
          customer_id: existingUser.id,
        },
        { status: 200 }
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

    return NextResponse.json(
      {
        message: "Customer created successfully",
        customer_id: authResp.user.id,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `An error occurred: ${message}` }, { status: 500 });
  }
}

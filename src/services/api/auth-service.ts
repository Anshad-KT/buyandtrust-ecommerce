import { Supabase } from "./utils";
import "../interceptor";
import axios from "axios";

export class AuthService extends Supabase {
    private readonly ecommerceBusinessId = "e6d8d773-6f3f-4383-9439-26169e4624ee";

    constructor() {
        super();
    }
    private buildAuthCallbackUrl(nextPath: string = "/"): string {
        const baseRedirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000/auth/callback";
        const redirectUrl = new URL(baseRedirectUrl);
        if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
            redirectUrl.searchParams.set("next", nextPath);
        }
        return redirectUrl.toString();
    }

    private normalizePhoneNumber(input: string): string {
        const raw = String(input || "").trim();
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

    private normalizeEmail(input: string): string {
        return String(input || "").trim().toLowerCase();
    }

    private async checkAuth(): Promise<boolean> {
        const { session } = (await this.supabase.auth.getSession()).data;
        return !!session?.access_token;
    }

    private async ensureAuthenticated() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            throw new Error("Authentication required. Please log in.");
        }
    }

    // async verify_user_password(password: string) {
    //     const { data, error } = await this.supabase.rpc("verify_user_password", { password });
    //     if (error) {
    //         return false;
    //     }

    //     return data;
    // }



    async signupWithEmail(email: string, nextPath: string = "/") {
      
        const { data, error } = await this.supabase.auth.signInWithOtp({
            email,
            options: {
                // shouldCreateUser: false,
                emailRedirectTo: this.buildAuthCallbackUrl(nextPath),

            }
        });
        if (error) {
            throw new Error("An Error Occurred");
        }
    
        return data;
    }

    async createGrandSession(params: { phone?: string; email?: string; password?: string }) {
        const normalizedPhone = params.phone ? this.normalizePhoneNumber(params.phone) : "";
        const normalizedEmail = params.email ? this.normalizeEmail(params.email) : "";
        const normalizedPassword = String(params.password || "").trim();

        if (!normalizedPhone && !normalizedEmail) {
            throw new Error("Either phone or email is required");
        }

        const response = await fetch("/auth/grand-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(normalizedPhone ? { phone: normalizedPhone } : {}),
                ...(normalizedEmail ? { email: normalizedEmail } : {}),
                ...(normalizedPassword ? { password: normalizedPassword } : {}),
            }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
            message?: string;
            customer_id?: string;
            error?: string;
            details?: string;
        };

        if (!response.ok) {
            const errorMessage = payload?.details || payload?.error || "Failed to create or fetch customer.";
            throw new Error(errorMessage);
        }

        return payload;
    }

    async checkUserExists(params: { email?: string; phone?: string }) {
        const normalizedEmail = params.email ? this.normalizeEmail(params.email) : "";
        const normalizedPhone = params.phone ? this.normalizePhoneNumber(params.phone) : "";

        if (!normalizedEmail && !normalizedPhone) {
            throw new Error("Either email or phone is required");
        }

        const response = await fetch("/api/auth/check-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(normalizedEmail ? { email: normalizedEmail } : {}),
                ...(normalizedPhone ? { phone: normalizedPhone } : {}),
            }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
            exists?: boolean;
            customer_id?: string | null;
            error?: string;
            details?: string;
        };

        if (!response.ok) {
            const errorMessage = payload?.details || payload?.error || "Failed to check user existence.";
            throw new Error(errorMessage);
        }

        return {
            exists: payload?.exists === true,
            customer_id: payload?.customer_id || null,
        };
    }

    async upserBusinessCustomer(params: {
        customerId: string;
        name?: string;
        image?: string | null;
        address?: string | null;
        customerBalance?: number;
        customFields?: Array<{ field_id: string; value: string | number | boolean | null }>;
    }) {
        const customerId = String(params.customerId || "").trim();
        const customerName = String(params.name || "").trim() || "Customer";

        if (!customerId) {
            throw new Error("customer_id is required to upsert business customer.");
        }

        let orgId: string | null = null;
        const { data: businessData, error: businessError } = await this.supabase
            .from("businesses")
            .select("org_id")
            .eq("business_id", this.ecommerceBusinessId)
            .maybeSingle();

        if (businessError) {
            console.warn("Unable to fetch business org_id before customer upsert:", businessError);
        } else {
            orgId = (businessData as { org_id?: string | null } | null)?.org_id || null;
        }

        const customerBalance =
            typeof params.customerBalance === "number" && Number.isFinite(params.customerBalance)
                ? params.customerBalance
                : 0;

        const p_customer_data = {
            business_id: this.ecommerceBusinessId,
            customer_id: customerId,
            name: customerName,
            image: params.image ?? null,
            address: params.address ?? null,
            org_id: orgId,
            customer_balance: customerBalance,
        };

        const p_custom_fields = Array.isArray(params.customFields) ? params.customFields : null;

        const { error } = await this.supabase.rpc("upsert_business_customer", {
            p_customer_data,
            p_custom_fields,
        });

        if (error) {
            throw new Error(error.message || "Failed to upsert business customer.");
        }
    }

    async signInWithEmailPassword(email: string, password: string) {
        const normalizedEmail = this.normalizeEmail(email);
        const normalizedPassword = String(password || "").trim();

        if (!normalizedEmail) {
            throw new Error("Email is required");
        }

        if (!normalizedPassword) {
            throw new Error("Password is required");
        }

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: normalizedPassword,
        });

        if (error) {
            throw new Error(error.message || "Failed to sign in");
        }

        return data;
    }

    async startDummyEmailSignup(email: string) {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        if (!normalizedEmail) {
            throw new Error("Email is required");
        }
        return {
            email: normalizedEmail,
            otp: "0000",
        };
    }

    async verifyDummyEmailOtp(email: string, otp: string, password?: string) {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const normalizedOtp = String(otp || "").trim();
        const normalizedPassword = String(password || "").trim();

        if (!normalizedEmail) {
            throw new Error("Email is required");
        }

        if (!normalizedOtp) {
            throw new Error("OTP is required");
        }

        const response = await fetch("/api/auth/dummy-otp/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: normalizedEmail,
                otp: normalizedOtp,
            }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
            access_token?: string;
            refresh_token?: string;
            error?: string;
            user?: any;
        };

        if (!response.ok) {
            throw new Error(payload?.error || "Failed to verify OTP");
        }

        if (!payload.access_token || !payload.refresh_token) {
            throw new Error("Session tokens missing from OTP verification response");
        }

        const { error: sessionError } = await this.supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
        });

        if (sessionError) {
            throw new Error(sessionError.message || "Failed to create session");
        }

        if (normalizedPassword) {
            const { error: passwordError } = await this.supabase.auth.updateUser({
                password: normalizedPassword,
            });

            if (passwordError) {
                throw new Error(passwordError.message || "Failed to set account password");
            }
        }

        return payload;
    }

    async startDummyPhoneSignup(phoneNumber: string) {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        if (!normalizedPhone) {
            throw new Error("Please enter a valid phone number");
        }

        const response = await fetch("/api/auth/dummy-otp/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone_number: normalizedPhone,
            }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
            phone_number?: string;
            ttl_seconds?: number;
            message?: string;
            debug_otp?: string;
            error?: string;
        };

        if (!response.ok) {
            throw new Error(payload?.error || "Failed to send OTP");
        }

        return {
            phone_number: String(payload?.phone_number || normalizedPhone),
            otp: payload?.debug_otp || "",
            ttl_seconds: payload?.ttl_seconds || 600,
            message: payload?.message || "OTP sent",
        };
    }

    async verifyDummyPhoneOtp(phoneNumber: string, otp: string) {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        const normalizedOtp = String(otp || "").trim();

        if (!normalizedPhone) {
            throw new Error("Please enter a valid phone number");
        }

        if (!normalizedOtp) {
            throw new Error("OTP is required");
        }

        const response = await fetch("/api/auth/dummy-otp/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone_number: normalizedPhone,
                otp: normalizedOtp,
            }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
            access_token?: string;
            refresh_token?: string;
            error?: string;
            user?: any;
        };

        if (!response.ok) {
            throw new Error(payload?.error || "Failed to verify OTP");
        }

        if (!payload.access_token || !payload.refresh_token) {
            throw new Error("Session tokens missing from OTP verification response");
        }

        const { error: sessionError } = await this.supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
        });

        if (sessionError) {
            throw new Error(sessionError.message || "Failed to create session");
        }

        const { data: sessionData } = await this.supabase.auth.getSession();
        const currentMetadata = (sessionData?.session?.user?.user_metadata || {}) as Record<string, any>;
        const { error: metadataError } = await this.supabase.auth.updateUser({
            data: {
                ...currentMetadata,
                phone_number: normalizedPhone,
            },
        });

        if (metadataError) {
            throw new Error(metadataError.message || "Failed to persist phone number");
        }

        return payload;
    }

    async ensureCustomerMetadata() {
     
        // Get the current session
        const { session } = (await this.supabase.auth.getSession()).data;
        if (!session || !session.user) return;
    
        const user = session.user;
        const isCustomer = user.user_metadata?.is_customer;
        const platform = user.user_metadata?.platform;
        const userName = user.user_metadata?.user_name;
        const phoneNumber = user.user_metadata?.phone_number;
       
        let updated = false;

        // Update is_customer if not set
        if (!isCustomer) {
            const { data, error } = await this.supabase.auth.updateUser({
                data: { ...user.user_metadata, is_customer: true , platform: "ecommerce"}
            });
            if (error) {
                throw new Error("Failed to update user metadata");
            }
            updated = true;
        }

        // Collect missing fields
        const missingFields = [];
        if (!userName) missingFields.push("user_name");
        if (!phoneNumber) missingFields.push("phone_number");
       
        // Return missing fields so UI can prompt user
        return { updated, missingFields };


    }

    async updateUserMetadata(newData: Record<string, any>) {
        const { session } = (await this.supabase.auth.getSession()).data;
        if (!session || !session.user) throw new Error("No session");
        const user = session.user;

        // Extract phone_number if present
        const { phone_number, ...otherData } = newData;
       
        const { data, error } = await this.supabase.auth.updateUser({
            // Set phone if phone_number is present, otherwise don't overwrite
            ...(phone_number ? { phone: phone_number } : {}),
            data: { ...user.user_metadata, ...otherData, ...(phone_number ? { phone_number } : {}) }

        });
      
        // if (error) throw new Error("Failed to update user metadata");
        if (error) throw error;
        const updatedUser = (data as any)?.user || user;
        const syncedPhone = phone_number ? String(phone_number).trim() : (updatedUser.phone || null);

        // Keep customer record name in sync so profile pages reading customer_view
        // get the latest user-provided name after onboarding modal submission.
        const syncedName = String(
            otherData.user_name ||
            otherData.name ||
            updatedUser.user_metadata?.user_name ||
            updatedUser.user_metadata?.name ||
            (updatedUser.email ? updatedUser.email.split("@")[0] : "") ||
            "Customer"
        ).trim();
        const syncedImage = updatedUser.user_metadata?.picture || updatedUser.user_metadata?.avatar_url || null;
        await this.upsertCustomer(
            updatedUser.id,
            syncedName,
            syncedImage,
            updatedUser.email || null,
            syncedPhone
        );

        const { error: refreshError } = await this.supabase.auth.refreshSession();
        if (refreshError) {
            console.warn("Failed to refresh auth session after metadata update:", refreshError);
        }

        return data;
    }


    // async updateUserMetadata(newData: Record<string, any>) {
    //     const { session } = (await this.supabase.auth.getSession()).data;
    //     if (!session || !session.user) throw new Error("No session");
    //     const user = session.user;
    //     const { data, error } = await this.supabase.auth.updateUser({
    //       data: { ...user.user_metadata, ...newData }
    //     });
    //     if (error) throw new Error("Failed to update user metadata");
    //     return data;
    //   }

    async resendEmail(email: string) {
      
        const { data, error } = await this.supabase.auth.resend({
            type: 'signup',
            email
        });
        if (error) {
            throw new Error("An Error Occurred");
        }
      
        return data;
    }

    async verifyEmailOtp(email: string, token: string) {
       
        const { data, error } = await this.supabase.auth.verifyOtp({
            email,
            token,
            type: "email",

        });
    
        if (error) {
            throw new Error("An Error Occurred");
        }
        return data;
    }

    async signInWithGoogle(nextPath: string = "/") {
     
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: this.buildAuthCallbackUrl(nextPath),
            },

        });


     
        if (error) {
            throw new Error("An Error Occurred");
        }

        return data;
    }

    async forgot_password(email: string) {
     
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:3000/new-password", // URL to handle password reset
        });
        if (error) {
            throw new Error("An Error Occurred");
        }
        
        return data;
    }

    async verify_reset_code(email: string, token: string) {
        const { data, error } = await this.supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
        });
        if (error) {
            throw new Error("An Error Occurred");
        }
        return data;
    }

    // Separate function to handle the redirect after Google authentication
    async handleGoogleAuthRedirect() {
        try {
            
            // Step 2: Get the current session
            const { session } = (await this.supabase.auth.getSession()).data;
         
            if (!session || !session.user || !session.user.email) {
                console.error("No session or email found");
                return { success: false };
            }

            const email = session.user.email;
            const authUserId = session.user.id;
            const name = session.user.user_metadata?.name || email.split("@")[0];
            const image = session.user.user_metadata?.picture || session.user.user_metadata?.avatar_url || null;

          
            // Step 3: Check if the user exists in your users table
            const userExists = await this.check_user_exists_email(email);

            // Step 4: If the user doesn't exist, create them
            if (!userExists) {
                await this.createUserWithEmail(email, authUserId, name, image);
                return { success: true, newUser: true };
            }

            return { success: true, newUser: false };
        } catch (error) {
            console.error("Error in handleGoogleAuthRedirect:", error);
            return { success: false, error };
        }
    }

    // Fix argument order: should be (name, email, password)
    async register_user(name: string, email: string, password: string) {
      
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
    
        if (error) {
            throw new Error(error.message || "Registration failed");
        }
        return data;
    }

    async check_user_exists_email(email_id: string) {
        const { data, error } = await this.supabase.from("users").select("*").eq("email", email_id);
      
        if (error) {
            throw new Error("An Error Occured");
        }
        return data.length === 0 ? false : true;
    }

    // Ensure users row exists before touching customers (customers.customer_id has FK to users).
    private async ensureUserRecordForCustomer(
        customerId: string,
        name?: string,
        image?: string | null,
        emailOverride?: string | null,
        phoneOverride?: string | null
    ) {
        const { data: { session } } = await this.supabase.auth.getSession();
        const sessionUser = session?.user && session.user.id === customerId ? session.user : null;
        const metadata = (sessionUser?.user_metadata || {}) as Record<string, any>;

        const resolvedName = String(
            name ||
            metadata.user_name ||
            metadata.name ||
            (sessionUser?.email ? sessionUser.email.split("@")[0] : "") ||
            "Customer"
        ).trim();
        const resolvedEmail = emailOverride ?? sessionUser?.email ?? null;
        const resolvedPhone = phoneOverride ?? sessionUser?.phone ?? metadata.phone_number ?? null;
        const resolvedImage = image ?? metadata.picture ?? metadata.avatar_url ?? null;

        // Preferred schema used in ecommerce service.
        const preferred = await this.supabase.from("users").upsert(
            {
                user_id: customerId,
                name: resolvedName,
                email: resolvedEmail,
                phone: resolvedPhone,
                image: resolvedImage,
            },
            { onConflict: "user_id" }
        );

        if (!preferred.error || preferred.error.code === "23505") {
            return;
        }

        // Legacy fallback for deployments still using id/email_id/phone_number columns.
        const legacy = await this.supabase.from("users").upsert(
            {
                id: customerId,
                name: resolvedName,
                email_id: resolvedEmail,
                phone_number: resolvedPhone,
                image: resolvedImage,
            },
            { onConflict: "id" }
        );

        if (legacy.error && legacy.error.code !== "23505") {
            console.error("Error ensuring users row for customer:", legacy.error);
            throw new Error(legacy.error.message || "Failed to ensure users row.");
        }
    }

    // Helper method to create or update customer row.
    private async upsertCustomer(
        customerId: string,
        name?: string,
        image?: string | null,
        emailOverride?: string | null,
        phoneOverride?: string | null
    ) {
        await this.ensureUserRecordForCustomer(customerId, name, image, emailOverride, phoneOverride);

        const customerName = (name || "").trim() || "Customer";
        const { error } = await this.supabase.from("customers").upsert(
            {
                customer_id: customerId,
                name: customerName,
                image: image ?? null,
            },
            { onConflict: "customer_id" }
        );
        if (error) {
            console.error("Error upserting customer:", error);
            throw new Error(error.message || "An Error Occured");
        }
    }

    // Helper method to create a user
    async createUserWithEmail(email: string, authUserId: string, name: string, image?: string | null) {
        try {
            console.log(name, "name");

            console.log(authUserId, "authUserId");
            await this.ensureUserRecordForCustomer(authUserId, name, image, email);

            await this.upsertCustomer(authUserId, name, image);

            console.log("User created successfully:", email);
            return { user_id: authUserId };
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("An Error Occurred");
        }
    }

    async login_user(phoneNumber: string) {
        const { data, error } = await this.supabase.auth.signInWithOtp({
            phone: phoneNumber,
        });

        if (error) {
            throw new Error("An Error Occured");
        }
        return data;
    }
    async check_user_exists(phoneNumber: string) {
        const { data, error } = await this.supabase.from("users").select("*").eq("phone_number", phoneNumber);
        if (error) {
            throw new Error("An Error Occured");
        }

        return data.length === 0 ? false : true;
    }
    // async add_user_address(
    //     userId: string,
    //     full_address: string,
    //     landmark: string,
    //     city: string,
    //     state: string,
    //     pincode: string
    // ) {
    //     // Using local storage instead of Supabase
    //     try {
    //         const userAddressStorage = "user_address";
    //         const addressData = JSON.parse(localStorage.getItem(userAddressStorage) || "[]");

    //         const newAddress = {
    //             id: this.generateId(),
    //             full_address: full_address,
    //             landmark: landmark,
    //             city: city,
    //             state: state,
    //             user_id: userId,
    //             pin_code: pincode,
    //             created_at: new Date().toISOString(),
    //         };

    //         addressData.push(newAddress);
    //         localStorage.setItem(userAddressStorage, JSON.stringify(addressData));

    //         console.log("Added new address for user:", userId);
    //         return [newAddress];
    //     } catch (error) {
    //         console.error("Error adding user address:", error);
    //         throw new Error("An Error Occured");
    //     }
    // }

    async update_user_address(
        userId: string,
        full_address: string,
        landmark: string,
        city: string,
        state: string,
        pincode: string
    ) {
        // Using local storage instead of Supabase
        try {
            const userAddressStorage = "user_address";
            const addressData = JSON.parse(localStorage.getItem(userAddressStorage) || "[]");

            const updatedAddressData = addressData.map((address: any) => {
                if (address.user_id === userId) {
                    return {
                        ...address,
                        full_address: full_address,
                        landmark: landmark,
                        city: city,
                        state: state,
                        pin_code: pincode,
                        updated_at: new Date().toISOString(),
                    };
                }
                return address;
            });

            localStorage.setItem(userAddressStorage, JSON.stringify(updatedAddressData));

            console.log("Updated address for user:", userId);
            return updatedAddressData.filter((address: any) => address.user_id === userId);
        } catch (error) {
            console.error("Error updating user address:", error);
            throw new Error("An Error Occured");
        }
    }
    async get_user_address(userId: string) {
        // this.ensureAuthenticated()
        const { data, error } = await this.supabase.from("user_address").select("*").eq("customer_id", userId).single();
        if (error) {
            throw new Error("An Error Occured");
        }
        return data;
    }
    async get_user() {
        this.ensureAuthenticated();
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", await this.getUserId())
            .single();
        if (error) {
            throw new Error("An Error Occured");
        }
        return data;
    }
    async create_user(phoneNumber: string, name: string, userId: string) {
        const { data, error } = await this.supabase.from("users").insert({
            phone_number: phoneNumber,
            name: name,
            id: userId,
        }   );
        if (error) {
            throw new Error("An Error Occured");
        }
        await this.upsertCustomer(userId, name, null);
        return data;
    }
    async verify_otp(otp: string, phoneNumber: string) {
        const { data, error } = await this.supabase.auth.verifyOtp({
            phone: phoneNumber.startsWith("+91") ? phoneNumber : "+91" + phoneNumber,
            token: otp,
            type: "sms",
        });

        if (error) {
            throw new Error("An Error Occured");
        }
        return data;
    }
    async reset_password(email: string) {
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:3000/login/forgotPassword/reset", // URL to handle password reset
        });
        if (error) {
            throw new Error("An Error Occured");
        }
        return data;
    }
    async invite_user(email: string, password: string, mobileNumber: string, role: string, fullName: string) {
        try {
            // Define the URL of your Supabase Edge Function
            const edgeFunctionUrl = "https://fjlihsqbnpyfaiktbuyt.supabase.co/functions/v1/reset-link";

            // Send a POST request to the Edge Function
            const response = await axios.post(edgeFunctionUrl, {
                email,
                password,
                mobileNumber,
                role,
                fullName,
            });

            // Extract the data from the response
            const { data } = response;

            // If the response contains an error, throw it
            if (data.error) {
                throw new Error(data.error);
            }

            // Return the generated link or other relevant data
            return data;
        } catch (error) {
            // Log the error for debugging purposes
            console.error("Error inviting user:", error);

            // Throw a generic error message or rethrow the error
            throw new Error("An error occurred while inviting the user");
        }
    }
    async change_authenticated_password(password: string) {
        const { data, error } = await this.supabase.auth.updateUser({
            password,
        });

        if (error) {
            throw new Error("An Error Occured");
        }
        return data;
    }
    async change_password(password: string, accessToken: string) {
        const { error } = await this.supabase.auth.updateUser({
            password,
        });

        if (error) {
            throw new Error("An Error Occured");
        }
    }
    async userVerify(email: string) {
        const { data, error } = await this.supabase.from("users").select("*").eq("email", email);

        if (error) {
            return false;
        }

        return data;
    }
    async userLogin(email: string, password: string) {
        const result = await this.userVerify(email);
        if (!result) {
            throw new Error("invalid credentials");
        }

        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        return error || data;
    }

    async userLogout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
        return error;
    }

    async isUserActive() {
        const { session } = (await this.supabase.auth.getSession()).data;
        return session;
    }
    async getActiveUser() {
        const result = (await this.supabase.auth.getSession()).data;
        return result;
    }
    async getUserId() {
        const { session } = (await this.supabase.auth.getSession()).data;
        return session?.user.id;
    }
    async updateUserDetails(name: string, phoneNumber: string) {
        const { data, error } = await this.supabase
            .from("users")
            .update({
                name,
                phone_number: phoneNumber,
            })
            .eq("id", await this.getUserId());

        if (error) {
            console.log(error, "eeeeeeeeeeee");
            throw new Error("An Error Occured");
        }
        console.log(data, "llllllllll", error);
        return data;
    }
    async getUserDetails(id: string) {
        console.log(id, "id");
        const { data } = await this.supabase.from("users").select("*").eq("id", id).single();
        console.log(data, "data UD");
        return data;
    }

}

export const fetchUserActiveStatus = async () => {
    const service = new AuthService();
    const response = await service.getActiveUser();

    return response.session?.user;
};

export const fetchUserDetails = async () => {
    const service = new AuthService();

    const response = await service.getUserDetails((await service.getActiveUser()).session?.user.id!);

    return response;
};

import { Supabase } from "./utils";
import "../interceptor";
import axios from "axios";

export class AuthService extends Supabase {
    constructor() {
        super();
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

    async verify_user_password(password: string) {
        const { data, error } = await this.supabase.rpc("verify_user_password", { password });
        if (error) {
            return false;
        }

        return data;
    }



      
    async signInWithGoogle() {
        console.log("signInWithGoogle");
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://buyandtrust-ecommerce.vercel.app/', // <--- Important
            },

          });
          

        console.log("Data:", data);
        console.log("Error:", error);

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
            console.log("handleGoogleAuthRedirect");
            // Step 2: Get the current session
            const { session } = (await this.supabase.auth.getSession()).data;
            console.log("Session:", session);
            if (!session || !session.user || !session.user.email) {
                console.error("No session or email found");
                return { success: false };
            }

            const email = session.user.email;
            const authUserId = session.user.id;
            const name = session.user.user_metadata?.name || email.split("@")[0];

            console.log(email, "email from session");
            console.log(authUserId, "authUserId from session");
            console.log(name, "name from session");
            // Step 3: Check if the user exists in your users table
            const userExists = await this.check_user_exists_email(email);

            // Step 4: If the user doesn't exist, create them
            if (!userExists) {
                await this.createUserWithEmail(email, authUserId, name);
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
        console.log(name, "name");
        console.log(email, "email");
        console.log(password, "password");
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        console.log(data, "data");
        console.log(error, "error");
        if (error) {
            throw new Error(error.message || "Registration failed");
        }
        return data;
    }

    async check_user_exists_email(email_id: string) {
        const { data, error } = await this.supabase.from("users").select("*").eq("email", email_id);
        console.log(data, "data");
        console.log(error, "error");
        if (error) {
            throw new Error("An Error Occured");
        }
        return data.length === 0 ? false : true;
    }

    // Helper method to create a user
    async createUserWithEmail(email: string, authUserId: string, name: string) {
        try {
            console.log(name, "name");

            console.log(authUserId, "authUserId");

            const { data, error } = await this.supabase.from("users").insert([
                {
                    id: authUserId,
                    email_id: email,
                    name: name,
                },
            ]);

            if (error) throw error;

            console.log("User created successfully:", email);
            return data;
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
        });
        if (error) {
            throw new Error("An Error Occured");
        }
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

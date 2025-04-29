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
            throw new Error('Authentication required. Please log in.');
        }
    }

    async verify_user_password(password: string) {
        const { data, error } = await this.supabase.rpc('verify_user_password', { password })
        if (error) {
            return false
        }
         
        
        return data
    }
    async login_user(phoneNumber: string) {
        const { data, error } = await this.supabase.auth.signInWithOtp({
            phone: phoneNumber,
          })
        
          if (error) {
            throw new Error("An Error Occured")
          }
          return data
    }
    async check_user_exists(phoneNumber: string) {
        const { data, error } = await this.supabase.from('users').select('*').eq('phone_number', phoneNumber)
        if (error) {
            throw new Error("An Error Occured")
        }
     
        return data.length === 0 ? false : true
    }
    async add_user_address(userId: string, full_address: string,landmark:string,city:string,state:string,pincode:string) {
        this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('user_address').insert({
            full_address: full_address,
            landmark: landmark,
            city: city,
            state: state,
            user_id: userId,
            pin_code: pincode
        })
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async update_user_address(userId: string, full_address: string,landmark:string,city:string,state:string,pincode:string) {
        this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('user_address').update({
            full_address: full_address,
            landmark: landmark,
            city: city,
            state: state,
            pin_code: pincode
        }).eq('user_id', userId)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async get_user_address(userId: string) {
        this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('user_address').select('*').eq('user_id', userId).single()
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async get_user(){
        this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('users').select('*').eq('id', await this.getUserId()).single()
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async create_user(phoneNumber: string, name: string, userId: string) {
        const { data, error } = await this.supabase.from('users').insert({
            phone_number: phoneNumber,
            name: name,
            id: userId
        })
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async verify_otp(otp: string, phoneNumber: string) {
        const { data, error } = await this.supabase.auth.verifyOtp({
            phone: phoneNumber.startsWith("+91") ? phoneNumber : "+91"+phoneNumber,
            token: otp,
            type: 'sms',
          })
        
          if (error) {
            throw new Error("An Error Occured")
          }
          return data
    }
    async reset_password(email: string) {
        
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/new-password', // URL to handle password reset
          })
          if (error) {
            
            throw new Error("An Error Occured")
        }
        return data
    }
    async invite_user(email: string, password: string, mobileNumber: string,role:string,fullName:string) {
        try {
          // Define the URL of your Supabase Edge Function
          const edgeFunctionUrl = 'https://fjlihsqbnpyfaiktbuyt.supabase.co/functions/v1/reset-link';
      
          // Send a POST request to the Edge Function
          const response = await axios.post(edgeFunctionUrl, {
            email,
            password,
            mobileNumber,
            role,
            fullName
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
          console.error('Error inviting user:', error);
      
          // Throw a generic error message or rethrow the error
          throw new Error('An error occurred while inviting the user');
        }
    }      
    async change_authenticated_password(password: string){
        const { data, error } = await this.supabase.auth.updateUser({
            password
          })
          
          if (error) {
            throw new Error("An Error Occured")
          } 
          return data
          
    }
    async change_password(password: string, accessToken: string){
        const { error } = await this.supabase.auth.updateUser({
            password,
           
          });
      
          if (error) {
            throw new Error("An Error Occured")
          } 
    }
    async userVerify(email: string) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)

        if (error) {
            return false
        }
        
        return data
    }
    async userLogin(email: string, password: string) {
        const result = await this.userVerify(email)
        if (!result) {
            throw new Error("invalid credentials")
        }

        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })

        if (error) {
            throw new Error(error.message)
        }

        return error || data;
    }

    async userLogout() {
        const { error } = await this.supabase.auth.signOut()
        if (error) {
            throw new Error(error.message)
        }
        return error;
    }

    async isUserActive() {
        const { session } = (await this.supabase.auth.getSession()).data
        return session
    }
    async getActiveUser() {
        const result = (await this.supabase.auth.getSession()).data
        return result
    }
    async getUserId() {
        const { session } = (await this.supabase.auth.getSession()).data
        return session?.user.id
    }
    async updateUserDetails( name: string, phoneNumber: string) {
        const { data, error } = await this.supabase.from('users').update({
            name,
            phone_number: phoneNumber
        }).eq('id', await this.getUserId())

        if (error) {
            console.log(error,"eeeeeeeeeeee")
            throw new Error("An Error Occured")
        }
        console.log(data,"llllllllll",error)
        return data
    }
    async getUserDetails(id: string) {
        const { data,  } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()
       
        return data
    }
    
    
}

export const fetchUserActiveStatus = async () => {
    const service = new AuthService();
    const response = await service.getActiveUser();


    return response.session?.user;
};

export const fetchUserDetails = async () => {
    const service = new AuthService();
 
    const response = await service.getUserDetails((await service.getActiveUser()).session?.user.id!)

    return response
}
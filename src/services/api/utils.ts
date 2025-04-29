
import { AxiosError, AxiosResponse } from "axios";
import { createClient } from '@supabase/supabase-js';



const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY 
const CLIENT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLIENT_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
//
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SUPABASE_SERVICE_URL = process.env.SUPABASE_SERVICE_URL;


export class BuildUrl {
    // private baseUrl: string;

    // constructor() {
    //     if (!BASE_URL) throw new Error("Missing Base URL");

    //     const isRunningOnNode = typeof window === "undefined";
    //     this.baseUrl = BASE_URL

    //     return this;
    // }
    supabase(endpoint: string) {
        
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_URL) {
            throw new Error("Missing Supabase Service URL");
        }
        const url = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_URL;
        return  url + endpoint;
    }

}

export class Supabase {
    private readonly supabaseUrl;
    private readonly supabaseKey;
    protected readonly supabase;

    constructor() {
        // Console log to debug and ensure values are being captured
   
        
        // Assign environment variables to class properties
        this.supabaseUrl =  CLIENT_SUPABASE_URL! || SUPABASE_URL!;
        this.supabaseKey = CLIENT_SUPABASE_KEY! ||  SUPABASE_KEY! ;

        // Ensure they are not undefined or throw an error if they are
        // if (!SUPABASE_URL || !SUPABASE_KEY) {
        //     throw new Error("Missing Supabase URL or Key");
        // }
const isServer = typeof window === 'undefined'; 
        // Create Supabase client
       
        
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

        return this;
    }
}

export type IResponse = {
    message: string;
    data?: any;
};



export function formatDate(dateStr:string) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 since January is month 0
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}


export type IUserType = {
    age: number;
    bio: string;
    birth_date: string | null;
    created_at: string;
    district: string;
    email: string;
    gender: string;
    id: string;
    image: string | null;
    langs: string[];
    name: string;
    passion: string[];
    phone_number: string;
    tag_name: string | null;
    user_name: string;
    user_type: string;
  }
  

export function adaptSuccessResponse(response: AxiosResponse): IResponse {
    return {
        message: response?.data?.message || "Success",
        data: response?.data?.data,
    };
}
export function adaptErrorResponse(
    error: AxiosError<{ message?: string }>
): string {
    return error?.response?.data?.message || "Error";
}

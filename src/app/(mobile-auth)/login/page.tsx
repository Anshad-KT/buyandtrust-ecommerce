"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TextField } from "@mui/material"
import { useState } from "react"
 import { toast } from "sonner"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"
import { useRouter } from "next/navigation"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { useLoginContext } from "./LoginContext"
export default function LoginForm() {
  const {phone, setPhone} = useLoginContext()
 const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const userExists = await new AuthService().check_user_exists(phone.startsWith("+91") ? phone : "+91"+phone)
    if (!userExists) {
      toastWithTimeout(ToastVariant.Default,"User does not exist")
      return
    }

    makeApiCall(() => new AuthService().login_user(phone.startsWith("+91") ? phone : "+91"+phone), {
      afterSuccess: () => {
        router.push("/login/otp")
        toastWithTimeout(ToastVariant.Default,"OTP sent successfully")
      },
      afterError: () => {
        toastWithTimeout(ToastVariant.Default,"An error occurred")
      }
    })
  }

  return (
    <>
    <div className="min-h-screen bg-background p-4">
      <div className="mb-2  flex items-center">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="mr-2" >
          
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
           
        </Button>
        
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
        <h1 className="text-xl font-medium px-1">Login</h1>
          <p className="text-sm text-muted-foreground pb-3  px-1">
            or{" "}
            <Link href="/signup" className="text-destructive hover:underline">
              create an account
            </Link>
          </p>
            <TextField
              id="Phone"
              className=""
              
              required
              fullWidth
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              label="Phone"
              variant="outlined"
              size="medium"
              type="tel"
              InputLabelProps={{ shrink: true }}
            />
        </div>

        <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-none">
          Login
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          By clicking on <Link href="/login" className="text-foreground hover:underline">Login</Link>, I accept the{" "}
           
            <Link  href="https://sites.google.com/view/bega-sportswear-terms-and-cond/home" target="_blank" className="text-foreground hover:underline">Terms & Conditions</Link>
           {" "}
          &{" "}
           
            <Link href="https://sites.google.com/view/bega-sportswear-privacy-policy/home" target="_blank" className="text-foreground hover:underline">Privacy Policy</Link>
         
        </p>
      </form>
    </div></> 
  )
}

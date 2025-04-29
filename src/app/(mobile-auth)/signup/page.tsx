"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TextField } from "@mui/material"
import { useContext } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"
import { useRouter } from "next/navigation"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { AuthContext } from "../Context"
import { useLoginContext } from "../login/LoginContext"

export default function SignupForm() {
    const { formData,setFormData } = useContext<any>(AuthContext)
    const {phone, setPhone} = useLoginContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userExists = await new AuthService().check_user_exists(formData.phoneNumber.startsWith("+91") ? formData.phoneNumber : "+91"+formData.phoneNumber)
    if (userExists) {
      toastWithTimeout(ToastVariant.Default, "User already exists")
      return
    }

    makeApiCall(() => new AuthService().login_user(formData.phoneNumber.startsWith("+91") ? formData.phoneNumber : "+91"+formData.phoneNumber), {
      afterSuccess: () => {
        router.push("/signup/otp")
        toastWithTimeout(ToastVariant.Default, "OTP sent successfully")
      },
      afterError: () => {
        toastWithTimeout(ToastVariant.Default, "An error occurred")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-2 flex items-center">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="mr-2" >
           
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
           
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-medium px-1">Sign up</h1>
          <p className="text-sm text-muted-foreground pb-3 px-1">
            or{" "}
            <Link href="/login" className="text-destructive hover:underline">
              login to your account
            </Link>
          </p>

          <TextField
            id="name"
            fullWidth
            required
            label="Name"
            variant="outlined"
            className="pb-3"
            size="medium"
            value={formData.name}
            onChange={(e) => setFormData((prev:any) => ({...prev, name: e.target.value}))}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            id="phone-number"
            fullWidth
            required
            label="Phone Number"
            variant="outlined"
            size="medium"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => {
              setFormData((prev:any) => ({...prev, phoneNumber: e.target.value}))
              setPhone(e.target.value)
            }}
            InputLabelProps={{ shrink: true }}
          />
        </div>

        <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-none">
          Continue
        </Button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          By clicking on <Link href="/signup" className="text-foreground hover:underline">Signup</Link>, I accept the{" "}
           
             <Link href="https://sites.google.com/view/bega-sportswear-terms-and-cond/home" target="_blank" className="text-foreground hover:underline">Terms & Conditions</Link>
           {" "}
          &{" "}
 
            <Link href="https://sites.google.com/view/bega-sportswear-privacy-policy/home" target="_blank" className="text-foreground hover:underline">Privacy Policy</Link>
         
        </p>
      </form>
    </div>
  )
}

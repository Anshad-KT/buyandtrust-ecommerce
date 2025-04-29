"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TextField } from "@mui/material"
import { useContext, useState } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"
import { useRouter } from "next/navigation"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { AuthContext } from "../../Context"
import { useLoginContext } from "../../login/LoginContext"
import { useLogin } from "@/app/LoginContext"

export default function OTPVerification() {
  const {phone, setPhone} = useLoginContext()
  const {isLoggedIn,setIsLoggedIn,isRefreshing,setIsRefreshing} = useLogin()
  const [formData, setFormData] = useState({
    phoneNumber: phone,
    otp: ""
  })
  const router = useRouter()
  const { formData: formDataContext } = useContext(AuthContext)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    makeApiCall(() => new AuthService().verify_otp(formData.otp, formData.phoneNumber.startsWith("+91") ? formData.phoneNumber : "+91"+formData.phoneNumber), {
      afterSuccess: async (data: any) => {
        toastWithTimeout(ToastVariant.Default, "OTP Verified")
        setIsRefreshing(!isRefreshing)
        await new AuthService().create_user(formData.phoneNumber.startsWith("+91") ? formData.phoneNumber : "+91"+formData.phoneNumber, formDataContext.name, data.user.id)
        router.push("/") // Redirect to home after verification
      },
      afterError: () => {
        toastWithTimeout(ToastVariant.Default, "Invalid OTP")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-2 flex items-center">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-medium px-1">Enter OTP</h1>
          <p className="text-sm text-muted-foreground pb-3 px-1">
            We{"'"}ve sent an OTP to your phone number.
          </p>

          <TextField
            id="phone-number"
            fullWidth
            className="pb-3"
            required
            label="Phone Number"
            variant="outlined"
            size="medium"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData((prev:any) => ({...prev, phoneNumber: e.target.value}))}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            id="otp"
            fullWidth
            required
            label="One time password"
            variant="outlined"
            size="medium"
            type="number"
            value={formData.otp}
            onChange={(e) => setFormData((prev:any) => ({...prev, otp: e.target.value}))}
            InputLabelProps={{ shrink: true }}
          />
        </div>

        <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-none">
          VERIFY OTP
        </Button>
      </form>
    </div>
  )
}

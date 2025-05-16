"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"

export default function VerifyResetCodePage() {
  const [verificationCode, setVerificationCode] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Verify the reset code
      makeApiCall(() => new AuthService().verify_reset_code(verificationCode), {
        afterSuccess: () => {
          router.push("/login/forgot-password/reset")
          toastWithTimeout(ToastVariant.Default, "Code verified")
        },
        afterError: () => {
          toastWithTimeout(ToastVariant.Default, "Invalid code")
        }
      })
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, "An error occurred")
    }
  }

  const handleResendCode = () => {
    toastWithTimeout(ToastVariant.Default, "New code sent")
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-medium mb-4">Verify Your Email Address</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the verification code sent to your email address.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verification-code" className="text-sm font-medium">
                Verification Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  className="h-10"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-10 text-blue-400 hover:text-blue-500"
                  onClick={handleResendCode}
                >Resend Code
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10">
              VERIFY ME <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
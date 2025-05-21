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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  console.log(email, "email");
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Check if user exists
      const userExists = await new AuthService().check_user_exists_email(email)
      if (!userExists) {
        toastWithTimeout(ToastVariant.Default, "No account found with this email")
        return
      }

      // Send password reset email
      makeApiCall(() => new AuthService().forgot_password(email), {
        afterSuccess: () => {
          console.log("Successfully sent reset code");
          router.push("/login/forgotPassword/verify")
          toastWithTimeout(ToastVariant.Default, "Reset code sent to your email")
        },
        afterError: () => {
          toastWithTimeout(ToastVariant.Default, "Failed to send reset code")
        }
      })
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, "An error occurred")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-medium mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the email address associated with your B&T account.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10">
              SEND CODE <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="flex space-x-2 justify-center">
            <p className="text-sm text-gray-500">Already have account?</p>
            <Link href="/login" className="text-sm text-orange-500 hover:underline">
              Sign In
            </Link>
          </div>
          <div className="flex space-x-2 justify-center mt-1">
            <p className="text-sm text-gray-500">Don't have account?</p>
            <Link href="/signup" className="text-sm text-orange-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You may contact{" "}
            <Link
              href="https://wa.me/9995153455"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              Customer Service
            </Link>{" "}
            for help resetting access to your account.
          </p>
        </div>
      </div>
    </div>
  )
}
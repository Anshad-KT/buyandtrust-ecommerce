"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toastWithTimeout(ToastVariant.Default, "Passwords do not match")
      return
    }

    if (password.length < 8) {
      toastWithTimeout(ToastVariant.Default, "Password must be at least 8 characters")
      return
    }
    
    try {
      // Reset the password
      makeApiCall(() => new AuthService().reset_password(password), {
        afterSuccess: () => {
          router.push("/login")
          toastWithTimeout(ToastVariant.Default, "Password reset successful. Please login.")
        },
        afterError: () => {
          toastWithTimeout(ToastVariant.Default, "Failed to reset password")
        }
      })
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, "An error occurred")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-medium mb-4">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your new password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pr-10"
                  placeholder="8+ characters"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10">
              RESET PASSWORD <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
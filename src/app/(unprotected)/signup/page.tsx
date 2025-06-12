"use client"

import { useState, useContext, FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { AuthService } from "@/services/api/auth-service"
import { AuthContext } from "../Context"
import { useLogin } from "@/app/LoginContext"
import PolicyModal, { PolicyType } from '@/components/common/PolicyModal/_component/policymodal'

export default function SignupPage() {
  const { formData, setFormData } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [emailForOtp, setEmailForOtp] = useState("")
  const router = useRouter()
  const { setIsLoggedIn } = useLogin()
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<PolicyType>('terms')

  // Function to open modal
  const openModal = (type: PolicyType) => {
    setModalType(type)
    setShowModal(true)
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Step 1: Send OTP to email
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // if (!formData.name.trim()) {
    //   toastWithTimeout(ToastVariant.Default, "Please enter your full name")
    //   return
    // }

    if (!isValidEmail(formData.email)) {
      toastWithTimeout(ToastVariant.Default, "Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // Check if user exists
      // const userExists = await new AuthService().check_user_exists_email(formData.email)
      // if (userExists) {
      //   toastWithTimeout(ToastVariant.Default, "User already exists")
      //   setIsLoading(false)
      //   return
      // }

      // Send OTP to email
      await new AuthService().signupWithEmail(formData.email.trim(), )
      setOtpSent(true)
      setEmailForOtp(formData.email.trim())
      toastWithTimeout(ToastVariant.Default, "A magic link has been sent to your email.")
    } catch (error: any) {
      console.error("Sign up error:", error)
      toastWithTimeout(ToastVariant.Default, error?.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!otp.trim()) {
      toastWithTimeout(ToastVariant.Default, "Please enter the verification code sent to your email.")
      return
    }
    setIsLoading(true)
    try {
      await new AuthService().verifyEmailOtp(emailForOtp, otp)
      setIsLoggedIn(true)
      router.push("/")
      router.refresh()
      toastWithTimeout(ToastVariant.Default, "Registration successful.")
    } catch (error: any) {
      console.error("OTP verification error:", error)
      toastWithTimeout(ToastVariant.Default, error?.message || "Invalid or expired verification code.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const authService = new AuthService()
      await authService.signInWithGoogle()
      setIsLoggedIn(true)
    } catch (error) {
      console.error("Google sign-in error:", error)
      toastWithTimeout(ToastVariant.Default, "Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // <div className="flex justify-center items-center min-h-screen bg-gray-50" style={{fontFamily: 'Helvetica'}}>
       <div className="flex justify-center py-12 bg-gray-50" style={{fontFamily: 'Helvetica'}}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between border-b mb-6">
          <p className="text-lg font-bold pb-2 text-black">WELCOME TO <span className="text-orange-500">BUY AND TRUST</span></p>
          {/* <Link href="/login" className="text-lg font-bold pb-2 text-gray-500">Sign In</Link> */}
          {/* <Link href="/signup" className="text-lg font-bold pb-2 border-b-2 border-orange-500 text-gray-900">Sign Up</Link> */}
        </div>
        {!otpSent ? (
          <form onSubmit={handleSignUp}>
            <div className="space-y-4">
              {/* <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10 rounded-none"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div> */}
              <div className="space-y-2">
                <label htmlFor="email-signup" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email-signup"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value.toLowerCase(),
                    })
                  }
                  required
                  className="h-10 rounded-none"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
    
              {/* Updated Policy Acceptance Section */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <button
                    type="button"
                    onClick={() => openModal('terms')}
                    className="text-orange-500 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 rounded"
                    disabled={isLoading}
                  >
                    Terms and Conditions
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    onClick={() => openModal('privacy')}
                    className="text-orange-500 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 rounded"
                    disabled={isLoading}
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10 rounded-none"
                disabled={isLoading}
              >
                {isLoading ? "SENDING CODE..." : (
                  <>
                    SIGN UP <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
              <div className="relative flex items-center justify-center mt-6 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 mt-4"></div>
                </div>
                <div className="relative bg-white px-4 text-sm text-gray-500 mt-4">or</div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-3 h-10 font-normal relative rounded-none"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <span className="absolute left-4">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                </span>
                {isLoading ? "Processing..." : "Sign up with Google"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center text-lg font-semibold text-green-700 mb-4">
              A magic link has been sent to <span className="font-bold">{emailForOtp}</span>.<br />
              Please check your inbox and follow the link to complete your signup.
            </div>
            <form onSubmit={handleVerifyOtp} className="w-full">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="h-10 rounded-none"
                    disabled={isLoading}
                    placeholder="Enter verification code"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10 rounded-none"
                  disabled={isLoading}
                >
                  {isLoading ? "VERIFYING..." : "VERIFY CODE"}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Policy Modal */}
        <PolicyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={modalType}
        />
      </div>
    </div>
  )
}
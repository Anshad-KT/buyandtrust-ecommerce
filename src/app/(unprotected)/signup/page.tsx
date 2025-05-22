// "use client"

// import { useState } from "react"
// import { Eye, EyeOff, ArrowRight } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
// import { makeApiCall } from "@/lib/apicaller"
// import { AuthService } from "@/services/api/auth-service"
// import { useContext } from "react"
// import { AuthContext } from "../Context"
// // import { useLoginContext } from "../login/LoginContext"

// export default function SignupPage() {
//   const { formData, setFormData } = useContext(AuthContext)
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [acceptTerms, setAcceptTerms] = useState(false)
//   const router = useRouter()

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword)
//   }

//   const toggleConfirmPasswordVisibility = () => {
//     setShowConfirmPassword(!showConfirmPassword)
//   }

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (formData.password !== confirmPassword) {
//       toastWithTimeout(ToastVariant.Default, "Passwords do not match")
//       return
//     }

//     if (!acceptTerms) {
//       toastWithTimeout(ToastVariant.Default, "Please accept the Terms and Conditions")
//       return
//     }
    
//     try {
//       // Check if user exists
//       const userExists = await new AuthService().check_user_exists_email(formData.email)
//       if (userExists) {
//         toastWithTimeout(ToastVariant.Default, "User already exists")
//         return
//       }

//       // Update to use email-based registration
//       makeApiCall(() => new AuthService().register_user(formData.name, formData.email, formData.password), {
//         afterSuccess: () => {
//           router.push("/login")
//           toastWithTimeout(ToastVariant.Default, "Registration successful. Please login.")
//         },
//         afterError: (error) => {
//           toastWithTimeout(ToastVariant.Default, error?.message || "Registration failed")
//         }
//       })
//     } catch (error) {
//       toastWithTimeout(ToastVariant.Default, "An error occurred")
//     }
//   }

  
//   const handleGoogleSignIn = () => {
//     makeApiCall(() => new AuthService().signInWithGoogle(), {
//       afterError: () => {
//         toastWithTimeout(ToastVariant.Default, "An Error Occurred")
//       }
//     })
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-50">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
//         <div className="flex justify-between border-b mb-6">
//           <Link href="/login" className="text-lg font-bold pb-2 text-gray-500">Sign In</Link>
//           <Link href="/signup" className="text-lg font-bold pb-2 border-b-2 border-orange-500 text-gray-900">Sign Up</Link>
//         </div>
        
//         <form onSubmit={handleSignUp}>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <label htmlFor="name" className="text-sm font-medium">
//                 Full Name
//               </label>
//               <Input
//                 id="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({...formData, name: e.target.value})}
//                 required
//                 className="h-10 rounded-none"
//               />
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="email-signup" className="text-sm font-medium">
//                 Email Address
//               </label>
//               <Input
//                 id="email-signup"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({...formData, email: e.target.value})}
//                 required
//                 className="h-10 rounded-none"
//               />
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="password-signup" className="text-sm font-medium">
//                 Password
//               </label>
//               <div className="relative">
//                 <Input
//                   id="password-signup"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   required
//                   className="h-10 pr-10 rounded-none"
//                   placeholder="8+ characters"
//                 />
//                 <button
//                   type="button"
//                   onClick={togglePasswordVisibility}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="confirm-password" className="text-sm font-medium">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <Input
//                   id="confirm-password"
//                   type={showConfirmPassword ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                   className="h-10 pr-10 rounded-none"
//                 />
//                 <button
//                   type="button"
//                   onClick={toggleConfirmPasswordVisibility}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                 >
//                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Checkbox 
//                 id="terms" 
//                 checked={acceptTerms}
//                 onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
//               />
//               <label htmlFor="terms" className="text-sm text-gray-600">
//                 Are you agree to Clicon{" "}
//                 <Link href="https://sites.google.com/view/bega-sportswear-terms-and-cond/home" target="_blank" className="text-orange-500 hover:underline">Terms of Conditions</Link>
//                 {" "}and{" "}
//                 <Link href="https://sites.google.com/view/bega-sportswear-privacy-policy/home" target="_blank" className="text-orange-500 hover:underline">Privacy Policy</Link>
//               </label>
//             </div>

//             <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10 rounded-none">
//               SIGN UP <ArrowRight size={16} className="ml-2" />
//             </Button>

//             <div className="relative flex items-center justify-center mt-6 mb-6">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200 mt-4"></div>
//               </div>
//               <div className="relative bg-white px-4 text-sm text-gray-500 mt-4">or</div>
//             </div>

//             <Button
//               type="button"
//               variant="outline"
//               className="w-full mb-3 h-10 font-normal relative rounded-none"
//               onClick={handleGoogleSignIn}
//             >
//               <span className="absolute left-4">
//                 <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
//                   <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
//                     <path
//                       fill="#4285F4"
//                       d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
//                     />
//                     <path
//                       fill="#34A853"
//                       d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
//                     />
//                     <path
//                       fill="#FBBC05"
//                       d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
//                     />
//                     <path
//                       fill="#EA4335"
//                       d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
//                     />
//                   </g>
//                 </svg>
//               </span>
//               Sign up with Google
//             </Button>


//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }


"use client"

import { useState, useContext, FormEvent } from "react"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"
import { AuthContext } from "../Context"
import { useLogin } from "@/app/LoginContext" // import useLogin from login page

export default function SignupPage() {
  const { formData, setFormData } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Use isLoggedIn and setIsLoggedIn from login context
  const { isLoggedIn, setIsLoggedIn } = useLogin()

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  const isValidEmail = (email: string) => {
    // Basic email format validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toastWithTimeout(ToastVariant.Default, "Please enter your full name")
      return
    }

    if (!isValidEmail(formData.email)) {
      toastWithTimeout(ToastVariant.Default, "Please enter a valid email address")
      return
    }

    if (formData.password !== confirmPassword) {
      toastWithTimeout(ToastVariant.Default, "Passwords do not match")
      return
    }

    if (!acceptTerms) {
      toastWithTimeout(ToastVariant.Default, "Please accept the Terms and Conditions")
      return
    }

    setIsLoading(true)

    try {
      // Check if user exists
      const userExists = await new AuthService().check_user_exists_email(formData.email)
      if (userExists) {
        toastWithTimeout(ToastVariant.Default, "User already exists")
        setIsLoading(false)
        return
      }

      // --- CRITICAL: Pass name as user_metadata to ensure it is stored in auth and users table ---
      // This is a common issue with Supabase/Auth: you must pass user_metadata (e.g. { name }) as the 4th argument!
      makeApiCall(() => new AuthService().register_user(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      ), {
        afterSuccess: () => {
          setIsLoggedIn(true) // Set isLoggedIn to true after successful signup
          router.push("/")
          router.refresh()
          toastWithTimeout(ToastVariant.Default, "Registration successful.")
        },
        afterError: (error: any) => {
          // Show more specific error if available
          if (error?.message?.toLowerCase().includes("email")) {
            toastWithTimeout(ToastVariant.Default, "Invalid email format. Please check your email address.")
          } else {
            toastWithTimeout(ToastVariant.Default, error?.message || "Registration failed")
          }
          setIsLoading(false)
        },
        forceShutdown: true
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      toastWithTimeout(ToastVariant.Default, "An error occurred during registration")
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const authService = new AuthService()
      await authService.signInWithGoogle()
      setIsLoggedIn(true) // Set isLoggedIn to true after Google sign in
    } catch (error) {
      console.error("Google sign-in error:", error)
      toastWithTimeout(ToastVariant.Default, "Failed to sign in with Google. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between border-b mb-6">
          <Link href="/login" className="text-lg font-bold pb-2 text-gray-500">Sign In</Link>
          <Link href="/signup" className="text-lg font-bold pb-2 border-b-2 border-orange-500 text-gray-900">Sign Up</Link>
        </div>
        
        <form onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
              <label htmlFor="email-signup" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email-signup"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-10 rounded-none"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password-signup" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password-signup"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-10 pr-10 rounded-none"
                  placeholder="8+ characters"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  disabled={isLoading}
                  tabIndex={-1}
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
                  className="h-10 pr-10 rounded-none"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree the{" "}
                <Link href="https://sites.google.com/view/bega-sportswear-terms-and-cond/home" target="_blank" className="text-orange-500 hover:underline">Terms of Conditions</Link>
                {" "}and{" "}
                <Link href="https://sites.google.com/view/bega-sportswear-privacy-policy/home" target="_blank" className="text-orange-500 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10 rounded-none"
              disabled={isLoading}
            >
              {isLoading ? "SIGNING UP..." : (
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
      </div>
    </div>
  )
}
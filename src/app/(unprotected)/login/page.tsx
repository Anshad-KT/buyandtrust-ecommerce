// "use client"

// import { ArrowLeft } from "lucide-react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { TextField } from "@mui/material"
// import { useState } from "react"
//  import { toast } from "sonner"
// import { makeApiCall } from "@/lib/apicaller"
// import { AuthService } from "@/services/api/auth-service"
// import { useRouter } from "next/navigation"
// import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
// import { useLoginContext } from "./LoginContext"
// export default function LoginForm() {
//   const {phone, setPhone} = useLoginContext()
//  const router = useRouter()
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     const userExists = await new AuthService().check_user_exists(phone.startsWith("+91") ? phone : "+91"+phone)
//     if (!userExists) {
//       toastWithTimeout(ToastVariant.Default,"User does not exist")
//       return
//     }

//     makeApiCall(() => new AuthService().login_user(phone.startsWith("+91") ? phone : "+91"+phone), {
//       afterSuccess: () => {
//         router.push("/login/otp")
//         toastWithTimeout(ToastVariant.Default,"OTP sent successfully")
//       },
//       afterError: () => {
//         toastWithTimeout(ToastVariant.Default,"An error occurred")
//       }
//     })
//   }

//   return (
//     <>
//     <div className="min-h-screen bg-background p-4">
//       <div className="mb-2  flex items-center">
//         <Button onClick={() => router.back()} variant="ghost" size="icon" className="mr-2" >
          
//             <ArrowLeft className="h-5 w-5" />
//             <span className="sr-only">Back</span>
           
//         </Button>
        
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="space-y-2">
//         <h1 className="text-xl font-medium px-1">Loginzzz</h1>
//           <p className="text-sm text-muted-foreground pb-3  px-1">
//             or{" "}
//             <Link href="/signup" className="text-destructive hover:underline">
//               create an account
//             </Link>
//           </p>
//             <TextField
//               id="Phone"
//               className=""
              
//               required
//               fullWidth
//               onChange={(e) => setPhone(e.target.value)}
//               value={phone}
//               label="Phone"
//               variant="outlined"
//               size="medium"
//               type="tel"
//               InputLabelProps={{ shrink: true }}
//             />
//         </div>

//         <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-none">
//           Login
//         </Button>

//         <p className="text-center text-sm text-muted-foreground">
//           By clicking on <Link href="/login" className="text-foreground hover:underline">Login</Link>, I accept the{" "}
           
//             <Link  href="https://sites.google.com/view/bega-sportswear-terms-and-cond/home" target="_blank" className="text-foreground hover:underline">Terms & Conditions</Link>
//            {" "}
//           &{" "}
           
//             <Link href="https://sites.google.com/view/bega-sportswear-privacy-policy/home" target="_blank" className="text-foreground hover:underline">Privacy Policy</Link>
         
//         </p>
//       </form>
//     </div></> 
//   )
// }



"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"
import { useLoginContext } from "./LoginContext"
import { useLogin } from "@/app/LoginContext"

export default function LoginPage() {
  const { email, setEmail, password, setPassword } = useLoginContext()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleSignIn = () => {
    makeApiCall(() => new AuthService().signInWithGoogle(), {
      afterError: () => {
        toastWithTimeout(ToastVariant.Default, "An Error Occurred")
      }
    })
  }
const {setIsLoggedIn} = useLogin()
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Update this to use email-based authentication instead of phone
      makeApiCall(() => new AuthService().userLogin(email, password), {
        afterSuccess: () => {
          setIsLoggedIn(email)
          router.push("/") // Redirect to dashboard after login
          router.refresh()
        
          toastWithTimeout(ToastVariant.Default, "Login successful")
        },
        afterError: (error: any) => {
          toastWithTimeout(ToastVariant.Default, error?.message || "Login failed")
        }
      })
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, "An error occurred")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between border-b mb-6">
          <Link href="/login" className="text-lg font-bold pb-2 border-b-2 border-orange-500 text-gray-900">Sign In</Link>
          <Link href="/signup" className="text-lg font-bold pb-2 text-gray-500">Sign Up</Link>
        </div>
        
        <form onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-signin" className="text-sm font-medium font-type-public sans-serif">
                Email Address
              </label>
              <Input
                id="email-signin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password-signin" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/login/forgotPassword" className="text-xs text-blue-400 hover:text-blue-500">
                  Forgot Password
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password-signin"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pr-10 rounded-none"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 "
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10 rounded-none">
              SIGN IN <ArrowRight size={16} className="ml-2" />
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
              Login with Google
            </Button>

            {/* <Button
              type="button"
              variant="outline"
              className="w-full h-10 font-normal relative"
              onClick={() => console.log("Login with Apple")}
            >
              <span className="absolute left-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path d="M16.044 13.455c-.008-1.873 1.533-2.774 1.604-2.816-0.874-1.275-2.233-1.452-2.717-1.47-1.152-0.118-2.256.68-2.839.68-0.586 0-1.488-0.667-2.449-0.648-1.255.02-2.415.732-3.06 1.859-1.309 2.267-0.334 5.61.936 7.441.625.902 1.364 1.911 2.335 1.874.939-0.038 1.292-0.605 2.428-0.605 1.134 0 1.46.605 2.451.584 1.014-0.016 1.655-.92 2.272-1.827.719-1.047.99-2.063 1.005-2.114-0.022-0.01-1.925-0.738-1.944-2.927M14.2 8.588c0.516-0.629.866-1.496.77-2.365-0.744.031-1.645.497-2.176 1.122-0.476.553-0.894 1.438-0.784 2.284.83.064 1.677-0.416 2.19-1.041" />
                </svg>
              </span>
              Login with Apple
            </Button> */}
          </div>
        </form>
      </div>
    </div>
  )
}
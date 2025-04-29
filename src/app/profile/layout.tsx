"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { ArrowLeft } from 'lucide-react'
 
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import "@fontsource/montserrat"; // Defaults to weight 400
import "@fontsource/montserrat/400.css"; // Specify weight
import "@fontsource/montserrat/400-italic.css"; // Specify weight and style
import { Button } from "@/components/ui/button";
import {BrowserView, MobileOnlyView} from 'react-device-detect'
import { TextField } from "@mui/material"
import { ToastVariant } from "@/hooks/use-toast"
import { toastWithTimeout } from "@/hooks/use-toast"
import { AuthService } from "@/services/api/auth-service"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from "@/services/api/ecom-service"
import { useLogin } from "../LoginContext"

export default function Layout({ children }: any) {
  const pathname = usePathname().split('/')[2]; // Current path
 
const router = useRouter();

useEffect(() => {
  const checkUserAuth = async () => {
    const cart_products = await new AuthService().isUserActive();
  
    if (cart_products == null) {
      toastWithTimeout(ToastVariant.Default, "Please login to buy customised jersey");
      router.push("/");
    }
  };

  checkUserAuth();
}, [router]);
  return (
    <>
    <MobileOnlyView> 

        <OrdersPage >{children}</OrdersPage>
    </MobileOnlyView>
    <BrowserView>
    <section style={{fontFamily: "Montserrat"}} className="bg-[#3B1C32] px-24 pt-24">
        <ProfileHeader />
      <div className="h-screen mx-auto max-w-[1440px] bg-white relative">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-[#E1E9ED] border-r border-gray-200 pl-4 pt-4 absolute top-10 h-[94%] left-10">
          <ul className="space-y-4 pt-3">
            <li className={pathname === "orders" ? "bg-violet-500" : ""}>
              <Link
                href="/profile/orders"
                className={`flex items-center w-full space-x-3 px-3 py-3 ${
                  pathname === "orders" ? "bg-white text-gray-900" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
                    fill="#757575"
                  />
                  <path
                    d="M13.7268 8.38766C13.5133 8.14006 13.2024 8.00125 12.8766 8.00125H12.8429C12.6556 6.3168 11.2248 5 9.49438 5C7.76396 5 6.33318 6.3168 6.1459 8.00125H6.12343C5.79757 8.00125 5.48669 8.14381 5.2732 8.38766C5.05971 8.63526 4.96607 8.96165 5.01101 9.28429L5.40804 12.0679C5.56535 13.1709 6.52045 14 7.63287 14H11.3671C12.4795 14 13.4347 13.1709 13.592 12.0679L13.989 9.28429C14.0339 8.96165 13.9403 8.63526 13.7268 8.38766ZM9.49438 5.75031C10.8128 5.75031 11.9027 6.72947 12.0863 8.00125H6.90249C7.08602 6.72947 8.17596 5.75031 9.49438 5.75031Z"
                    fill="#F4F4F4"
                  />
                </svg>

                <span>Orders</span>
              </Link>
            </li>
            <li className={pathname === "address" ? "bg-violet-500" : ""}>
              <Link
                href="/profile/address"
                className={`flex items-center space-x-3 px-3 py-3 ${
                  pathname === "address" ? "bg-white text-gray-900" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <img src="/address.png" className="w-5 h-5" alt="" />
                <span>Address</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex p-6">
          <div className="text-center flex flex-col justify-center items-center    ml-auto w-3/4">
            {children}
          </div>
        </main>
      </div>
    </section></BrowserView></>
  );
}


function ProfileHeader() {
  const [user, setUser] = useState<any>(null)
  const [changed,setChanged] = useState(false)
  useEffect(() => {
    const fetchUser = async () => {
      const user = await new AuthService().get_user()
      setUser(user)
    }
    fetchUser()
  }, [changed])
  const {setIsLoggedIn} = useLogin()
  const router = useRouter()
    return (
      <header className="bg-[#3B1C32] py-3">
        <div className="flex flex-col gap-1">
          <div className="flex  items-center justify-between bg-[#3B1C32]">
            <section>
            <h1 className="text-3xl font-medium text-white">{user?.name}</h1>
            <p className="text-[12px] text-white/70">{user?.phone_number}</p>
            </section> 
            <section className="flex  gap-2">
            <Login EditComponent={<Button variant="outline" className="text-white bg-[#3B1C32] border-white rounded-none hover:bg-white/10 ">
              Edit Profile
            </Button>} setChanged={setChanged} setIsLoggedIn={setIsLoggedIn} />
            <Button variant="outline" onClick={() => {
              makeApiCall(
                async () => new EcomService().logout(),
                {
                  afterSuccess: () => {
                    setIsLoggedIn(false)
                    router.push("/")
                    toastWithTimeout(ToastVariant.Default, "Logged out successfully")
                  }
                }
              )
            }} className="text-white bg-[#3B1C32] border-white rounded-none hover:bg-white/10 ">
              Logout
            </Button>
            </section>
            
            
          </div>
          
        </div>
      </header>
    )
  } 


  function OrdersPage({ children }:any) {
    const pathname = usePathname()?.split('/')[2];
    const [user, setUser] = useState<any>(null)
    const [changed,setChanged] = useState(false)
    useEffect(() => {
      const fetchUser = async () => {
        const user = await new AuthService().get_user()
        setUser(user)
      }
      fetchUser()
    }, [changed])
    const {setIsLoggedIn} = useLogin()
    const router = useRouter()
    return (
      <div className="min-h-screen bg-[white]">
        {/* Header */}
        <header className="flex items-center justify-between  py-3 bg-[#2D1B2D] text-white">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="text-white hover:text-white/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
             <section className="flex flex-col gap-1">
             <h1 className="text-lg font-medium">{user?.name}</h1>
             <h1 className="text-sm font-medium">{user?.phone_number}</h1>
             </section>
          </div>
          
          <section className="flex gap-3">
            <Login EditComponent={<Button 
            variant="ghost" 
            className="text-white hover:text-white/80 border border-white rounded-none px-6"
          >
            Edit
          </Button>} setChanged={setChanged} setIsLoggedIn={setIsLoggedIn} />
          
      <Button 
            variant="ghost" 
            onClick={() => {
              makeApiCall(
                async () => new EcomService().logout(),
                {
                  afterSuccess: () => {
                    setIsLoggedIn(false)
                    router.push("/")
                    toastWithTimeout(ToastVariant.Default, "Logged out successfully")
                  }
                }
              )
            }} 
            className="text-white  lg:hover:text-black border border-white rounded-none px-6"
          >
            logout
          </Button> 
          </section>
        
          
        </header>
  
        {/* Tabs */}
        <section defaultValue={pathname || "orders"} className="w-full flex flex-col ">
          <section className="w-full flex justify-center bg-[#F4F4F4] rounded-none h-auto p-5 ">
              <div className='border w-full flex justify-center bg-[#F4F4F4] rounded-none h-auto'>
              <Link className={`${pathname === 'orders' ? 'bg-[#D6D6D680]' : '' } w-1/2`} href="/profile/orders">
                <div className={`py-3 w-full rounded-none flex items-center gap-2 justify-center `}>
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 9.32927C0 4.17686 4.17686 0 9.32927 0C14.4817 0 18.6585 4.17686 18.6585 9.32927C18.6585 14.4817 14.4817 18.6585 9.32927 18.6585C4.17686 18.6585 0 14.4817 0 9.32927Z" fill="#757575"/>
<path d="M12.806 7.8245C12.6068 7.59351 12.3168 7.46401 12.0128 7.46401H11.9814C11.8067 5.89254 10.4718 4.66406 8.85748 4.66406C7.24312 4.66406 5.90831 5.89254 5.73359 7.46401H5.71263C5.40863 7.46401 5.1186 7.59701 4.91943 7.8245C4.72025 8.0555 4.63289 8.35999 4.67483 8.66099L5.04522 11.2579C5.19198 12.2869 6.08302 13.0604 7.12082 13.0604H10.6046C11.6424 13.0604 12.5335 12.2869 12.6802 11.2579L13.0506 8.66099C13.0925 8.35999 13.0052 8.0555 12.806 7.8245ZM8.85748 5.36405C10.0875 5.36405 11.1043 6.27753 11.2755 7.46401H6.43944C6.61066 6.27753 7.62749 5.36405 8.85748 5.36405Z" fill="#F4F4F4"/>
</svg>

                  Orders
                </div>
              </Link>
           
              <Link className={`${pathname === 'address' ? 'bg-[#D6D6D680]' : ''} w-1/2`} href="/profile/address">
                <div className={`py-3 w-full rounded-none flex items-center gap-2 justify-center `}>
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 9.32927C0 4.17686 4.17686 0 9.32927 0V0C14.4817 0 18.6585 4.17686 18.6585 9.32927V9.32927C18.6585 14.4817 14.4817 18.6585 9.32927 18.6585V18.6585C4.17686 18.6585 0 14.4817 0 9.32927V9.32927Z" fill="#757575"/>
<g clip-path="url(#clip0_544_555)">
<path d="M11.2535 5.46094C10.74 4.94705 10.0566 4.66406 9.32968 4.66406C8.60277 4.66406 7.9194 4.94705 7.40552 5.46094C6.3447 6.52175 6.3447 8.24806 7.40863 9.31198L8.37848 10.2605C8.64087 10.517 8.98527 10.6453 9.32968 10.6453C9.67408 10.6453 10.0185 10.517 10.2809 10.2605L11.2535 9.30887C11.7673 8.79498 12.0507 8.11162 12.0507 7.38471C12.0507 6.6578 11.7673 5.97521 11.2535 5.46094ZM9.32968 8.54737C8.68557 8.54737 8.16352 8.02532 8.16352 7.38121C8.16352 6.7371 8.68557 6.21505 9.32968 6.21505C9.97379 6.21505 10.4958 6.7371 10.4958 7.38121C10.4958 8.02532 9.97379 8.54737 9.32968 8.54737ZM13.9943 11.1798C13.9951 11.3174 13.9232 11.4449 13.8058 11.5152L9.97262 13.8153C9.77437 13.9342 9.55203 13.9937 9.33007 13.9937C9.10811 13.9937 8.88537 13.9342 8.68751 13.8153L4.85357 11.5152C4.73579 11.4445 4.66427 11.317 4.66505 11.1798C4.66582 11.0426 4.7389 10.9158 4.85746 10.8466L6.74469 9.74191C6.78357 9.78466 6.8236 9.82703 6.86481 9.86824L7.83466 10.8163C8.23427 11.2074 8.76565 11.4231 9.32968 11.4231C9.89371 11.4231 10.4247 11.2074 10.8247 10.8163L11.8035 9.85891C11.8416 9.82082 11.8789 9.78155 11.9151 9.74191L13.8019 10.8463C13.9205 10.9158 13.9935 11.0429 13.9943 11.1798Z" fill="#F4F4F4"/>
</g>
<defs>
<clipPath id="clip0_544_555">
<rect width="9.32927" height="9.32927" fill="white" transform="translate(4.66504 4.66406)"/>
</clipPath>
</defs>
</svg>

                  Address
                </div>
              </Link>
              </div>
          </section>
  
          {/* Render children content below the tabs */}
          {children}
        </section>
      </div>
    );
  }





 
function Login({EditComponent,setIsLoggedIn,setChanged}:any) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: ""
  })
  
  const [error, setError] = useState("")
  useEffect(() => {
    const fetchUser = async () => {
      const user = await new AuthService().get_user()
      setFormData({
        name: user?.name,
        phoneNumber: user?.phone_number
      })
    }
    fetchUser()
  }, [])
  const [ischanged,setIschanged] = useState(false)
  useEffect(() => {
    const checkUserActive = async () => {
      const user = await new AuthService().isUserActive();
      if (user) {
       
        const data = await new AuthService().getUserDetails(user?.user?.id);
        
        setIsLoggedIn(data);
      }
    };
    checkUserActive();
  }, [ischanged]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    if(formData.name == "" || formData.phoneNumber == ""){
      setError("Please fill all the fields")
      return
    }
    if(formData.phoneNumber.startsWith("+91") && formData.phoneNumber.length != 13) {
    } else if (!formData.phoneNumber.startsWith("+91") && formData.phoneNumber.length != 10) {
      setError("Please enter a valid 10 digit phone number")
      return
    }
    if(formData.phoneNumber.match(/[^0-9+]/)){
      setError("Phone number must contain only numbers")
      return
    }
    
    if(formData.name.length < 3){
      setError("Name must be at least 3 characters")
      return
    }
    if(formData.name.match(/[^a-zA-Z\s]/)){
      setError("Name must not contain numbers or symbols")
      return
    }
    await new AuthService().updateUserDetails(formData.name, formData.phoneNumber)
    makeApiCall(
      async () => new AuthService().updateUserDetails(formData.name, formData.phoneNumber),
      {
        afterSuccess: () => {
          console.log("success")
          setIschanged(true)
          router.refresh()
          setIsOpen(false)
          setChanged((prev:any) => !prev)
          setIschanged((prev:any) => !prev)
          toastWithTimeout( ToastVariant.Default,"Profile updated successfully",)
        },
        afterError: (error:any) => {
          console.log(error,"yyyyyy")
          setIsOpen(false)
          setChanged((prev:any) => !prev)
          setIschanged((prev:any) => !prev)
          router.refresh()
         // toastWithTimeout( ToastVariant.Default,"An error occurred while updating the profile",)
        }
      }
    )
 
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {EditComponent}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md z-[1000]">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <SheetTitle>Edit profile</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
                  <TextField
                            id="Name"
                            className=""
                            required
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData((prev:any) => ({ ...prev, name: e.target.value }))}
                            label="Name"
                            variant="outlined"
                            size="medium"
                            InputLabelProps={{ shrink: true }}
                          />
            
          </div>
          <div className="space-y-2">
          <TextField
                id="Phone Number"
                className=""
                required
                fullWidth
                value={formData.phoneNumber}
                label="Phone Number"
                variant="outlined"
                size="medium"
                onChange={(e) => setFormData((prev:any) => ({ ...prev, phoneNumber: e.target.value }))}
        
                InputLabelProps={{ shrink: true }}
              />
            
          </div>
          <div className="text-red-500 text-sm">
            {error}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 rounded-none text-white"
          >
            Save and update
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}


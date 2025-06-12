
// "use client"

// import { useEffect, useState } from "react"
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet"

// import { 
//   ArrowLeft, 
//   Package, 
//   CreditCard, 
//   User, 
//   LogOut,
//   Box,
//   Clock,
//   CheckSquare
// } from 'lucide-react'
 
// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import "@fontsource/montserrat"; // Defaults to weight 400
// import "@fontsource/montserrat/400.css"; // Specify weight
// import "@fontsource/montserrat/400-italic.css"; // Specify weight and style
// import { Button } from "@/components/ui/button";
// import {BrowserView, MobileOnlyView} from 'react-device-detect'
// import { TextField } from "@mui/material"
// import { ToastVariant } from "@/hooks/use-toast"
// import { toastWithTimeout } from "@/hooks/use-toast"
// import { AuthService } from "@/services/api/auth-service"
// import { makeApiCall } from "@/lib/apicaller"
// import { EcomService } from "@/services/api/ecom-service"
// import { useLogin } from "@/app/LoginContext"


// export default function Layout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname().split('/')[2]; // Current path
 
//   const router = useRouter();
//   const {setIsLoggedIn} = useLogin();
//   const [activeTab, setActiveTab] = useState("My Profile")
  
//   const menuItems = [
//     { name: "Order History", icon: <Package className="h-5 w-5" />, active: false },
//     { name: "Cards & Address", icon: <CreditCard className="h-5 w-5" />, active: false },
//     { name: "My Profile", icon: <User className="h-5 w-5" />, active: true },
//     { name: "Log-out", icon: <LogOut className="h-5 w-5" />, active: false },
//   ]
  
//   useEffect(() => {
//     // Commenting out auth check for now to access the page
//     /*
//     const checkUserAuth = async () => {
//       const cart_products = await new AuthService().isUserActive();
    
//       if (cart_products == null) {
//         toastWithTimeout(ToastVariant.Default, "Please login to buy customised jersey");
//         router.push("/");
//       }
//     };

//     checkUserAuth();
//     */
//   }, [router]);
  
//   return (
//     <>
//       <MobileOnlyView>
//         <OrdersPage>{children}</OrdersPage>
//       </MobileOnlyView>
      
//       <BrowserView>
//         {/* <Breadcrumbs items={[
//           {label: "Home", href: "/"}, 
//           {label: pathname === "orders" ? "Order History" : 
//                   pathname === "address" ? "Cards & Address" : 
//                   pathname === "add-address" ? "Cards & Address" : 
//                   "My Profile", 
//            href: `/profile/${pathname}`}
//         ]} /> */}
//         <section style={{fontFamily: "Montserrat"}} className="bg-white">
//           <div className="mx-auto bg-white flex">
//             <div className="flex flex-col md:flex-row w-full min-h-screen gap-8">
//               {/* Sidebar */}
//               <section className="top-0 h-fit ">
//                 <div className="w-full md:w-64 bg-white">
//                   <div className="p-4 pt-8 border mt-16 justify-between">
//                     <button
//                       key="Order History"
//                       className={`flex items-center w-full p-3 mb-1 text-left rounded-md ${
//                         pathname === "orders" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100"
//                       }`}
//                       onClick={() => {
//                         setActiveTab("Order History");
//                         router.push("/profile/orders");
//                       }}
//                     >
//                       <span className="mr-3">
//                         <img src="/order.svg" alt="Order History" className="h-5 w-5" />
//                       </span>
//                       <span>Order History</span>
//                     </button>
                    
//                     <button
//                       key="Cards & Address"
//                       className={`flex items-center w-full p-3 mb-1 text-left rounded-md ${
//                         pathname === "address" || pathname === "add-address" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100"
//                       }`}
//                       onClick={() => {
//                         setActiveTab("Cards & Address");
//                         router.push("/profile/add-address");
//                       }}
//                     >
//                       <span className="mr-3">
//                         <img src="/cards.svg" alt="Cards & Address" className="h-5 w-5" />
//                       </span>
//                       <span>Cards & Address</span>
//                     </button>
                    
//                     <button
//                       key="My Profile"
//                       className={`flex items-center w-full p-3 mb-1 text-left rounded-md ${
//                         pathname === undefined || pathname === "profile" || pathname === "my-profile" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100"
//                       }`}
//                       onClick={() => {
//                         setActiveTab("My Profile");
//                         router.push("/profile/my-profile");
//                       }}
//                     >
//                       <span className="mr-3">
//                         <img src="/gear.svg" alt="My Profile" className="h-5 w-5" />
//                       </span>
//                       <span>My Profile</span>
//                     </button>
                    
//                     <button
//                       key="Log-out"
//                       className="flex items-center w-full p-3 mb-1 text-left rounded-md text-gray-700 hover:bg-gray-100"
//                       onClick={() => {
//                         makeApiCall(
//                           async () => new EcomService().logout(),
//                           {
//                             afterSuccess: () => {
//                               setIsLoggedIn(false);
//                               router.push("/");
//                               toastWithTimeout(ToastVariant.Default, "Logged out successfully");
//                             }
//                           }
//                         );
//                       }}
//                     >
//                       <span className="mr-3">
//                         <img src="/SignOut.svg" alt="Log-out" className="h-5 w-5" />
//                       </span>
//                       <span>Log-out</span>
//                     </button>
//                   </div>
//                 </div>
//               </section>

//               {/* Main Content */}
//               <main className="flex-1 flex">
//                 <div className="w-full h-full">
//                   {children}
//                 </div>
//               </main>
//             </div>
//           </div>
//           {/* <Footer /> */}
//         </section>
//       </BrowserView>
//     </>
//   );
// }

// function ProfileHeader() {
//   const [user, setUser] = useState<any>(null)
//   const [changed, setChanged] = useState(false)
//   const pathname = usePathname()?.split('/')[2];
  
//   useEffect(() => {
//     // Commenting out auth check for now to access the page
//     /*
//     const fetchUser = async () => {
//       const user = await new AuthService().get_user()
//       setUser(user)
//     }
//     fetchUser()
//     */
//   }, [changed])
//   // const {setIsLoggedIn} = useLogin()
//   const router = useRouter()
// }

// function OrdersPage({ children }:any) {
//   const pathname = usePathname()?.split('/')[2];
//   const [user, setUser] = useState<any>(null)
//   const [changed, setChanged] = useState(false)
  
//   useEffect(() => {
//     // Commenting out auth check for now to access the page
//     /*
//     const fetchUser = async () => {
//       const user = await new AuthService().get_user()
//       setUser(user)
//     }
//     fetchUser()
//     */
//   }, [changed])
  
//   // const {setIsLoggedIn} = useLogin()
//   const router = useRouter()
  
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Tabs */}
//       <section className="w-full flex flex-col">
//         <section className="w-full flex justify-center bg-[#F4F4F4] rounded-none h-auto p-5">
//           <div className="border w-full flex justify-center bg-[#F4F4F4] rounded-none h-auto">
//             <Link className={`${pathname === 'orders' ? 'bg-[#D6D6D680]' : '' } w-1/2`} href="/profile/orders">
//               <div className="py-3 w-full rounded-none flex items-center gap-2 justify-center">
//                 <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M0 9.32927C0 4.17686 4.17686 0 9.32927 0C14.4817 0 18.6585 4.17686 18.6585 9.32927C18.6585 14.4817 14.4817 18.6585 9.32927 18.6585C4.17686 18.6585 0 14.4817 0 9.32927Z" fill="#757575"/>
//                   <path d="M12.806 7.8245C12.6068 7.59351 12.3168 7.46401 12.0128 7.46401H11.9814C11.8067 5.89254 10.4718 4.66406 8.85748 4.66406C7.24312 4.66406 5.90831 5.89254 5.73359 7.46401H5.71263C5.40863 7.46401 5.1186 7.59701 4.91943 7.8245C4.72025 8.0555 4.63289 8.35999 4.67483 8.66099L5.04522 11.2579C5.19198 12.2869 6.08302 13.0604 7.12082 13.0604H10.6046C11.6424 13.0604 12.5335 12.2869 12.6802 11.2579L13.0506 8.66099C13.0925 8.35999 13.0052 8.0555 12.806 7.8245ZM8.85748 5.36405C10.0875 5.36405 11.1043 6.27753 11.2755 7.46401H6.43944C6.61066 6.27753 7.62749 5.36405 8.85748 5.36405Z" fill="#F4F4F4"/>
//                 </svg>
//                 Orders
//               </div>
//             </Link>
         
//             <Link className={`${pathname === 'address' ? 'bg-[#D6D6D680]' : ''} w-1/2`} href="/profile/address">
//               <div className="py-3 w-full rounded-none flex items-center gap-2 justify-center">
//                 <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M0 9.32927C0 4.17686 4.17686 0 9.32927 0V0C14.4817 0 18.6585 4.17686 18.6585 9.32927V9.32927C18.6585 14.4817 14.4817 18.6585 9.32927 18.6585V18.6585C4.17686 18.6585 0 14.4817 0 9.32927V9.32927Z" fill="#757575"/>
//                   <g clip-path="url(#clip0_544_555)">
//                     <path d="M11.2535 5.46094C10.74 4.94705 10.0566 4.66406 9.32968 4.66406C8.60277 4.66406 7.9194 4.94705 7.40552 5.46094C6.3447 6.52175 6.3447 8.24806 7.40863 9.31198L8.37848 10.2605C8.64087 10.517 8.98527 10.6453 9.32968 10.6453C9.67408 10.6453 10.0185 10.517 10.2809 10.2605L11.2535 9.30887C11.7673 8.79498 12.0507 8.11162 12.0507 7.38471C12.0507 6.6578 11.7673 5.97521 11.2535 5.46094ZM9.32968 8.54737C8.68557 8.54737 8.16352 8.02532 8.16352 7.38121C8.16352 6.7371 8.68557 6.21505 9.32968 6.21505C9.97379 6.21505 10.4958 6.7371 10.4958 7.38121C10.4958 8.02532 9.97379 8.54737 9.32968 8.54737ZM13.9943 11.1798C13.9951 11.3174 13.9232 11.4449 13.8058 11.5152L9.97262 13.8153C9.77437 13.9342 9.55203 13.9937 9.33007 13.9937C9.10811 13.9937 8.88537 13.9342 8.68751 13.8153L4.85357 11.5152C4.73579 11.4445 4.66427 11.317 4.66505 11.1798C4.66582 11.0426 4.7389 10.9158 4.85746 10.8466L6.74469 9.74191C6.78357 9.78466 6.8236 9.82703 6.86481 9.86824L7.83466 10.8163C8.23427 11.2074 8.76565 11.4231 9.32968 11.4231C9.89371 11.4231 10.4247 11.2074 10.8247 10.8163L11.8035 9.85891C11.8416 9.82082 11.8789 9.78155 11.9151 9.74191L13.8019 10.8463C13.9205 10.9158 13.9935 11.0429 13.9943 11.1798Z" fill="#F4F4F4"/>
//                   </g>
//                   <defs>
//                     <clipPath id="clip0_544_555">
//                       <rect width="9.32927" height="9.32927" fill="white" transform="translate(4.66504 4.66406)"/>
//                     </clipPath>
//                   </defs>
//                 </svg>
//                 Address
//               </div>
//             </Link>
//           </div>
//         </section>

//         {/* Render children content below the tabs */}
//         <div className="flex-1">
//           {children}
//         </div>
//       </section>
//     </div>
//   );
// }



"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { 
  ArrowLeft, 
  Package, 
  CreditCard, 
  User, 
  LogOut,
  Box,
  Clock,
  CheckSquare,
  Menu
} from 'lucide-react'
 
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
import { useLogin } from "@/app/LoginContext"


export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname().split('/')[2]; // Current path
 
  const router = useRouter();
  const {setIsLoggedIn} = useLogin();
  const [activeTab, setActiveTab] = useState("My Profile")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const menuItems = [
    { 
      name: "Order History", 
      icon: "/order.svg", 
      active: pathname === "orders",
      path: "/profile/orders"
    },
    { 
      name: "Saved Address", 
      icon: "/cards.svg", 
      active: pathname === "address" || pathname === "add-address",
      path: "/profile/add-address"
    },
    { 
      name: "My Profile", 
      icon: "/gear.svg", 
      active: pathname === undefined || pathname === "profile" || pathname === "my-profile",
      path: "/profile/my-profile"
    },
    { 
      name: "Log-out", 
      icon: "/SignOut.svg", 
      active: false,
      path: "#"
    },
  ]
  
  const handleLogout = () => {
    makeApiCall(
      async () => new EcomService().logout(),
      {
        afterSuccess: () => {
          setIsLoggedIn(false);
          router.push("/");
          toastWithTimeout(ToastVariant.Default, "Logged out successfully");
        }
      }
    );
  };

  useEffect(() => {
    // Commenting out auth check for now to access the page
    /*
    const checkUserAuth = async () => {
      const cart_products = await new AuthService().isUserActive();
    
      if (cart_products == null) {
        toastWithTimeout(ToastVariant.Default, "Please login to buy customised jersey");
        router.push("/");
      }
    };

    checkUserAuth();
    */
  }, [router]);
  
  // Sidebar component shared between mobile and desktop
  const SidebarContent = () => (
    <div 
    style={{
      fontWeight: "400",
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    }}
    >
      {menuItems.map((item, index) => (
        <button
          key={item.name}
            className={`flex items-center w-full py-2 px-4 text-left rounded-none transition-colors duration-150 ${
            item.active ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setActiveTab(item.name);
            if (item.name === "Log-out") {
              handleLogout();
            } else {
              router.push(item.path);
              setIsMenuOpen(false);
            }
          }}
        >
          <span className="mr-3">
            <img src={item.icon} alt={item.name} className="h-5 w-5" />
          </span>
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <MobileOnlyView>
        <div className="min-h-screen bg-white">
          {/* Mobile Header with hamburger menu */}
          <header className="flex items-center justify-between p-4 bg-white shadow-sm">
            <div className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" onClick={() => router.push("/")} />
              <h1 className="text-lg font-medium">Profile</h1>
            </div>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
          </header>

          {/* Main content area */}
          <main className="p-4">
            {children}
          </main>
        </div>
      </MobileOnlyView>
      
      {/* Desktop View */}
      <BrowserView>
        <section style={{fontFamily: "Montserrat"}} className="bg-white">
          <div className="mx-auto bg-white flex">
            <div className="flex flex-col md:flex-row w-full min-h-screen gap-8">
              {/* Sidebar */}
              <section className="top-0 h-fit ">
                <div className="w-full md:w-64 bg-white">
                  <div className="p-4 pt-6 border mt-16 justify-between">
                    <SidebarContent />
                  </div>
                </div>
              </section>

              {/* Main Content */}
              <main className="flex-1 flex">
                <div className="w-full h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
          {/* <Footer /> */}
        </section>
      </BrowserView>
    </>
  );
}

// Other components stay the same
function ProfileHeader() {
  const [user, setUser] = useState<any>(null)
  const [changed, setChanged] = useState(false)
  const pathname = usePathname()?.split('/')[2];
  
  useEffect(() => {
    // Commenting out auth check for now to access the page
    /*
    const fetchUser = async () => {
      const user = await new AuthService().get_user()
      setUser(user)
    }
    fetchUser()
    */
  }, [changed])
  // const {setIsLoggedIn} = useLogin()
  const router = useRouter()
}

function OrdersPage({ children }:any) {
  const pathname = usePathname()?.split('/')[2];
  const [user, setUser] = useState<any>(null)
  const [changed, setChanged] = useState(false)
  
  useEffect(() => {
    // Commenting out auth check for now to access the page
    /*
    const fetchUser = async () => {
      const user = await new AuthService().get_user()
      setUser(user)
    }
    fetchUser()
    */
  }, [changed])
  
  // const {setIsLoggedIn} = useLogin()
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-white">
      {/* Order stats dashboard */}
      <section className="w-full flex flex-col gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
          <Box className="text-blue-500" size={24} />
          <div>
            <div className="text-xl font-medium">1</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 flex items-center gap-3">
          <Clock className="text-orange-500" size={24} />
          <div>
            <div className="text-xl font-medium">1</div>
            <div className="text-gray-600">Pending</div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
          <CheckSquare className="text-green-500" size={24} />
          <div>
            <div className="text-xl font-medium">0</div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </section>

      {/* Render children content */}
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
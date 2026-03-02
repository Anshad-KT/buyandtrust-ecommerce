"use client"

import { useEffect, useRef, useState } from "react"
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
// import {BrowserView, MobileOnlyView} from 'react-device-detect'
// import dynamic from 'next/dynamic';
// Fix dynamic imports to properly load the components with correct options
// const BrowserView = dynamic(() => import('react-device-detect').then(m => m.BrowserView), { ssr: false });
// const MobileOnlyView = dynamic(() => import('react-device-detect').then(m => m.MobileOnlyView), { ssr: false });
import { TextField } from "@mui/material"
import { ToastVariant } from "@/hooks/use-toast"
import { toastWithTimeout } from "@/hooks/use-toast"
import { AuthService } from "@/services/api/auth-service"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from "@/services/api/ecom-service"
import { useLogin } from "@/app/LoginContext"
import ZipaaraLoader from "@/app/(protected)/_components/zipaara-loader"
import { useInViewport } from "@/hooks/useInViewport"


export default function Layout({ children }: { children: React.ReactNode }) {
  const fullPath = usePathname();
  const pathname = fullPath.split('/')[2]; // Current path
 
  const router = useRouter();
  const {setIsLoggedIn} = useLogin();
  const [activeTab, setActiveTab] = useState("My Profile")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [isExitingLoader, setIsExitingLoader] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const hasEntered = useInViewport(contentRef, {
    threshold: 0.1,
    once: true,
    enabled: !showLoader,
  })
  
  const menuItems = [
    { 
      name: "Order History", 
      icon: "/order.svg", 
      active: pathname === "orders" || (
        pathname && 
        pathname !== "my-profile" && 
        pathname !== "address" && 
        pathname !== "add-address" && 
        pathname !== "cards" && 
        pathname !== "logout"
      ),
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

  useEffect(() => {
    setShowLoader(true)
    setIsExitingLoader(false)
    const timer = setTimeout(() => {
      setIsExitingLoader(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [fullPath])

  const handleLoaderExitComplete = () => {
    setShowLoader(false)
  }

  if (showLoader) {
    return (
      <ZipaaraLoader
        isExiting={isExitingLoader}
        onExitComplete={handleLoaderExitComplete}
        exitDurationMs={500}
      />
    )
  }
  
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
      {/* <MobileOnlyView>
        <div id="profile" className="min-h-screen bg-white">
          
 
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

          <main className="p-4">
            {children}
          </main>
        </div>
      </MobileOnlyView> */}
      
      {/* Desktop View */}
      {/* <BrowserView> */}
        <section
          ref={contentRef}
          id="profile"
          style={{
            fontFamily: "Montserrat",
            transform: hasEntered ? "translateY(0)" : "translateY(20px)",
            opacity: hasEntered ? 1 : 0,
          }}
          className="bg-red-600 transition-all duration-700 ease-out"
        >
          <div className="mx-auto bg-white flex">
            <div className="flex flex-col md:flex-row w-full min-h-screen gap-8">
 
              <section className="top-0 h-fit ">
                <div className="w-full md:w-64 bg-white">
                  <div className="p-4 pt-6 border lg:mt-16 md:mt-16 mt-8 justify-between">
                    <SidebarContent />
                  </div>
                </div>
              </section>

  
              <main className="flex-1 flex">
                <div className="w-full h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>

        </section>
      {/* </BrowserView> */}

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

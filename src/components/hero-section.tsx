'use client'
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { Sheet,SheetContent, SheetHeader,SheetTitle, SheetTrigger } from "./ui/sheet";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { makeApiCall } from "@/lib/apicaller";
import { AuthService } from "@/services/api/auth-service";
 
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { useLogin } from "@/app/LoginContext";

export default function HeroSection() {
  
  return (
    <div className="min-h-screen bg-[#222222] relative">
      <img
        src="/background.svg"
        className="absolute right-0 w-1/2 z-[10]"
        alt=""
      />

      {/* Navigation */}
      <Navigation />

      {/* Hero Content */}
      <HeroContent />
    </div>
  );
}

 
export function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  const {isLoggedIn,setIsLoggedIn,isRefreshing,setIsRefreshing} = useLogin()
  const pathname = usePathname()
   
  useEffect(() => {
    const checkUserActive = async () => {
      const user = await new AuthService().isUserActive();
      if (user) {
       
        const data = await new AuthService().getUserDetails(user?.user?.id);
         
        setIsLoggedIn(data);
      }
    };
    checkUserActive();
  }, [isRefreshing]);
  // Toggle the mobile menu when the hamburger icon is clicked
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="container mx-auto lg:px-28 px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:w-[13%]">
          <img src="/logo.svg" className="w-full" alt="Logo" />
        </div>
        {/* Mobile Hamburger Icon */}
        <section className="lg:hidden block" onClick={toggleMobileMenu}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 18V16H21V18H3ZM3 13V11H21V13H3ZM3 8V6H21V8H3Z"
              fill="#F4F4F4"
            />
          </svg>
        </section>
        {/* Desktop Navigation */}
        <div className="lg:flex items-center gap-12 text-gray-300 z-[100] hidden">
          {(pathname != "/payment" && pathname != "/address")  && (
            <Link href={"/"}> 
          <div className={`flex cursor-pointer items-center gap-2 hover:text-[#fe3232] text-white `}>
            <svg
              width="21"
              height="23"
              viewBox="0 0 21 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.4301 6.10453L17.625 5.50437V2.31547C17.625 2.07401 17.4477 1.87804 17.2292 1.87804C17.0107 1.87804 16.8333 2.07401 16.8333 2.31547V4.91383L12.4926 1.67682C11.2822 0.773956 9.71704 0.774831 8.50817 1.67682L2.56988 6.10453C1.58663 6.83679 1 8.05723 1 9.36778V18.0631C1 20.2336 2.59838 22 4.5625 22H6.9375C7.156 22 7.33333 21.804 7.33333 21.5626V13.6888C7.33333 12.9652 7.86613 12.3765 8.52083 12.3765H12.4792C13.1339 12.3765 13.6667 12.9652 13.6667 13.6888V21.5626C13.6667 21.804 13.844 22 14.0625 22H16.4375C18.4016 22 20 20.2336 20 18.0631V9.36778C20 8.05636 19.4134 6.83679 18.4301 6.10453ZM19.2083 18.0631C19.2083 19.7516 17.9654 21.1251 16.4375 21.1251H14.4583V13.6888C14.4583 12.4832 13.5709 11.5016 12.4792 11.5016H8.52083C7.42913 11.5016 6.54167 12.4832 6.54167 13.6888V21.1251H4.5625C3.03458 21.1251 1.79167 19.7516 1.79167 18.0631V9.36778C1.79167 8.34769 2.24767 7.39933 3.01242 6.82979L8.94992 2.40209C9.89121 1.69957 11.1088 1.69957 12.0501 2.40209L17.9876 6.82979C18.7523 7.39933 19.2083 8.34856 19.2083 9.36778V18.0631Z"
                fill={`${pathname == "/" ? "#fe3232" : ""}`}
            
                stroke={`${pathname == "/" ? "#fe3232" : ""}`}
              />
            </svg>
            <span className={`${pathname == "/" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Home</span>
          </div>
          </Link>
          )}
          <Link href={"tel:+916282655396"}>
          <div className="flex cursor-pointer items-center gap-2 hover:text-[#fe3232] text-white">
            <svg
              width="27"
              height="23"
              viewBox="0 0 27 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24.1594 18.2667C25.1119 16.9188 25.7332 15.3655 25.973 13.7326C26.2128 12.0997 26.0643 10.4333 25.5395 8.86856C25.0148 7.30381 24.1286 5.88479 22.9528 4.72663C21.777 3.56846 20.3448 2.70376 18.7723 2.20268C17.1998 1.7016 15.5314 1.57825 13.9023 1.84264C12.2732 2.10703 10.7294 2.75172 9.39611 3.7244C8.0628 4.69707 6.97756 5.97034 6.22842 7.44091C5.47928 8.91148 5.08734 10.5379 5.0844 12.1883M11.5594 8.85167C11.5552 8.61278 11.6078 8.37633 11.7131 8.16184C11.8184 7.94736 11.9732 7.76102 12.1647 7.61823C12.3563 7.47545 12.5791 7.38032 12.8147 7.34072C13.0504 7.30112 13.292 7.31819 13.5197 7.39051C13.7474 7.46283 13.9547 7.58833 14.1243 7.75662C14.2938 7.92491 14.4209 8.13116 14.495 8.35831C14.5691 8.58546 14.588 8.82698 14.5502 9.06289C14.5124 9.29881 14.419 9.52235 14.2777 9.71501L11.5244 12.4683H14.3711M19.6561 10.5783H15.9461L18.7111 7.27667V12.4683M14.4061 15.4783H17.4861L14.8144 20.495M24.7427 19.585C24.7427 20.5386 23.9697 21.3117 23.0161 21.3117C22.0625 21.3117 21.2894 20.5386 21.2894 19.585C21.2894 18.6314 22.0625 17.8583 23.0161 17.8583C23.9697 17.8583 24.7427 18.6314 24.7427 19.585ZM3.3694 10.3333H5.1194V17.1817H3.3694C2.92074 17.1817 2.49046 17.0034 2.17321 16.6862C1.85596 16.3689 1.67773 15.9387 1.67773 15.49V11.99C1.68689 11.5474 1.86916 11.1261 2.18542 10.8164C2.50168 10.5067 2.92674 10.3332 3.3694 10.3333Z"
              
            
                stroke={`white`}
                strokeWidth="1.5"
              
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            +91 6282655396
          </div></Link>
          {(pathname != "/payment" && pathname != "/address") && (
          <div  onClick={async()=>{
            const cart_products = await new AuthService().isUserActive()
          
            if(cart_products == null){
              toastWithTimeout(ToastVariant.Default,"Please login to buy customised jersey")
            }else{
              router.push("/customize")
            }
          }}  className={`flex cursor-pointer items-center gap-2 hover:text-[#fe3232]   text-white`}>
            <svg
              width="26"
              height="21"
              viewBox="0 0 26 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.8069 1.00019L14.1966 3.62849C13.9985 3.81563 13.7352 3.92002 13.4615 3.92002C13.1877 3.92002 12.9245 3.81563 12.7263 3.62849L10.0841 1.00019C9.12108 0.993316 8.16634 1.17644 7.27552 1.53889C6.38469 1.90134 5.57561 2.43586 4.89544 3.11128L1.86963 6.21458L5.44947 9.8351L7.06891 8.20956V20H19.854V8.23067L21.4628 9.85621L25.0001 6.21458L21.9423 3.13239C21.2712 2.45806 20.4718 1.92238 19.5903 1.55637C18.7088 1.19037 17.7627 1.00132 16.8069 1.00019Z"
               
                stroke={`${pathname == "/customize" ? "#fe3232" : "white"}`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={`${pathname == "/customize" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Customise</span>
          </div> 
          )}
          {isLoggedIn ? (
            <Link href={"/profile/address"}>
            <div className="flex cursor-pointer items-center gap-2 hover:text-[#fe3232] text-white">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.54521 10.3717C12.1225 10.3717 14.2119 8.28233 14.2119 5.705C14.2119 3.12767 12.1225 1.03833 9.54521 1.03833C6.96788 1.03833 4.87854 3.12767 4.87854 5.705C4.87854 8.28233 6.96788 10.3717 9.54521 10.3717Z"
                   
            
                    stroke={`${pathname == "/profile/address" ? "#fe3232" : "white"}`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.8536 19.9267C15.4661 19.9136 16.0645 19.7399 16.5889 19.423C17.1133 19.1061 17.5453 18.6571 17.8418 18.1209C18.1382 17.5847 18.2887 16.9801 18.2782 16.3675C18.2677 15.7548 18.0965 15.1557 17.7819 14.63C16.9515 13.3192 15.8032 12.2397 14.4437 11.4916C13.0842 10.7435 11.5578 10.3513 10.0061 10.3513C8.45439 10.3513 6.92787 10.7435 5.56841 11.4916C4.20895 12.2397 3.06065 13.3192 2.23023 14.63C1.91557 15.1557 1.74442 15.7548 1.73391 16.3675C1.72341 16.9801 1.8739 17.5847 2.17034 18.1209C2.46679 18.6571 2.89882 19.1061 3.42321 19.423C3.9476 19.7399 4.54598 19.9136 5.15854 19.9267H14.8536Z"
                     
                    stroke={`${pathname == "/profile/address" ? "#fe3232" : "white"}`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isLoggedIn?.name}
              </div></Link>
          ) : (
          <Login
            isRefreshing={isRefreshing}
            setIsRefreshing={setIsRefreshing}
            EditComponent={
              <div className="flex cursor-pointer items-center gap-2 hover:text-[#fe3232] text-white">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.54521 10.3717C12.1225 10.3717 14.2119 8.28233 14.2119 5.705C14.2119 3.12767 12.1225 1.03833 9.54521 1.03833C6.96788 1.03833 4.87854 3.12767 4.87854 5.705C4.87854 8.28233 6.96788 10.3717 9.54521 10.3717Z"
                    stroke="#F4F4F4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.8536 19.9267C15.4661 19.9136 16.0645 19.7399 16.5889 19.423C17.1133 19.1061 17.5453 18.6571 17.8418 18.1209C18.1382 17.5847 18.2887 16.9801 18.2782 16.3675C18.2677 15.7548 18.0965 15.1557 17.7819 14.63C16.9515 13.3192 15.8032 12.2397 14.4437 11.4916C13.0842 10.7435 11.5578 10.3513 10.0061 10.3513C8.45439 10.3513 6.92787 10.7435 5.56841 11.4916C4.20895 12.2397 3.06065 13.3192 2.23023 14.63C1.91557 15.1557 1.74442 15.7548 1.73391 16.3675C1.72341 16.9801 1.8739 17.5847 2.17034 18.1209C2.46679 18.6571 2.89882 19.1061 3.42321 19.423C3.9476 19.7399 4.54598 19.9136 5.15854 19.9267H14.8536Z"
                    stroke="#F4F4F4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isLoggedIn ? isLoggedIn?.name : "Sign in"}
              </div>
            }
          />)}
          {(pathname != "/payment" && pathname != "/address")  && (
          <div onClick={async()=>{
            const cart_products = await new AuthService().isUserActive()
      
            if(cart_products == null){
              toastWithTimeout(ToastVariant.Default,"Please login to view cart")
            }else{
              router.push("/cart")
            }
          }} className={`flex cursor-pointer items-center   gap-2 hover:text-[#fe3232] text-white`}>
            <svg
              width="23"
              height="20"
              viewBox="0 0 23 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.19482 1.33325H1.69482M5.47482 1.33325L7.99483 10.4799C8.20516 11.2012 8.64202 11.8357 9.24081 12.2895C9.8396 12.7433 10.5685 12.9924 11.3198 12.9999H21.5165V1.33325H5.47482ZM13.3615 17.0833C13.3615 18.0498 12.578 18.8333 11.6115 18.8333C10.645 18.8333 9.86149 18.0498 9.86149 17.0833C9.86149 16.1168 10.645 15.3333 11.6115 15.3333C12.578 15.3333 13.3615 16.1168 13.3615 17.0833ZM21.5282 17.0833C21.5282 18.0498 20.7447 18.8333 19.7782 18.8333C18.8117 18.8333 18.0282 18.0498 18.0282 17.0833C18.0282 16.1168 18.8117 15.3333 19.7782 15.3333C20.7447 15.3333 21.5282 16.1168 21.5282 17.0833Z"
                stroke={`${pathname == "/cart" ? "#fe3232" : "white"}`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={`${pathname == "/cart" ? "text-[#fe3232] hover:text-white" : ""}`}>Cart</span>
          </div>
          )} 
        </div>
      </nav>

      {mobileMenuOpen && (
  <div className="lg:hidden bg-black">
    <div className="">
      <div className="flex flex-col gap-4 text-gray-300">
        {/* Home */}
        {(pathname != "/payment" && pathname != "/address")  && (
        <Link
          href={"/"}
          className="flex cursor-pointer px-5 pt-3 gap-2 items-center  hover:text-[#fe3232] text-white"
        > 
          <svg
            width="21"
            height="23"
            viewBox="0 0 21 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.4301 6.10453L17.625 5.50437V2.31547C17.625 2.07401 17.4477 1.87804 17.2292 1.87804C17.0107 1.87804 16.8333 2.07401 16.8333 2.31547V4.91383L12.4926 1.67682C11.2822 0.773956 9.71704 0.774831 8.50817 1.67682L2.56988 6.10453C1.58663 6.83679 1 8.05723 1 9.36778V18.0631C1 20.2336 2.59838 22 4.5625 22H6.9375C7.156 22 7.33333 21.804 7.33333 21.5626V13.6888C7.33333 12.9652 7.86613 12.3765 8.52083 12.3765H12.4792C13.1339 12.3765 13.6667 12.9652 13.6667 13.6888V21.5626C13.6667 21.804 13.844 22 14.0625 22H16.4375C18.4016 22 20 20.2336 20 18.0631V9.36778C20 8.05636 19.4134 6.83679 18.4301 6.10453ZM19.2083 18.0631C19.2083 19.7516 17.9654 21.1251 16.4375 21.1251H14.4583V13.6888C14.4583 12.4832 13.5709 11.5016 12.4792 11.5016H8.52083C7.42913 11.5016 6.54167 12.4832 6.54167 13.6888V21.1251H4.5625C3.03458 21.1251 1.79167 19.7516 1.79167 18.0631V9.36778C1.79167 8.34769 2.24767 7.39933 3.01242 6.82979L8.94992 2.40209C9.89121 1.69957 11.1088 1.69957 12.0501 2.40209L17.9876 6.82979C18.7523 7.39933 19.2083 8.34856 19.2083 9.36778V18.0631Z"
              fill="#FF3333"
              stroke={`${pathname == "/" ? "#fe3232" : "white"}`}
            />
          </svg>
          <span className={`${pathname == "/" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Home</span>
        </Link>
        )}
        {/* Phone Number */}
        <Link
          href={"tel:+916282655396"}
          className="flex  cursor-pointer px-4 pb- gap-2  items-center  hover:text-[#fe3232] text-white"
        >
          <svg
            width="27"
            height="23"
            viewBox="0 0 27 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.1594 18.2667C25.1119 16.9188 25.7332 15.3655 25.973 13.7326C26.2128 12.0997 26.0643 10.4333 25.5395 8.86856C25.0148 7.30381 24.1286 5.88479 22.9528 4.72663C21.777 3.56846 20.3448 2.70376 18.7723 2.20268C17.1998 1.7016 15.5314 1.57825 13.9023 1.84264C12.2732 2.10703 10.7294 2.75172 9.39611 3.7244C8.0628 4.69707 6.97756 5.97034 6.22842 7.44091C5.47928 8.91148 5.08734 10.5379 5.0844 12.1883M11.5594 8.85167C11.5552 8.61278 11.6078 8.37633 11.7131 8.16184C11.8184 7.94736 11.9732 7.76102 12.1647 7.61823C12.3563 7.47545 12.5791 7.38032 12.8147 7.34072C13.0504 7.30112 13.292 7.31819 13.5197 7.39051C13.7474 7.46283 13.9547 7.58833 14.1243 7.75662C14.2938 7.92491 14.4209 8.13116 14.495 8.35831C14.5691 8.58546 14.588 8.82698 14.5502 9.06289C14.5124 9.29881 14.419 9.52235 14.2777 9.71501L11.5244 12.4683H14.3711"
              stroke="#F4F4F4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          +91 6282655396
        </Link>

        {/* Customise */}
        {(pathname != "/payment" && pathname != "/address")  && (
        <div
         onClick={async()=>{
          const cart_products = await new AuthService().isUserActive()
      
          if(cart_products == null){
            toastWithTimeout(ToastVariant.Default,"Please login to view cart")
          }else{
            router.push("/customize")
            setMobileMenuOpen(false)
          }
        }} 
          className="flex cursor-pointer items-center  px-4 pb-  gap-2  hover:text-[#fe3232] text-white"
        >
          <svg
            width="26"
            height="21"
            viewBox="0 0 26 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.8069 1.00019L14.1966 3.62849C13.9985 3.81563 13.7352 3.92002 13.4615 3.92002C13.1877 3.92002 12.9245 3.81563 12.7263 3.62849L10.0841 1.00019C9.12108 0.993316 8.16634 1.17644 7.27552 1.53889C6.38469 1.90134 5.57561 2.43586 4.89544 3.11128L1.86963 6.21458L5.44947 9.8351L7.06891 8.20956V20H19.854V8.23067L21.4628 9.85621L25.0001 6.21458L21.9423 3.13239C21.2712 2.45806 20.4718 1.92238 19.5903 1.55637C18.7088 1.19037 17.7627 1.00132 16.8069 1.00019Z"
              fill="#2C2C2C"
              stroke={`${pathname == "/customize" ? "#fe3232" : "white"}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`${pathname == "/customize" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Customise</span>
        </div>
        )}
        {/* Sign In */}
        <div
          onClick={()=>{
      
            
            if(!isLoggedIn){
              router.push("/login")
              setMobileMenuOpen(false)
            }else{
              router.push("/profile/address")
              setMobileMenuOpen(false)
            }
          }}
          className="flex cursor-pointer items-center   px-5 pb-  gap-2  hover:text-[#fe3232] text-white"
        >
          <svg
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.54521 10.3717C12.1225 10.3717 14.2119 8.28233 14.2119 5.705C14.2119 3.12767 12.1225 1.03833 9.54521 1.03833C6.96788 1.03833 4.87854 3.12767 4.87854 5.705C4.87854 8.28233 6.96788 10.3717 9.54521 10.3717Z"
              stroke={`${pathname == "/profile/address" ? "#fe3232" : "white"}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.8536 19.9267C15.4661 19.9136 16.0645 19.7399 16.5889 19.423C17.1133 19.1061 17.5453 18.6571 17.8418 18.1209C18.1382 17.5847 18.2887 16.9801 18.2782 16.3675C18.2677 15.7548 18.0965 15.1557 17.7819 14.63C16.9515 13.3192 15.8032 12.2397 14.4437 11.4916C13.0842 10.7435 11.5578 10.3513 10.0061 10.3513C8.45439 10.3513 6.92787 10.7435 5.56841 11.4916C4.20895 12.2397 3.06065 13.3192 2.23023 14.63C1.91557 15.1557 1.74442 15.7548 1.73391 16.3675C1.72341 16.9801 1.8739 17.5847 2.17034 18.1209C2.46679 18.6571 2.89882 19.1061 3.42321 19.423C3.9476 19.7399 4.54598 19.9136 5.15854 19.9267H14.8536Z"
              stroke={`${pathname == "/profile/address" ? "#fe3232" : "white"}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`${pathname == "/profile/address" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>{isLoggedIn ? isLoggedIn?.name : "Sign In"}</span>
        </div>

        {/* Cart */}
        {(pathname != "/payment" && pathname != "/address")  && (
        <div
           onClick={async()=>{
            const cart_products = await new AuthService().isUserActive()
          
            if(cart_products == null){
              toastWithTimeout(ToastVariant.Default,"Please login to view cart")
            }else{
              setMobileMenuOpen(false)
              router.push("/cart")
            }
          }} 
          className="flex  cursor-pointer pb-3 items-center   px-4 pb-  gap-2  hover:text-red-500 text-white"
        >
          <svg
            width="23"
            height="20"
            viewBox="0 0 23 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.19482 1.33325H1.69482M5.47482 1.33325L7.99483 10.4799C8.20516 11.2012 8.64202 11.8357 9.24081 12.2895C9.8396 12.7433 10.5685 12.9924 11.3198 12.9999H21.5165V1.33325H5.47482ZM13.3615 17.0833C13.3615 18.0498 12.578 18.8333 11.6115 18.8333C10.645 18.8333 9.86149 18.0498 9.86149 17.0833C9.86149 16.1168 10.645 15.3333 11.6115 15.3333C12.578 15.3333 13.3615 16.1168 13.3615 17.0833ZM21.5282 17.0833C21.5282 18.0498 20.7447 18.8333 19.7782 18.8333C18.8117 18.8333 18.0282 18.0498 18.0282 17.0833C18.0282 16.1168 18.8117 15.3333 19.7782 15.3333C20.7447 15.3333 21.5282 16.1168 21.5282 17.0833Z"
              stroke={`${pathname == "/cart" ? "#fe3232" : "white"}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`${pathname == "/cart" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Cart</span>
        </div>
        )}
      </div> 
    </div>
  </div>
)}
    </>
  );
}

// HeroContent Subcomponent
export function HeroContent() {
  return (
    <div className=" mx-auto bg-[#222222] px-4 lg:px-9 pt-20 lg:pb-32 h-full">
      <div className="flex flex-col-reverse lg:flex-row  lg:w-[95%] mx-auto gap-12 items-center">
        <div
          className="space-y-6 flex flex-col justify-center lg:p-10 lg:w-1/2 "
          style={{ fontFamily: "Jost" }}
        >
          <h1 className="text-3xl lg:text-6xl font-[600] text-white leading-tight">
            YOUR TRUSTED PARTNER IN{" "}
            <span className="text-red-500">CUSTOM</span> SPORTSWEAR
          </h1>
          <p className="text-[#FAFAFA] max-w-lg">
            We deliver top-tier solutions crafted to your unique needs, combining
            precision, speed, and innovation to help you succeed.
          </p>
          <Link href={"/customize"}>
          <Button className="bg-red-500 lg:w-1/2 w-full hover:bg-red-600 text-white px-2 py-6 lg:text-lg font-semibold text-[18px] rounded-none ">
            Customize Your Jersey Now
          </Button>
          </Link>
        </div>
        <div className="lg:absolute right-0 flex justify-center h-full lg:w-1/2 ">
          <div className="relative   ">
            <Image
              src={`/hero1.svg`} 
              alt="Soccer player kicking ball"
              width={500}
              height={500}
              className="lg:w-[80%]   m-auto h-full"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ EditComponent,isRefreshing,setIsRefreshing }: any) {
  // Controls which form to show
  const [step, setStep] = useState<"LOGIN" | "OTP">("LOGIN")
  const [isSignup, setIsSignup] = useState(false)
  const [open, setOpen] = useState(false)

  // Data for both steps
  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
    name: "" // Added name field for signup
  })

  // handle login submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you might call your backend to send an OTP
    if(!isSignup){
      const userExists = await new AuthService().check_user_exists(formData.phoneNumber.startsWith('+91') 
      ? formData.phoneNumber 
      : `+91${formData.phoneNumber}`)
      if(!userExists){
        setOpen(false)
        toastWithTimeout(ToastVariant.Default,"User does not exist")
        return 
      }
     
     
    }
    makeApiCall(() => new AuthService().login_user(formData.phoneNumber.startsWith('+91') 
      ? formData.phoneNumber 
      : `+91${formData.phoneNumber}`),{
      afterSuccess: () => {
        setStep("OTP")
      },
      afterError: () => {
        setOpen(false)
        toastWithTimeout(ToastVariant.Default,"An Error Occured")
      }
    })
 
    setStep("OTP")
  }

  // handle otp submission
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would verify the OTP with your backend
    makeApiCall(() => new AuthService().verify_otp(formData.otp, formData.phoneNumber.startsWith('+91') 
      ? formData.phoneNumber 
      : `+91${formData.phoneNumber}`),{
      afterSuccess: async (data:any) => {
        toastWithTimeout(ToastVariant.Default,"OTP Verified")
        if(isSignup){
          await new AuthService().create_user(formData.phoneNumber.startsWith('+91') 
      ? formData.phoneNumber 
      : `+91${formData.phoneNumber}`, formData.name, data.user.id)
        }
        setIsRefreshing(!isRefreshing)
        setOpen(false) // Close the sheet after successful OTP verification
      },
      afterError: () => {
        setOpen(false)
        toastWithTimeout(ToastVariant.Default,"An Error Occured")
      }
    })
  }

  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {EditComponent}
      </SheetTrigger>

      <SheetContent  className="w-full sm:max-w-md z-[1000]">
        {step === "LOGIN" && (
          <>
            <SheetHeader className="pb-2">
              <SheetTitle className="text-xl flex flex-col">
                {isSignup ? "Signup" : "Login"} <span onClick={() => setIsSignup(!isSignup)} className="text-sm cursor-pointer font-normal text-red-500">{isSignup ? "or login to your account" : "or create an account"}</span>
              </SheetTitle>
            </SheetHeader>

            <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-4">
              {isSignup && (
                <div>
                  <TextField
                    id="name"
                    required
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    size="medium"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    value={formData.name}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
              )}
              <div>
                <TextField
                  id="phoneNumber"
                  required
                  type="tel"
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  size="medium"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  value={formData.phoneNumber}
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 rounded-none text-white"
              >
                {isSignup ? "Sign Up" : "Login"}
              </Button>
              <p className="text-xs text-center text-gray-500">
                By clicking on {isSignup ? <span onClick={() => setIsSignup(!isSignup)} className="text-foreground hover:underline cursor-pointer">Sign Up</span> : <span onClick={() => setIsSignup(!isSignup)} className="text-foreground hover:underline cursor-pointer">Login</span>}, I accept the{" "}
                
                   <Link href="https://sites.google.com/view/bega-sportswear-terms-and-cond/home" target="_blank" className="text-foreground hover:underline">Terms & Conditions</Link>
                {" "}
                &{" "}
                
                  <Link href="https://sites.google.com/view/bega-sportswear-privacy-policy/home" target="_blank" className="text-foreground hover:underline">Privacy Policy</Link>
                .
              </p>
              {/* <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Already have an account? Login" : "New user? Sign up"}
              </Button> */}
            </form>
          </>
        )}

        {step === "OTP" && (
          <>
            <SheetHeader className="pb-2">
              <SheetTitle className="text-xl">Enter OTP</SheetTitle>
              <p className="text-sm text-gray-600">
                We&apos;ve sent an OTP to your phone number.
              </p>
            </SheetHeader>

            <form onSubmit={handleOtpSubmit} className="space-y-4 pt-4">
              <TextField
                label="Phone Number"
                variant="outlined"
                type="tel"
                fullWidth
                disabled
                value={formData.phoneNumber}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="One time password"
                variant="outlined"
                fullWidth
                required
                onChange={(e) => setFormData((prev) => ({ ...prev, otp: e.target.value }))}
                value={formData.otp}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 rounded-none text-white"
              >
                Verify OTP
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

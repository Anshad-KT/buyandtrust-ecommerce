'use client'
import Link from "next/link";
import Image from "next/image"; 

import { useEffect, useState, useCallback } from "react";
import { makeApiCall } from "@/lib/apicaller";

import { motion } from 'framer-motion';
import { useRef } from "react";
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
// import { useLogin } from "@/app/LoginContext";
import { ShoppingCart } from "lucide-react";
import { EcomService } from "@/services/api/ecom-service";
import { useLogin } from "../LoginContext";
import { HeroContent } from "./Hero-section";

export default function HeroSection() {
  
  return (
    <div className="min-h-screen h-full relative bg-black">
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
    // const [cartItemCount, setCartItemCount] = useState(0);
    const {isLoggedIn, setIsLoggedIn, isRefreshing, setIsRefreshing, cartItemCount, setCartItemCount} = useLogin();
    
    useEffect(() => {
      // Fetch user details from API
      makeApiCall(()=> new EcomService().getUserDetails(), {
        afterSuccess: async (userData: any) => {
          setIsLoggedIn(userData)
          
          // Merge guest cart with user cart on login
          try {
            const ecomService = new EcomService();
            const session = await ecomService.getCurrentSession();
            if (session?.user?.id) {
              await ecomService.mergeGuestCartOnLogin(session.user.id);
              // Refresh cart count after merge
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
          } catch (error) {
            console.error('Error merging guest cart:', error);
          }
          
          router.refresh()
        }
      })
    }, [isLoggedIn])
      
    const pathname = usePathname()
    
    const fetchCartItems = useCallback(async () => {
        try {
          // Fetch only this user's cart products
          const cartProducts = await new EcomService().get_cart_products();
          const totalItems = cartProducts.reduce((acc: number, product: any) => acc + (product.localQuantity || 1), 0);
          setCartItemCount(totalItems);
        } catch {
          setCartItemCount(0);
        }
      }, [setCartItemCount]);

      useEffect(() => {
      fetchCartItems();
      
      window.addEventListener('cartUpdated', fetchCartItems);
      window.addEventListener('storage', fetchCartItems); 
      
      return () => {
        window.removeEventListener('cartUpdated', fetchCartItems);
        window.removeEventListener('storage', fetchCartItems);
      };
    }, [isLoggedIn, fetchCartItems]);
    
    const toggleMobileMenu = () => {
      setMobileMenuOpen((prev) => !prev);
    };
  
    const handleCartClick = (e: any) => {
      router.push("/cart");
    };
  
    return (
      <>
        <div className={`pt-10 ${pathname == "/" ? "bg-[#FFECD9]" : "bg-white"}`}>
          <motion.nav
            ref={useRef(null)}
            className="bg-[#1C1C24] px-4 py-4 w-[90%] mx-auto rounded-xl relative z-[50]"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="container mx-auto flex items-center justify-between">
              {/* Logo - Always visible */}
              <Image
                src={`/bntnavlogo.svg`}
                alt="B&T Logo"
                width={80}
                height={40}
                className="h-10 w-auto"
              />
              
              {/* Desktop Navigation Links - Only visible on lg and up */}
              <motion.div
                className="hidden lg:flex space-x-8 text-gray-300 justify-center font-thin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.a
                  href="/"
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className={`${pathname == "/" ? "text-[#fe3232]  hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Home</span>
                </motion.a>

                <motion.a
                  onClick={() => router.push("/product")}
                  className="hover:text-white transition-colors cursor-pointer"
                  whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className={`${pathname == "/product" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Products</span>
                </motion.a>
                <motion.a
                  href="https://wa.me/+919995303951"
                  target="_blank"
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className={`${pathname == "/contact" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Contact Us</span>
                </motion.a>
              </motion.div>
              
              {/* Large screen cart and profile */}
              <div className="hidden lg:flex items-center space-x-6">
                {/* Cart - Visible on large screens */}
                {(pathname != "/address") && (
                  <motion.a
                    onClick={handleCartClick}
                    className="hover:text-red-500 transition-colors relative cursor-pointer"
                    whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ShoppingCart className="text-[#FFFFFF]"/>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black border-2 border-[#FF890B] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </motion.a>
                )}
                
                {/* Profile/Sign In - Visible on large screens */}
                {isLoggedIn ? (
                  <motion.a
                    onClick={() => router.push("/profile/my-profile")}
                    className="hover:text-white transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-8 h-8">
                      <svg width="90%" height="90%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 19.5C22.1421 19.5 25.5 16.1421 25.5 12C25.5 7.85786 22.1421 4.5 18 4.5C13.8579 4.5 10.5 7.85786 10.5 12C10.5 16.1421 13.8579 19.5 18 19.5Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.5 31.5C4.5 26.5293 10.6472 22.5 18 22.5C25.3528 22.5 31.5 26.5293 31.5 31.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </motion.a>
                ) : (
                  <motion.a
                    onClick={() => router.push("/signup")}
                    className="hover:text-white transition-colors cursor-pointer border border-white rounded-md px-4 py-1"
                    whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className={`${pathname == "/login" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Sign in</span>
                  </motion.a>
                )}
              </div>
              
              {/* Mobile/Tablet Menu Button - Visible on all screens below lg */}
              <div className="lg:hidden flex items-center">
                <Image 
                  src="/navbar.png" 
                  onClick={toggleMobileMenu} 
                  width={25} 
                  height={25} 
                  alt="Menu" 
                  className="cursor-pointer" 
                />
                
                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                  <div className="absolute right-4 top-16 w-[200px] bg-[#1C1C24] rounded-md shadow-md z-[10000000]">
                    <motion.a
                      href="/"
                      className="block px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      whileHover={{ scale: 1.05, color: "#FFFFFF" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className={`${pathname == "/" ? "text-[#fe3232]" : "text-white"}`}>Home</span>
                    </motion.a>
                    <motion.a
                      href="https://wa.me/+919995303951"
                      target="_blank"
                      className="block px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      whileHover={{ scale: 1.05, color: "#FFFFFF" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      CONTACT US
                    </motion.a>
                    <motion.a
                      onClick={() => {
                        router.push("/product");
                        setMobileMenuOpen(false);
                      }}
                      className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05, color: "#FFFFFF" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className={`${pathname == "/product" ? "text-[#fe3232]" : "text-white"}`}>Products</span>
                    </motion.a>
                    
                    {/* Cart - In dropdown menu for tablet/mobile */}
                    {(pathname != "/payment" && pathname != "/address") && (
                      <motion.a
                        onClick={() => {
                          router.push("/cart");
                          setMobileMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        whileHover={{ scale: 1.05, color: "#FFFFFF" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center">
                          Cart
                          {cartItemCount > 0 && (
                            <span className="ml-2 bg-white text-black border-2 border-[#FF890B] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {cartItemCount}
                            </span>
                          )}
                        </div>
                      </motion.a>
                    )}
                    
                    {/* Profile/Sign In - In dropdown menu for tablet/mobile */}
                    {isLoggedIn ? (
                      <motion.a
                        onClick={() => {
                          router.push("/profile/my-profile");
                          setMobileMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        whileHover={{ scale: 1.05, color: "#FFFFFF" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center">
                          <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 19.5C22.1421 19.5 25.5 16.1421 25.5 12C25.5 7.85786 22.1421 4.5 18 4.5C13.8579 4.5 10.5 7.85786 10.5 12C10.5 16.1421 13.8579 19.5 18 19.5Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.5 31.5C4.5 26.5293 10.6472 22.5 18 22.5C25.3528 22.5 31.5 26.5293 31.5 31.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="ml-2">My Profile</span>
                        </div>
                      </motion.a>
                    ) : (
                      <motion.a
                        onClick={() => {
                          router.push("/signup");
                          setMobileMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        whileHover={{ scale: 1.05, color: "#FFFFFF" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        Sign in
                      </motion.a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.nav>
        </div>
      </>
    );
  }
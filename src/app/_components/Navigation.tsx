'use client'
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";
import { makeApiCall } from "@/lib/apicaller";

import { motion } from 'framer-motion';
import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
// import { useLogin } from "@/app/LoginContext";
import { ShoppingCart, Menu } from "lucide-react";
import { EcomService } from "@/services/api/ecom-service";
import { useLogin } from "../LoginContext";
import { HeroContent } from "./Hero-section";
import { useCart } from "@/hooks/useCart";

export default function HeroSection() {

  return (
    <div className="h-full relative">
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
  const [isAtTop, setIsAtTop] = useState(true);
  // const [cartItemCount, setCartItemCount] = useState(0);
  const { isLoggedIn, setIsLoggedIn, isRefreshing, setIsRefreshing, cartItemCount, setCartItemCount } = useLogin();
  const { updateCartCount } = useCart();
  const navRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<SVGSVGElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fetch user details from API
    makeApiCall(() => new EcomService().getUserDetails(), {
      afterSuccess: async (userData: any) => {
        setIsLoggedIn(userData)

        // Merge guest cart with user cart on login
        try {
          const ecomService = new EcomService();
          const session = await ecomService.getCurrentSession();
          if (session?.user?.id) {
            await ecomService.mergeGuestCartOnLogin(session.user.id);
            // Refresh cart count after merge
            updateCartCount();
          }
        } catch (error) {
          console.error('Error merging guest cart:', error);
        }

        router.refresh()
      }
    })
  }, [isLoggedIn])

  const pathname = usePathname()

  // Close mobile menu on outside click or route change
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [mobileMenuOpen]);

  // Also close menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleCartClick = (e: any) => {
    router.push("/cart");
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 ${isAtTop ? (pathname === "/" ? "bg-white" : "bg-white") : "bg-white"
        }`}>
        <div className="pt-0">
          <motion.nav
            ref={navRef}
            className="px-4 md:px-16 py-3 w-full mx-auto relative z-[50]"
            initial={{ opacity: 0, y: -50 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
              backgroundColor: "white",
              backdropFilter: "blur(0px)",
            }}
            transition={{
              duration: 0.25,
              ease: "easeInOut"
            }}
          >
            <motion.div className="container mx-auto flex items-center justify-between">
              {/* Logo - Always visible */}
              <Link href="/">
                <img
                  src='/navbar/navbarlogo4.png'
                  alt="B&T Logo"
                  width={100}
                  height={40}
                  className="h-10 w-full cursor-pointer"
                />
              </Link>

              {/* Desktop Navigation Links - Only visible on lg and up */}
              <motion.div
                className="hidden lg:flex space-x-8 text-gray-700 justify-center font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Link
                  href="/"
                  className="
                  font-helvetica
                  font-normal
                  text-[16px]
                  leading-[100%]
                  text-center
                  text-gray-700
                  hover:text-gray-900
                "
                >
                  Home
                </Link>

                <Link
                  href="/product"
                  className="font-helvetica font-normal text-[16px] leading-[100%] text-center text-gray-700 hover:text-gray-900"
                >
                  Products
                </Link>

                <Link
                  href="https://wa.me/+919995303951"
                  target="_blank"
                  className="font-helvetica font-normal text-[16px] leading-[100%] text-center text-gray-700 hover:text-gray-900"
                >
                  Contact Us
                </Link>

              </motion.div>

              {/* Large screen cart and profile */}
              <div className="hidden lg:flex items-center space-x-4">
                {/* Cart - Visible on large screens */}
                {(pathname != "/address") && (
                  <Link href="/cart" className="relative">
                    <ShoppingCart className="h-6 w-6 text-gray-700" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile/Sign In - Visible on large screens */}
                {isLoggedIn ? (
                  <Link href="/profile/my-profile" className="font-helvetica font-normal text-[16px] leading-[100%] text-blue-600 hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-sm font-medium">
                    PROFILE
                  </Link>
                ) : (
                  <Link href="/signup" className="font-helvetica font-normal text-[16px] leading-[100%] text-[#000000] hover:text-gray-700 hover:scale-105 transition-transform duration-200 text-sm font-medium border border-gray-500 rounded-none px-8 py-2">
                    LOGIN
                  </Link>
                )}
              </div>

              {/* Mobile/Tablet Menu Button - Visible on all screens below lg */}
              <div className="lg:hidden flex items-center gap-4">
                {/* Cart Icon - Mobile View */}
                {(pathname != "/address") && (
                  <Link href="/cart" className="relative">
                    <ShoppingCart className="h-6 w-6 text-gray-700" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                <Menu
                  onClick={toggleMobileMenu}
                  size={25}
                  className="cursor-pointer text-gray-700"
                  ref={triggerRef}
                />

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                  <div ref={menuRef} className="absolute right-4 top-16 w-[200px] bg-white rounded-md shadow-md z-[10000000]">
                    <Link
                      href="/"
                      className="block px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="https://wa.me/+919995303951"
                      target="_blank"
                      className="block px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/product"
                      className="block px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Products
                    </Link>

                    {/* Profile/Sign In - In dropdown menu for tablet/mobile */}
                    {isLoggedIn ? (
                      <Link
                        href="/profile/my-profile"
                        className="block px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                    ) : (
                      <Link
                        href="/signup"
                        className="block px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.nav>
        </div>
      </div>
    </>
  );
}

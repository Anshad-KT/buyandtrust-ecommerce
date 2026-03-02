"use client";

import {
  Navbar,
  NavBody,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogin } from "@/app/LoginContext";
import { useCart } from "@/hooks/useCart";
import { makeApiCall } from "@/lib/apicaller";
import { EcomService } from "@/services/api/ecom-service";

const navItems = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Products",
    link: "/product",
  },
  {
    name: "Contact Us",
    link: "https://wa.me/+919995303951",
    external: true,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { isLoggedIn, setIsLoggedIn, cartItemCount } = useLogin();
  const { updateCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hideCart = pathname === "/address";

  useEffect(() => {
    makeApiCall(() => new EcomService().getUserDetails(), {
      afterSuccess: async (userData: any) => {
        setIsLoggedIn(userData);
        try {
          const ecomService = new EcomService();
          const session = await ecomService.getCurrentSession();
          if (session?.user?.id) {
            await ecomService.mergeGuestCartOnLogin(session.user.id);
            updateCartCount();
          }
        } catch (error) {
          console.error("Error merging guest cart:", error);
        }
      },
      afterError: () => {
        setIsLoggedIn(false);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoggedIn]);

  useEffect(() => {
    updateCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="relative w-full shadow-none  rounded-none ">
      <Navbar className="fixed  rounded-none  inset-x-0 top-2 px-6  shadow-none z-[100]">
        <NavBody className="!max-w-screen-2xl  border-b border-black/5 bg-white   py-3 md:px-8">
          <Link href="/" className="relative z-30 shrink-0" aria-label="Buy and Trust home">
            <Image
              src="/navbar/navbarlogo4.png"
              alt="Buy and Trust"
              width={190}
              height={48}
              priority
              sizes="(max-width: 768px) 150px, 190px"
              className="h-10 w-auto max-w-[190px] object-contain"
            />
          </Link>

          <div className="absolute inset-0 hidden items-center justify-center gap-8 lg:flex">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-helvetica text-[16px] font-normal leading-[100%] text-gray-700 hover:text-gray-900"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.link}
                  className="font-helvetica text-[16px] font-normal leading-[100%] text-gray-700 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>

          <div className="relative z-30 flex items-center gap-4">
            {!hideCart && (
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {isLoggedIn ? (
              <Link
                href="/profile/my-profile"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                PROFILE
              </Link>
            ) : (
              <Link
                href="/signup"
                className="border border-gray-500 rounded-none px-6 py-2 text-[#000000] hover:text-gray-700 text-sm font-medium transition-colors"
              >
                LOGIN
              </Link>
            )}
          </div>
        </NavBody>

        <MobileNav className="border-b  border-black/5 bg-white px-4 py-3">
          <MobileNavHeader>
            <Link href="/" className="shrink-0" aria-label="Buy and Trust home">
              <Image
                src="/navbar/navbarlogo4.png"
                alt="Buy and Trust"
                width={150}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-4">
              {!hideCart && (
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="top-14"
          >
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative block text-neutral-600"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative block text-neutral-600"
                >
                  {item.name}
                </Link>
              ),
            )}
            <div className="flex w-full flex-col gap-3 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/profile/my-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                >
                  My Profile
                </Link>
              ) : (
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                >
                  Login
                </Link>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

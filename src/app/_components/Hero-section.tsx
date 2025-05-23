'use client'
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { Sheet,SheetContent, SheetHeader,SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { makeApiCall } from "@/lib/apicaller";
import { AuthService } from "@/services/api/auth-service";
import { motion } from 'framer-motion';
import { useRef } from "react";
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
// import { useLogin } from "@/app/LoginContext";
import { Navigation } from "./Navigation";
import { EcomService } from "@/services/api/ecom-service";
import { useLogin } from "../LoginContext";
import '@fontsource-variable/inter-tight';
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
export function HeroContent() {
    return (
      <div className="relative mx-auto bg-[#FFECD9] px-4 lg:px-9 pt-20 lg:pb-28 h-full flex items-center justify-center">
        <div className=" max-w-4xl mx-auto">
          {/* STAR ICON */}
          <motion.div 
            className="absolute top-15 left-full star-wrapper"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="shimmer-effect"></div>
            <div className="glow-effect"></div>
            <Image
              src="/Vector.png"
              alt="Premium Product"
              width={95}
              height={104}
              className="star-image rounded-2xl object-cover"
            />
          </motion.div>
  
            {/* STAR ICON - Bottom Left */}
            <motion.div 
              className="absolute bottom-10 left-20 star-wrapper-delayed" 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="shimmer-effect"></div>
              <div className="glow-effect"></div>
              <Image
                src="/Vector.png"
                alt="Premium Product"
                width={56}
                height={56}
                className="star-image rounded-2xl object-cover"
              />
            </motion.div>
  
          <div
            className="space-y-6 flex flex-col items-center justify-center"
            style={{ fontFamily: "Jost" }}
          >
            <div className="relative w-full px-4 py-16 overflow-hidden">
              <div className="container mx-auto relative z-10">
                <div className="flex flex-col items-center">
                  {/* Top row with "Where Buying" and image */}
                  <div className="flex items-center w-full justify-between mb-4" >
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-4xl lg:text-7xl font-bold text-[#1E1E2A] "
                      style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
                    >
                      Where Buying
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="relative h-20 w-64 overflow-hidden"
                    >
                      <Image
                        src="/img1.jpeg"
                        alt="Premium Product"
                        width={256}
                        height={80}
                        className="rounded-3xl object-cover h-full w-full"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Bottom row with images and "Meets Trust" */}
                  <div className="flex items-center w-full justify-between">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="flex space-x-4"
                    >
                      <div className="relative h-28 w-48 overflow-hidden">
                        <Image
                          src="/img2.jpeg"
                          alt="Quality Material"
                          width={144}
                          height={112}
                          className="rounded-full object-cover h-full w-full"
                        />
                      </div>
                      <div className="relative h-28 w-34 overflow-hidden">
                        <Image
                          src="/img3.jpeg"
                          alt="Expert Craftsmanship"
                          width={144}
                          height={112}
                          className="rounded-full object-cover h-full w-full"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-4xl lg:text-7xl font-bold text-[#1E1E2A] sm:text-right text-center w-full sm:w-auto"
                      style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
                    >
                      Meets Trust
                    </motion.div>
                  </div>
                </div>
                
                
                {/* Description and CTA Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-center mt-8"
                >
                  <p className="text-[#202020] mx-auto max-w-lg mb-6 text-base leading-tight" style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}>
                    Welcome to Buy and Trust – where quality meets affordability. We specialize in offering premium products 
                    and services at competitive rates, ensuring you get the best value for your money.
                  </p>
                  <Link href={"/product"}>
                    <Button className="bg-[#1E1E2A] mx-auto hover:bg-white hover:text-[#1E1E2A] text-white px-6 py-3 text-base rounded-full">
                      Shop Now
                    </Button>
                  </Link>
  
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
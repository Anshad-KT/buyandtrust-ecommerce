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
    <div className="relative mx-auto bg-[#FFECD9] px-4 lg:px-9 pt-8 sm:pt-12 lg:pt-20 lg:pb-28 h-full flex items-center justify-center">
      <div className="max-w-4xl mx-auto">
        {/* STAR ICON - Desktop only */}
        <motion.div 
          className="absolute top-21 right-48 star-wrapper-delayed hidden lg:block" 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
        <Image
          src="/star.svg"
          alt="Premium Product"
          width={95}
          height={104}
          className="absolute bottom-30 left-full star-wrapper hidden lg:block"
        />
        </motion.div>

        {/* STAR ICON - Bottom Left - Desktop only */}
        <motion.div 
          className="absolute bottom-10 left-20 star-wrapper-delayed hidden lg:block" 
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
          <div className="relative w-full px-4 py-2 lg:py-2 overflow-hidden">
            <div className="container mx-auto relative z-10">
              
              {/* Desktop Layout */}
              <div className="hidden lg:flex flex-col items-center">
                {/* Top row with "Where Buying" and image */}
                <div className="flex items-center w-full justify-between mb-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl lg:text-7xl font-bold text-[#1E1E2A]"
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
                      src="/img3.jpeg"
                      alt="Premium Product"
                      width={256}
                      height={80}
                      className="rounded-full object-cover h-full w-full"
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
                    <div className="relative h-20 w-64 overflow-hidden">
                      <Image
                        src="/mobimg2.png"
                        alt="Quality Material"
                        width={144}
                        height={112}
                        className="rounded-full object-cover h-full w-full"
                      />
                    </div>
                    <div className="relative h-23 w-34 overflow-hidden">
                      <Image
                        src="/mobimg3.png"
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
                    className="text-4xl lg:text-7xl font-bold text-[#1E1E2A] text-right"
                    style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
                  >
                    Meets Trust
                  </motion.div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="flex lg:hidden flex-col items-start space-y-6 relative w-full px-4 pt-2">
                {/* Decorative stars - top left and top right */}

                <Image
                  src="/star.svg"
                  alt="Star"
                  width={32}
                  height={32}
                  className="absolute right-4 top-0 w-8 h-8 z-10 opacity-80"
                  style={{ filter: "brightness(1.2)" }}
                />
                {/* First image - rounded rectangle, centered horizontally */}
                <div className="relative w-full flex justify-center items-center">
                  <Image
                    src="/img3.jpeg"
                    alt="Premium Product"
                    width={340}
                    height={120}
                    className="rounded-[2.5rem] object-cover w-[95%] h-[90px] sm:h-[110px] shadow-md"
                    style={{ objectPosition: "center" }}
                  />
                </div>
                {/* Decorative star - left, below first image */}
                <Image
                  src="/star.svg"
                  alt="Star"
                  width={28}
                  height={28}
                  className="absolute left-3 top-[90px] w-6 h-6 z-10 opacity-80"
                  style={{ filter: "brightness(1.2)" }}
                />
                {/* "Where Buying Meets Trust" text */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="w-full mt-2"
                >
                  <h1 
                    className="text-4xl sm:text-4xl font-bold text-[#1E1E2A] leading-tight text-left"
                    style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
                  >
                    Where Buying<br />Meets Trust
                  </h1>
                </motion.div>
                {/* Two circular images, spaced horizontally */}
                {/* Two circular images */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex space-x-4 justify-start w-full"
                >
                  <div className="relative h-20 w-1/2 max-w-[180px] overflow-hidden">
                    <Image
                      src="/mobimg2.png"
                      alt="Quality Material"
                      width={112}
                      height={112}
                      className="rounded-full object-cover h-full w-full"
                    />
                  </div>
                  <div className="relative h-20 w-1/2 max-w-[112px] overflow-hidden rounded-full">
                    <Image
                      src="/mobimg3.png"
                      alt="Expert Craftsmanship"
                      width={112}
                      height={112}
                      className="rounded-full object-cover h-full w-full"
                    />
                  </div>
                </motion.div>
              </div>
              
              {/* Description and CTA Button */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center mt-4 lg:mt-8"
              >
                <p className="text-[#202020]max-w-lg mb-6 text-base leading-tight" style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}>
                  Welcome to Buy and Trust – where quality meets affordability.We specialize in offering premium products and<br />
                   services at competitive rates, ensuring you get the best value for your money.
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
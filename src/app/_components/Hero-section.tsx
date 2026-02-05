'use client'
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import '@fontsource-variable/inter-tight';



export default function HeroSection() {
  return (
    <div className="min-h-screen h-full relative bg-black">
      {/* Hero Content */}
      <HeroContent />
    </div>
  );
}

export function HeroContent() {
  return (
    <div className="relative mx-auto">
     <img src="/home/bannerd.png" alt="Hero" />
    </div>
  );
}
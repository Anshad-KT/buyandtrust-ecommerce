'use client'
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import '@fontsource-variable/inter-tight';



export default function HeroSection() {
  return (
    <div className="relative w-full pt-16">
      {/* Hero Content */}
      <HeroContent />
    </div>
  );
}

export function HeroContent() {
  return (
    <div className="relative w-full">
      <img 
        src="/home/cover.svg" 
        alt="Hero" 
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

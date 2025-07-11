"use client"
// import { HeroContent } from "@/app/(protected)/hero-section";
import { HeroContent } from "@/app/_components/Hero-section";
import "@fontsource/jost"; // Defaults to weight 400
import "@fontsource/jost/600.css"; // Specify weight
import "@fontsource/jost/600-italic.css"; // Specify weight and style
// import WhyChooseUs from "@/components/why-choose-us";


import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toastWithTimeout, ToastVariant } from "@/hooks/use-toast";

 
// import JerseyCustomizer from "./_components/Customize";
import TrendingProducts from "./_components/TrendingProducts";
// import Products from "./(ecommerce)/product/_component/ProductView";
import Footer from "./_components/Footer"; 
export default function Home() {


  const searchParams = useSearchParams();
  console.log("SEARCH PARAMS page",searchParams)

  // useEffect(() => {
  //   let error = searchParams.get("error");
  //   console.log("error",error)
  //   let errorDescription = searchParams.get("error_description");
  //   console.log("errorDescription",errorDescription)
  
  //   // Fallback for hash fragment
  //   if ((!error || !errorDescription) && typeof window !== "undefined") {
  //     const hash = window.location.hash.substring(1); // Remove leading #
  //     const params = new URLSearchParams(hash);
  //     error = error || params.get("error");
  //     errorDescription = errorDescription || params.get("error_description");
  //   }
  
  //   if (error) {
  //     let message = "There was a problem logging you in. Please try again.";
  //     if (error === "access_denied" && errorDescription?.includes("expired")) {
  //       message = "Your login link has expired. Please request a new one.";
  //     } else if (errorDescription) {
  //       message = errorDescription;
  //     }
  //     toastWithTimeout(ToastVariant.Destructive, message);
  //   }
  // }, [searchParams]);

  // useEffect(() => {
  //   let error = searchParams.get("error");
  //   let errorDescription = searchParams.get("error_description");
  
  //   // Fallback for hash fragment
  //   if ((!error || !errorDescription) && typeof window !== "undefined") {
  //     const hash = window.location.hash.substring(1); // Remove leading #
  //     const params = new URLSearchParams(hash);
  //     error = error || params.get("error");
  //     errorDescription = errorDescription || params.get("error_description");
  //   }
  
  //   if (error) {
  //     let message = "There was a problem logging you in. Please try again.";
  //     if (error === "access_denied" && errorDescription?.includes("expired")) {
  //       message = "Your login link has expired. Please request a new one.";
  //     } else if (errorDescription) {
  //       message = errorDescription;
  //     }
  //     window.alert(message); // <-- Use alert instead of toast
  //   }
  // }, [searchParams]);

  return (
   <>
   <HeroContent />  
   {/* <WhyChooseUs /> */}
   
   {/* <JerseyCustomizer /> */}
   <TrendingProducts/>
   {/* <Products/> */}
   <Footer />
   </>
  );
}



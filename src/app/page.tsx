"use client"
import { HeroContent } from "@/app/(protected)/hero-section";
import "@fontsource/jost"; // Defaults to weight 400
import "@fontsource/jost/600.css"; // Specify weight
import "@fontsource/jost/600-italic.css"; // Specify weight and style
// import WhyChooseUs from "@/components/why-choose-us";
 
// import JerseyCustomizer from "./_components/Customize";
import TrendingProducts from "./_components/TrendingProducts";
// import Products from "./(ecommerce)/product/_component/ProductView";
import Footer from "./_components/Footer"; 
export default function Home() {
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



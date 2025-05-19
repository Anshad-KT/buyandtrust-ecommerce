// 'use client'
// import Link from "next/link";
// import Image from "next/image"; 
// import { Button } from "@/components/ui/button";
// import { Sheet,SheetContent, SheetHeader,SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { TextField } from "@mui/material";
// import { useEffect, useState } from "react";
// import { makeApiCall } from "@/lib/apicaller";
// import { AuthService } from "@/services/api/auth-service";
// import { motion } from 'framer-motion';
// import { useRef } from "react";
// import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
// import { usePathname, useRouter } from "next/navigation";
// // import { useLogin } from "@/app/LoginContext";
// import { ShoppingCart } from "lucide-react";
// import { EcomService } from "@/services/api/ecom-service";
// import { useLogin } from "../LoginContext";
// export default function HeroSection() {
  
//   return (
//     <div className="min-h-screen h-full relative bg-black">
//       {/* Navigation */}
//       <Navigation />

//       {/* Hero Content */}
//       <HeroContent />
//     </div>
//   );
// }


// export function Navigation() {
//   const router = useRouter();

//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [cartItemCount, setCartItemCount] = useState(0);
//   const {isLoggedIn,setIsLoggedIn,isRefreshing,setIsRefreshing} = useLogin();
  
//   // User state for authentication
   

//   useEffect(() => {
//     // Fetch user details from API
//     makeApiCall(()=> new EcomService().getUserDetails(), {
//       afterSuccess: (userData: any) => {
//         console.log("userData in callback:", userData)
//         setIsLoggedIn(userData)
//         router.refresh()
         
//       }
//     })
//   }, [isLoggedIn])
    
//   const pathname = usePathname()
//   // Fetch cart items count
//   useEffect(() => {
//     const fetchCartItems = async () => {
//       try {
//         // Fetch cart products from cart_products_data in localStorage
//         const cartProducts = localStorage.getItem('cart_products_data') ? 
//           JSON.parse(localStorage.getItem('cart_products_data') || '[]') : 
//           [];
        
//         // Calculate total items in cart based on localQuantity
//         const totalItems = cartProducts.length > 0 ? 
//           cartProducts.reduce((acc: number, product: any) => acc + (product.localQuantity || 1), 0) : 
//           0;
        
//         setCartItemCount(totalItems);
//       } catch (error) {
//         setCartItemCount(0);
//       }
//     };
    
//     fetchCartItems();
    
//     // Add event listener for cart updates
//     window.addEventListener('cartUpdated', fetchCartItems);
    
//     return () => {
//       window.removeEventListener('cartUpdated', fetchCartItems);
//     };
//   }, []);
  
//   // Toggle the mobile menu when the hamburger icon is clicked
//   const toggleMobileMenu = () => {
//     setMobileMenuOpen((prev) => !prev);
//   };

//   console.log("isLoggedIn",isLoggedIn)
//   return (
//     <>
//       <div className={`pt-10 ${pathname == "/" ? "bg-[#FFECD9]" : "bg-white"}`}>
//       <motion.nav
//         ref={useRef(null)}
//         className="bg-[#1C1C24] px-4 py-4 w-[90%] mx-auto rounded-xl relative z-[10000000]"
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
        
//         <motion.div className="container mx-auto flex items-center justify-between">
//         <Image
//           src={`/bntnavlogo.svg`}
//           alt="B&T Logo"
//           width={80}
//           height={40}
//           className="h-10 w-auto"
//         />
//           <motion.div
//             className="hidden md:flex space-x-8 text-gray-300 justify-center font-thin"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//           >
//             <motion.a
//               href="/"
//               className="hover:text-white transition-colors"
//               whileHover={{ scale: 1.1, color: "#FFFFFF" }}
//               transition={{ type: "spring", stiffness: 300 }}
//             >
//               <span className={`${pathname == "/" ? "text-[#fe3232]  hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Home</span>
//             </motion.a>
//             <motion.a
//               href="https://wa.me/9995153455"
//               className="hover:text-white transition-colors"
//               whileHover={{ scale: 1.1, color: "#FFFFFF" }}
//               transition={{ type: "spring", stiffness: 300 }}
//             >
//               <span className={`${pathname == "/contact" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Contact Us</span>
//             </motion.a>
//             <motion.a
//               onClick={async () => {
//                 // Comment out authentication check
//                 // const cart_products = await new AuthService().isUserActive()
              
//                 // if(cart_products == null){
//                 //   toastWithTimeout(ToastVariant.Default,"Please login to buy customised jersey")
//                 // }else{
//                   router.push("/product")
//                 // }
//               }}
//               className="hover:text-white transition-colors cursor-pointer"
//               whileHover={{ scale: 1.1, color: "#FFFFFF" }}
//               transition={{ type: "spring", stiffness: 300 }}
//             >
//               <span className={`${pathname == "/product" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Products</span>
//             </motion.a>
//           </motion.div>
          
//           <div className="flex items-center space-x-6">
//             {isLoggedIn ? (
//               // If user is logged in, display their name or email
//               <motion.a
//                 onClick={() => router.push("/profile/my-profile")}
//                 className="hover:text-white transition-colors cursor-pointer"
//                 whileHover={{ scale: 1.1, color: "#FFFFFF" }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <span className={`lg:block hidden ${pathname == "/profile/my-profile" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>
//                   {isLoggedIn}
//                 </span>
//               </motion.a>
//             ) : (
//             // If user is not logged in, show Sign in button
//             <motion.a
//               onClick={() => router.push("/login")}
//               className="hover:text-white transition-colors cursor-pointer lg:block hidden"
//               whileHover={{ scale: 1.1, color: "#FFFFFF" }}
//               transition={{ type: "spring", stiffness: 300 }}
//             >
//               <span className={`${pathname == "/login" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Sign in</span>
//             </motion.a>
//             )}
//             {(pathname != "/payment" && pathname != "/address") && (
//               <motion.a
//                 href="/cart"
//                 className="lg:block hidden hover:text-red-500 transition-colors relative"
//                 whileHover={{ scale: 1.1, color: "#FFFFFF" }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <ShoppingCart className="text-[#FFFFFF]"/>
//                 {cartItemCount > 0 && (
//                   <span className="absolute -top-2 -right-2 bg-white text-black border-2 border-[#FF890B] text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {cartItemCount}
//                   </span>
//                 )}
//               </motion.a>
//             )}
//           </div>

//           <motion.div className="md:hidden">
//             <Image src="/navbar.png" onClick={toggleMobileMenu} width={25} height={25} alt="Menu" className="cursor-pointer" />
//             {mobileMenuOpen && (
//               <div className="absolute right-0 mt-2 w-[200px] bg-[#1C1C24] rounded-md shadow-md z-[10000000]">
//                 <motion.a
//                   href="/"
//                   className="block px-4 py-2 text-gray-300 hover:text-white transition-colors"
//                   whileHover={{ scale: 1.05, color: "#FFFFFF" }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <span className={`${pathname == "/" ? "text-[#fe3232]" : "text-white"}`}>Home</span>
//                 </motion.a>
//                 <motion.a
//                   href="tel:+919995153455"
//                   className="block px-4 py-2 text-gray-300 hover:text-white transition-colors"
//                   whileHover={{ scale: 1.05, color: "#FFFFFF" }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   CONTACT US
//                 </motion.a>
//                 <motion.a
//                   onClick={() => {
//                     router.push("/product");
//                     setMobileMenuOpen(false);
//                   }}
//                   className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
//                   whileHover={{ scale: 1.05, color: "#FFFFFF" }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                 >
//                   <span className={`${pathname == "/product" ? "text-[#fe3232]" : "text-white"}`}>Products</span>
//                 </motion.a>
//                 {isLoggedIn ? (
//                   // If user is logged in, display their name in mobile menu
//                   <motion.a
//                     onClick={() => {
//                       router.push("/profile/my-profile");
//                       setMobileMenuOpen(false);
//                     }}
//                     className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
//                     whileHover={{ scale: 1.05, color: "#FFFFFF" }}
//                     transition={{ type: "spring", stiffness: 300 }}
//                   >
//                     {isLoggedIn}
//                   </motion.a>
//                 ) : (
//                   // If user is not logged in, show Sign in in mobile menu
//                   <motion.a
//                     onClick={() => {
//                       router.push("/login");
//                       setMobileMenuOpen(false);
//                     }}
//                     className="block px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
//                     whileHover={{ scale: 1.05, color: "#FFFFFF" }}
//                     transition={{ type: "spring", stiffness: 300 }}
//                   >
//                     Sign in
//                   </motion.a>
//                 )}
//                 {(pathname != "/payment" && pathname != "/address") && (
//                   <motion.a
//                     href="/cart"
//                     className="block px-4 py-2 text-gray-300 hover:text-white transition-colors relative"
//                     whileHover={{ scale: 1.05, color: "#FFFFFF" }}
//                     transition={{ type: "spring", stiffness: 300 }}
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     <div className="flex items-center">
//                       Cart
//                       {cartItemCount > 0 && (
//                         <span className="ml-2 bg-white text-black border-2 border-[#FF890B] text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                           {cartItemCount}
//                         </span>
//                       )}
//                     </div>
//                   </motion.a>
//                 )}
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       </motion.nav>

//       </div>
//     </>
//   );
// }

// export function HeroContent() {
//     return (
//       <div className="relative mx-auto bg-[#FFECD9] px-4 lg:px-9 pt-20 lg:pb-32 h-full flex items-center justify-center">
//         <div className=" max-w-4xl mx-auto">
//           {/* STAR ICON */}
//           <motion.div 
//             className="absolute top-15 left-full star-wrapper"
//             initial={{ opacity: 0, scale: 0.5 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <div className="shimmer-effect"></div>
//             <div className="glow-effect"></div>
//             <Image
//               src="/Vector.png"
//               alt="Premium Product"
//               width={95}
//               height={104}
//               className="star-image rounded-2xl object-cover"
//             />
//           </motion.div>
  
//             {/* STAR ICON - Bottom Left */}
//             <motion.div 
//               className="relative bottom-full left-12 star-wrapper-delayed"
//               initial={{ opacity: 0, scale: 0.5 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8, delay: 0.4 }}
//             >
//               <div className="shimmer-effect"></div>
//               <div className="glow-effect"></div>
//               <Image
//                 src="/Vector.png"
//                 alt="Premium Product"
//                 width={56}
//                 height={56}
//                 className="star-image rounded-2xl object-cover"
//               />
//             </motion.div>
  
//           <div
//             className="space-y-6 flex flex-col items-center justify-center"
//             style={{ fontFamily: "Jost" }}
//           >
//             <div className="relative w-full px-4 py-16 overflow-hidden">
//               <div className="container mx-auto relative z-10">
//                 <div className="flex flex-col items-center">
//                   {/* Top row with "Where Buying" and image */}
//                   <div className="flex items-center w-full justify-between mb-4">
//                     <motion.div 
//                       initial={{ opacity: 0, x: -50 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.8 }}
//                       className="text-4xl lg:text-7xl font-bold text-[#1E1E2A]"
//                     >
//                       Where Buying
//                     </motion.div>
//                     <motion.div 
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ duration: 0.8, delay: 0.3 }}
//                       className="relative h-20 w-64 overflow-hidden hidden sm:block"
//                     >
//                       <Image
//                         src="/img1.jpeg"
//                         alt="Premium Product"
//                         width={256}
//                         height={80}
//                         className="rounded-3xl object-cover h-full w-full"
//                       />
//                     </motion.div>
//                   </div>
                  
//                   {/* Bottom row with images and "Meets Trust" */}
//                   <div className="flex items-center w-full justify-between">
//                     <motion.div 
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ duration: 0.8, delay: 0.5 }}
//                       className="flex space-x-4 hidden sm:flex"
//                     >
//                       <div className="relative h-28 w-36 overflow-hidden">
//                         <Image
//                           src="/img2.jpeg"
//                           alt="Quality Material"
//                           width={144}
//                           height={112}
//                           className="rounded-full object-cover h-full w-full"
//                         />
//                       </div>
//                       <div className="relative h-28 w-36 overflow-hidden">
//                         <Image
//                           src="/img3.jpeg"
//                           alt="Expert Craftsmanship"
//                           width={144}
//                           height={112}
//                           className="rounded-full object-cover h-full w-full"
//                         />
//                       </div>
//                     </motion.div>
                    
//                     <motion.div 
//                       initial={{ opacity: 0, x: 50 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.8, delay: 0.2 }}
//                       className="text-4xl lg:text-7xl font-bold text-[#1E1E2A] sm:text-right text-center w-full sm:w-auto"
//                     >
//                       Meets Trust
//                     </motion.div>
//                   </div>
//                 </div>
                
                
//                 {/* Description and CTA Button */}
//                 <motion.div 
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 0.8 }}
//                   className="text-center mt-8"
//                 >
//                   <p className="text-[#202020] mx-auto max-w-lg mb-6 text-base leading-tight">
//                     Welcome to Buy and Trust – where quality meets affordability. We specialize in offering premium products 
//                     and services at competitive rates, ensuring you get the best value for your money.
//                   </p>
//                   <Link href={"/product"}>
//                     <Button className="bg-[#1E1E2A] mx-auto hover:bg-white hover:text-[#1E1E2A] text-white px-6 py-3 text-base rounded-full">
//                       Shop Now
//                     </Button>
//                   </Link>
  
//                 </motion.div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }


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
import { ShoppingCart } from "lucide-react";
import { EcomService } from "@/services/api/ecom-service";
import { useLogin } from "../LoginContext";
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
  const [cartItemCount, setCartItemCount] = useState(0);
  const {isLoggedIn, setIsLoggedIn, isRefreshing, setIsRefreshing} = useLogin();
  
  useEffect(() => {
    // Fetch user details from API
    makeApiCall(()=> new EcomService().getUserDetails(), {
      afterSuccess: (userData: any) => {
        console.log("userData in callback:", userData)
        setIsLoggedIn(userData)
        router.refresh()
      }
    })
  }, [isLoggedIn])
    
  const pathname = usePathname()
  
  // Fetch cart items count
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Fetch cart products from cart_products_data in localStorage
        const cartProducts = localStorage.getItem('cart_products_data') ? 
          JSON.parse(localStorage.getItem('cart_products_data') || '[]') : 
          [];
        
        // Calculate total items in cart based on localQuantity
        const totalItems = cartProducts.length > 0 ? 
          cartProducts.reduce((acc: number, product: any) => acc + (product.localQuantity || 1), 0) : 
          0;
        
        setCartItemCount(totalItems);
      } catch (error) {
        setCartItemCount(0);
      }
    };
    
    fetchCartItems();
    
    // Add event listener for cart updates
    window.addEventListener('cartUpdated', fetchCartItems);
    
    return () => {
      window.removeEventListener('cartUpdated', fetchCartItems);
    };
  }, []);
  
  // Toggle the mobile menu when the hamburger icon is clicked
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Handle cart click
  const handleCartClick = (e: any) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toastWithTimeout(ToastVariant.Default, "Please login to access your cart");
      return false;
    } else {
      router.push("/cart");
    }
  };

  return (
    <>
      <div className={`pt-10 ${pathname == "/" ? "bg-[#FFECD9]" : "bg-white"}`}>
        <motion.nav
          ref={useRef(null)}
          className="bg-[#1C1C24] px-4 py-4 w-[90%] mx-auto rounded-xl relative z-[10000000]"
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
                href="https://wa.me/9995153455"
                className="hover:text-white transition-colors"
                whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className={`${pathname == "/contact" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Contact Us</span>
              </motion.a>
              <motion.a
                onClick={() => router.push("/product")}
                className="hover:text-white transition-colors cursor-pointer"
                whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className={`${pathname == "/product" ? "text-[#fe3232] hover:text-white" : "text-white hover:text-[#fe3232]"}`}>Products</span>
              </motion.a>
            </motion.div>
            
            {/* Large screen cart and profile */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Cart - Visible on large screens */}
              {(pathname != "/payment" && pathname != "/address") && (
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
                  onClick={() => router.push("/login")}
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
                    href="https://wa.me/9995153455"
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
                      onClick={(e) => {
                        if (!isLoggedIn) {
                          e.preventDefault();
                          toastWithTimeout(ToastVariant.Default, "Please login to access your cart");
                          setMobileMenuOpen(false);
                        } else {
                          router.push("/cart");
                          setMobileMenuOpen(false);
                        }
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
                        router.push("/login");
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

export function HeroContent() {
    return (
      <div className="relative mx-auto bg-[#FFECD9] px-4 lg:px-9 pt-20 lg:pb-32 h-full flex items-center justify-center">
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
              className="relative bottom-full left-12 star-wrapper-delayed"
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
                  <div className="flex items-center w-full justify-between mb-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-4xl lg:text-7xl font-bold text-[#1E1E2A]"
                    >
                      Where Buying
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="relative h-20 w-64 overflow-hidden hidden sm:block"
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
                      className="flex space-x-4 hidden sm:flex"
                    >
                      <div className="relative h-28 w-36 overflow-hidden">
                        <Image
                          src="/img2.jpeg"
                          alt="Quality Material"
                          width={144}
                          height={112}
                          className="rounded-full object-cover h-full w-full"
                        />
                      </div>
                      <div className="relative h-28 w-36 overflow-hidden">
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
                  <p className="text-[#202020] mx-auto max-w-lg mb-6 text-base leading-tight">
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
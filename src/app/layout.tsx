'use client';
import localFont from "next/font/local";
import "./globals.css";
// import { Navigation } from "@/app/(protected)/hero-section";
import { Navigation } from "@/app/_components/Navigation"; 
import { HeroContent } from "@/app/_components/Hero-section";
// import { usePathname } from "next/navigation";
import "@fontsource/montserrat"; // Defaults to weight 400
import "@fontsource/montserrat/400.css"; // Specify weight
import "@fontsource/montserrat/400-italic.css"; // Specify weight and style
import { Toaster } from "@/components/ui/toaster";
import { LoginProvider } from "./LoginContext";
import { CurrencyProvider } from "./CurrencyContext";
import AuthMetaUpdater from "./AuthMetaUpdater";

import { usePathname } from "next/navigation";




const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  console.log("Path name",pathname)

  
  // Check if the current path is the address sheet page
  const isAddressSheetOpen = pathname.includes('/profile/add-address');

  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "Montserrat" }}
      >
        <LoginProvider>
          <CurrencyProvider>
            <AuthMetaUpdater />
            <div className={`relative w-full ${isAddressSheetOpen ? 'z-0' : ''}`}>
              {pathname == '/' 
       
              }

              {/* Navigation */}
               
              <Navigation />
              
              {/* Spacer for fixed navbar */}
              <div className="h-28"></div>
              

              {/* Hero Content */}
            </div>

            {children}

            <Toaster />
          </CurrencyProvider>
        </LoginProvider> 
      </body>
    </html>
  );
}

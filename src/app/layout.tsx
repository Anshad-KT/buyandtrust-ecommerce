'use client'

import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat, Poppins, Shadows_Into_Light } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LoginProvider } from "./LoginContext";
import { CurrencyProvider } from "./CurrencyContext";
import AuthMetaUpdater from "./AuthMetaUpdater";
import { usePathname } from "next/navigation";
import { Navigation } from "@/app/_components/Navigation";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-playfair",
});



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows-into-light",
  subsets: ["latin"],
  weight: ["400"],
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
        className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable} ${montserrat.variable} ${poppins.variable} ${shadowsIntoLight.variable} antialiased`}
      >
        <LoginProvider>
          <CurrencyProvider>
            <AuthMetaUpdater />
            <div className={`relative w-full ${isAddressSheetOpen ? 'z-0' : ''}`}>
              {pathname == '/' 
       
              }

              {/* Navigation */}
               
              <Navigation />
              {/* <div className="h-28"></div> */}
            </div>
            {children}
            <Toaster />
          </CurrencyProvider>
        </LoginProvider>
      </body>
    </html>
  );
}

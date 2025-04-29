'use client';
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/hero-section";
import { usePathname } from "next/navigation";
import "@fontsource/montserrat"; // Defaults to weight 400
import "@fontsource/montserrat/400.css"; // Specify weight
import "@fontsource/montserrat/400-italic.css"; // Specify weight and style
import { Toaster } from "@/components/ui/toaster";
import { LoginProvider } from "./LoginContext";
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
 

  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "Montserrat" }}
      >
        <LoginProvider>
        <div className="bg-[#222222] relative w-full">
          {pathname == '/' && (
            <img
              src="/background.svg"
              className="absolute right-0 w-1/2 z-[10] lg:block hidden"
              alt=""
            />
          )}

          {/* Navigation */}
          <Navigation />

          {/* Hero Content */}
        </div>

        {children}

        {/* Fixed WhatsApp Icon */}
        <a
          href="https://wa.me/your-number" // Replace 'your-number' with the WhatsApp number (e.g., 1234567890)
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="w-16 h-16" // Adjust size as needed
          />
          <Toaster />
        </a></LoginProvider>
      </body>
    </html>
  );
}

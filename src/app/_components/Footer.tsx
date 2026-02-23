"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  

  return (
    <footer className="pt-16 pb-28 md:pb-16 relative">
      {/* Background decorative elements */}
      
      <Image 
        src="/footer/Footer Strip.png" 
        alt="Footer Background" 
        width={1920} 
        height={1080} 
        className="absolute top-0 left-0 right-0 w-full h-auto object-cover z-0 md:-top-8" 
      />

      {/* Chakra decorative elements */}
      <div className="absolute right-0 bottom-40 opacity-10">
        <Image 
          src="/vectorchakra1.png" 
          alt="Decorative chakraaaaa" 
          width={100} 
          height={100}
        />
      </div>
      <div className="absolute right-0 bottom-28 opacity-10">
        <Image 
          src="/chakra1footer.svg" 
          alt="Decorative chakraaaaa" 
          width={100} 
          height={100}
        />
      </div>
      <div className="absolute hidden md:block left-20 bottom-10 opacity-10">
        <Image 
          src="/vectorchakra2.png" 
          alt="Decorative chakra" 
          width={262} 
          height={160}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Logo and Tagline */}
          <div className="md:ml-7">
            <div className="mb-12">
              <div className="flex flex-col items-start">
                <img
                  src="/footer/footerlogo.svg"  
                  alt="B&T Logo"
                  className="w-44 md:w-56 h-auto"
                />
              </div>
            </div>


          </div>

          {/* Right Column - Contact Information */}
          <div>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://www.instagram.com/the.perfect_choices"
                target="_blank"
                className="hover:scale-105 transition-transform"
                rel="noopener noreferrer"
              >
                <Image src="/footer/instagram.svg" alt="Instagram" width={40} height={40} />
              </a>
              <a 
                href="https://wa.me/+919995303951"
                target="_blank"
                className="hover:scale-105 transition-transform"
                rel="noopener noreferrer"
              >
                <Image src="/footer/whatsapp.svg" alt="WhatsApp" width={40} height={40} />
              </a>
            </div>

            <div className="space-y-6">
              <h3 className="text-[20px] mb-4">Contact Us</h3>

              <div>
                <a href="tel:+919995303951" className="block mb-1 hover:text-gray-700 transition-colors font-helvetica text-[17px]" style={{ fontWeight: 400, fontStyle: 'normal', lineHeight: '160%', letterSpacing: '0%' }}>
                  +91 99953 03951
                </a>
                {/* <h1 className="hover:text-gray-700 transition-colors font-futura">Distributed by:</h1>
                <h1 className="hover:text-gray-700 transition-colors font-futura">Thimothy Distribution (OPC) Pvt Ltd</h1> */}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">
                    <svg width="20" height="15" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.203125 0.265625H25.7969V17.7344H0.203125V0.265625Z" fill="#F4F5F4"/>
                      <path d="M0.203125 0.265625H25.7969V6.06281H0.203125V0.265625Z" fill="#E97403"/>
                      <path d="M0.203125 11.9414H25.7969V17.7386H0.203125V11.9414Z" fill="#258C05"/>
                      <path d="M13 6.4043C11.5659 6.4043 10.4041 7.56617 10.4041 9.00023C10.4041 10.4343 11.5659 11.5962 13 11.5962C14.4341 11.5962 15.5959 10.4343 15.5959 9.00023C15.5959 7.56617 14.4341 6.4043 13 6.4043Z" fill="#07277E"/>
                    </svg>
                  </span>
                  <span>India</span>
                </div>
                <address className="text-gray-900 text-sm leading-relaxed not-italic">
                  THIMOTHY DISTRIBUTION OPC PVT LTD<br />
                  <br />
                  KUNJATHANPARAMBIL MOOLAVATTOM P.O,<br />
                  NA,<br />
                  Kottayam, Kerala, India.<br />
                  Pincode - 686012
                </address>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">
                    <svg width="20" height="15" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 0V5.66667H0V0H24Z" fill="#479951"/>
                      <path d="M24 5.66602V11.3327H0V5.66602H24Z" fill="white"/>
                      <path d="M24 11.334V17.0007H0V11.334H24Z" fill="#222222"/>
                      <path d="M5.33331 17H-2.00272e-05V0H5.33331V17Z" fill="#E74C3C"/>
                    </svg>
                  </span>
                  <span>UAE</span>
                </div>
                <address className="text-gray-900 text-sm not-italic">
                  Sharjah Media City, Sharjah, UAE
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions and Privacy Policy */}

      {/* Powered by HANCOD */}
      <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-xs text-gray-600 select-none text-center w-full">
        Powered by <a href="https://duxbe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">DUXBE</a>
      </div>
      {/* Terms and Conditions and Privacy Policy */}
      <div
        className="
          absolute
          left-1/2
          bottom-12
          -translate-x-1/2
          text-center
          text-xs
          text-gray-700
          select-none
          md:left-8
          md:bottom-2
          md:text-left
          md:translate-x-0
        "
      >
        <span>
          <Link href="/terms-and-conditions" className="underline hover:text-gray-500">
            Terms and Conditions
          </Link>
          {" "}and{" "}
          <Link href="/privacy-policy" className="underline hover:text-gray-500">
            Privacy Policy
          </Link>
        </span>
      </div>
      {/* Shipping & Payment Policy and Return & Refund Policy (bottom-right) */}
      <div
        className="
          absolute
          right-8
          bottom-20
          md:bottom-2
          text-right
          text-xs
          text-gray-700
          select-none
        "
      >
        <span>
          <Link href="/shipping-policy" className="underline hover:text-gray-500">
            Shipping & Payment Policy
          </Link>
          {" "}|{" "}
          <Link href="/return-policy" className="underline hover:text-gray-500">
            Return Policy
          </Link>
          {" "}and{" "}
          <Link href="/refund-policy" className="underline hover:text-gray-500">
            Refund Policy
          </Link>
        </span>
      </div>
    </footer>
  );
}

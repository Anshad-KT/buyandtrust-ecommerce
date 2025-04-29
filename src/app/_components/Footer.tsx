import Link from "next/link"
import Image from "next/image"
import { Instagram, Twitter, Youtube, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#222222]  text-gray-300 lg:pt-24 py-8 px-4 md:px-[7.5rem] ">
      <div className="container mx-auto  ">
        {/* Logo */}
        <div className=" items-center gap-2 lg:w-[13%] mb-8 lg:flex hidden">
        <img src="/logo.svg" className="w-full" alt="" />
      </div>
      <div className="w-full  space-x-4 mb-4 md:mb-0 lg:hidden flex justify-center items-center">
          <SocialMediaIcons />
          </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Address Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-sm text-gray-400">123 KickBlitz Way, Sports City, Your City</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-sm text-gray-400">+1 (555) 123-4567</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-gray-400">info@klikblitzacademy.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:block hidden">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-sm text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
               
               <Link href={"/customize"} className="block text-sm text-gray-400 hover:text-white transition-colors">
                Customise
              </Link>
              
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
          {/* Social Icons */}
          <div className=" space-x-4 mb-4 md:mb-0 lg:flex hidden">
          <SocialMediaIcons />
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Bega SportsWear . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}



function SocialMediaIcons() {
    const socialLinks = [
      { id: 'ig', label: 'Instagram', href: '#' },
      { id: 'tw', label: 'Twitter', href: '#' },
      { id: 'yt', label: 'YouTube', href: '#' },
      { id: 'ln', label: 'LinkedIn', href: '#' }
    ]
  
    return (
      <div className="flex gap-2 justify-center items-center w-d">
        {socialLinks.map(({ id, label, href }) => (
          <Link
            key={id}
            href={href}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C41E3A] text-white text-sm font-medium hover:bg-[#A01830] transition-colors"
            aria-label={label}
          >
            {id}
          </Link>
        ))}
      </div>
    )
  }
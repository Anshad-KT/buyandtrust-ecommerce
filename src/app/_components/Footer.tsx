import Image from "next/image"
import Link from "next/link"
import { Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#1A1A24] text-white py-16 relative">
      {/* Background decorative elements */}
      <div className="absolute -right-32 top-0 opacity-5">
        {/* <div className="w-96 h-96 border-2 border-white rounded-full"></div> */}
      </div>
      <div className="absolute -left-32 bottom-0 opacity-5">
        {/* <div className="w-96 h-96 border-2 border-white rounded-full"></div> */}
      </div>
      
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
      <div className="absolute left-20 bottom-10 opacity-10">
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
          <div>
            <div className="mb-8">
              <div className="flex flex-col items-start">
                <img
                  src="/logo-footer.svg"  
                  alt="B&T Logo"
                  className="w-24 md:w-40 h-auto"
                />
              </div>
            </div>

            <h2 className="text-3xl font-light leading-tight">
              Buy the Best &<br />
              Trust the Rest
            </h2>
          </div>

          {/* Right Column - Contact Information */}
          <div>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://www.instagram.com/the.perfect_choices"
                target="_blank"
                className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://wa.me/9995153455"
                target="_blank"
                className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="49" height="49" rx="24.5" stroke="white"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M31.3 18.5875C29.6125 16.9 27.3625 16 25 16C20.05 16 16 20.05 16 25C16 26.575 16.45 28.15 17.2375 29.5L16 34L20.725 32.7625C22.075 33.4375 23.5375 33.8875 25 33.8875C29.95 33.8875 34 29.8375 34 24.8875C34 22.525 32.9875 20.275 31.3 18.5875ZM25 32.425C23.65 32.425 22.3 32.0875 21.175 31.4125L20.95 31.3L18.1375 32.0875L18.925 29.3875L18.7 29.05C17.9125 27.8125 17.575 26.4625 17.575 25.1125C17.575 21.0625 20.95 17.6875 25 17.6875C27.025 17.6875 28.825 18.475 30.2875 19.825C31.75 21.2875 32.425 23.0875 32.425 25.1125C32.425 29.05 29.1625 32.425 25 32.425ZM29.05 26.8C28.825 26.6875 27.7 26.125 27.475 26.125C27.25 26.0125 27.1375 26.0125 27.025 26.2375C26.9125 26.4625 26.4625 26.9125 26.35 27.1375C26.2375 27.25 26.125 27.25 25.9 27.25C25.675 27.1375 25 26.9125 24.1 26.125C23.425 25.5625 22.975 24.775 22.8625 24.55C22.75 24.325 22.8625 24.2125 22.975 24.1C23.0875 23.9875 23.2 23.875 23.3125 23.7625C23.425 23.65 23.425 23.5375 23.5375 23.425C23.65 23.3125 23.5375 23.2 23.5375 23.0875C23.5375 22.975 23.0875 21.85 22.8625 21.4C22.75 21.0625 22.525 21.0625 22.4125 21.0625C22.3 21.0625 22.1875 21.0625 21.9625 21.0625C21.85 21.0625 21.625 21.0625 21.4 21.2875C21.175 21.5125 20.6125 22.075 20.6125 23.2C20.6125 24.325 21.4 25.3375 21.5125 25.5625C21.625 25.675 23.0875 28.0375 25.3375 28.9375C27.25 29.725 27.5875 29.5 28.0375 29.5C28.4875 29.5 29.3875 28.9375 29.5 28.4875C29.725 27.925 29.725 27.475 29.6125 27.475C29.5 26.9125 29.275 26.9125 29.05 26.8Z" fill="white"/>
                </svg>
              </a>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl mb-4">Contact Us</h3>

              <div>
                <a href="tel:+919995153455" className="block mb-1 hover:text-gray-300 transition-colors">
                  +91 099951 53455
                </a>
                <a href="https://www.instagram.com/the.perfect_choices" className="block hover:text-gray-300 transition-colors">
                  @the.perfect_choices
                </a>
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
                <address className="text-gray-300 text-sm leading-relaxed not-italic">
                  XIII/284 A, Anjanasree Arcade,<br />
                  Annankunnu Rd, Chungam, Kottayam, Kerala 686001
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
                <address className="text-gray-300 text-sm not-italic">
                  Sharjah Media City, Sharjah, UAE
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Powered by HANCOD */}
      <div className="absolute left-4 bottom-2 text-xs text-gray-400 select-none">
        Powered by <a href="https://hancod.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">HANCOD</a>
      </div>
    </footer>
  )
}

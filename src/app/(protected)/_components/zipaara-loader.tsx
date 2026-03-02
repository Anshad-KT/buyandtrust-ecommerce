'use client'

import * as React from "react"

interface ZipaaraLoaderProps {
  isExiting?: boolean
  onExitComplete?: () => void
  className?: string
  exitDurationMs?: number
}

export default function ZipaaraLoader({
  isExiting = false,
  onExitComplete,
  className = "",
  exitDurationMs = 1000,
}: ZipaaraLoaderProps) {
  const [hasEntered, setHasEntered] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasEntered(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (isExiting && hasEntered ) {
      const timer = setTimeout(() => {
        onExitComplete?.()
      }, exitDurationMs)
      return () => clearTimeout(timer)
    }
  }, [isExiting, hasEntered, onExitComplete, exitDurationMs])

  const animationState = !isExiting && hasEntered

  return (
    <div className={`min-h-screen flex items-center justify-center overflow-hidden relative bg-white ${className}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f16b1d]/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            transform: animationState ? "scale(1) rotate(0deg)" : "scale(1.5) rotate(45deg)",
            opacity: animationState ? 0.6 : 0,
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1b2e57]/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            transform: animationState ? "scale(1) rotate(0deg)" : "scale(1.5) rotate(-45deg)",
            opacity: animationState ? 0.6 : 0,
            transitionDelay: animationState ? "200ms" : "0ms",
          }}
        />
      </div>

      <div className="text-center relative z-10">
        <div
          className="relative w-32 h-32 mx-auto mb-10 transition-all duration-700 ease-out"
          style={{
            transform: animationState ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-180deg)",
            opacity: animationState ? 1 : 0,
          }}
        >
          <div
            className={`absolute inset-0 border-4 border-[#f16b1d] rounded-full ${animationState ? "animate-pulseRing" : ""}`}
            style={{
              opacity: animationState ? 0.9 : 0,
              transition: "opacity 0.7s ease-out",
            }}
          />

          <div
            className={`absolute inset-2 border-4 border-[#f16b1d] rounded-full ${animationState ? "animate-pulseRing" : ""}`}
            style={{
              opacity: animationState ? 0.75 : 0,
              transition: "opacity 0.7s ease-out",
              transitionDelay: animationState ? "100ms" : "0ms",
              animationDelay: "200ms",
            }}
          />

          <div
            className={`absolute inset-4 border-4 border-[#1b2e57] border-t-transparent rounded-full ${animationState ? "animate-orbit" : ""}`}
            style={{
              opacity: animationState ? 1 : 0,
              transition: "opacity 0.7s ease-out",
            }}
          />

          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              transform: animationState ? "scale(1)" : "scale(0)",
              opacity: animationState ? 1 : 0,
              transitionDelay: animationState ? "400ms" : "0ms",
            }}
          >
            <div className={`w-4 h-4 bg-[#f16b1d] rounded-full shadow-[0_0_20px_rgba(241,107,29,0.6)] ${animationState ? "animate-pulse" : ""}`} />
          </div>
        </div>

        <p
          className="text-[#1b2e57] text-sm font-black tracking-[0.4em] uppercase mb-6 transition-all duration-700 ease-out"
          style={{
            transform: animationState ? "translateY(0)" : "translateY(20px)",
            opacity: animationState ? 1 : 0,
            transitionDelay: animationState ? "300ms" : "100ms",
          }}
        >
          <span className={`inline-block ${animationState ? "animate-pulse" : ""}`}>Loading</span>
        </p>

        <div
          className="flex justify-center gap-3 transition-all duration-700 ease-out"
          style={{
            transform: animationState ? "translateY(0)" : "translateY(20px)",
            opacity: animationState ? 1 : 0,
            transitionDelay: animationState ? "400ms" : "0ms",
          }}
        >
          <div
            className={`w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ${animationState ? "animate-wave" : ""}`}
            style={{
              transform: animationState ? "scale(1)" : "scale(0)",
              transitionDelay: animationState ? "500ms" : "200ms",
            }}
          />
          <div
            className={`w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-300 ${animationState ? "animate-wave" : ""}`}
            style={{
              transform: animationState ? "scale(1)" : "scale(0)",
              transitionDelay: animationState ? "600ms" : "100ms",
              animationDelay: "0.2s",
            }}
          />
          <div
            className={`w-1.5 h-1.5 bg-[#f16b1d] rounded-full shadow-[0_0_10px_rgba(241,107,29,0.5)] transition-all duration-300 ${animationState ? "animate-wave" : ""}`}
            style={{
              transform: animationState ? "scale(1)" : "scale(0)",
              transitionDelay: animationState ? "700ms" : "0ms",
              animationDelay: "0.4s",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseRing {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-pulseRing {
          animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-orbit {
          animation: orbit 1.5s linear infinite;
        }

        .animate-wave {
          animation: wave 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

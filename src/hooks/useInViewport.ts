import { RefObject, useEffect, useState } from "react"

interface UseInViewportOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  once?: boolean
  enabled?: boolean
}

export function useInViewport<T extends Element>(
  ref: RefObject<T>,
  {
    threshold = 0.2,
    root = null,
    rootMargin = "0px",
    once = true,
    enabled = true,
  }: UseInViewportOptions = {},
) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true)
      setHasBeenInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setHasBeenInView(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [enabled, once, ref, root, rootMargin, threshold])

  return once ? hasBeenInView : isInView
}

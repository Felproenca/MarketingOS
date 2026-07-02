import { useEffect, useRef } from 'react'

export function useCursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'cursor-spotlight'
    document.body.appendChild(el)
    spotlightRef.current = el

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let targetX = x
    let targetY = y

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    let raf: number
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      x = lerp(x, targetX, 0.08)
      y = lerp(y, targetY, 0.08)
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      el.remove()
    }
  }, [])
}

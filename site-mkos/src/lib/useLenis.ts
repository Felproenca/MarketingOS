import { useEffect } from 'react'
import Lenis from 'lenis'

let globalLenis: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Não setar wrapper ou content — usa o scroll global
    })
    globalLenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const handle = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(handle)
      lenis.destroy()
      globalLenis = null
    }
  }, [])
}

/** Retorna o scrollY atual via Lenis (se ativo) ou window.scrollY */
export function getLenisScrollY() {
  return globalLenis ? globalLenis.scroll : window.scrollY
}

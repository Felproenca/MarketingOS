import { useLenis } from './lib/useLenis'
import { useCursorSpotlight } from './lib/useMousePosition'
import Navbar from './components/Navbar'
import HeroScroll from './components/HeroScroll'
import Positioning from './components/Positioning'
import Process from './components/Process'
import WowMoment from './components/WowMoment'
import CTA from './components/CTA'

export default function App() {
  useLenis()
  useCursorSpotlight()

  return (
    <>
      <Navbar />
      <main>
        <HeroScroll />
        <Positioning />
        <WowMoment />
        <Process />
        <CTA />
      </main>
    </>
  )
}

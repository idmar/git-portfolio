import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import Hero from './pages/Hero'
import Works from './pages/Works'
import About from './pages/About'
import Contact from './pages/Contact'

const Scene3D = lazy(() => import('./components/Scene3D'))

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080a]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-12 w-12 rounded-full border-2 border-white/10"
          style={{ borderTopColor: '#ff006e' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-xs font-mono tracking-[0.2em] text-white/30">
          LOADING SCENE...
        </p>
      </motion.div>
    </div>
  )
}

function App() {
  return (
    <>
      <CustomCursor />
      <Navbar />

      {/* 3D background scene — fixed position, behind content */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<LoadingScreen />}>
          <Scene3D />
        </Suspense>
        {/* gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08080a]" />
      </div>

      {/* foreground content */}
      <div className="relative z-10">
        <Hero />
        <Works />
        <About />
        <Contact />
      </div>
    </>
  )
}

export default App

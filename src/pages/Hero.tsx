import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center px-6">
      {/* overlay text */}
      <div className="z-10 flex flex-col items-center text-center">
        <motion.p
          className="mb-4 text-xs font-mono tracking-[0.3em] text-white/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          INTERACTIVE PORTFOLIO · 2026
        </motion.p>

        <motion.h1
          className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="text-gradient-pink">CREATIVE</span>
          <br />
          <span className="text-gradient-lime">DEVIATION</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-md text-sm md:text-base text-white/50 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          跨领域创意作品集 — 3D 可视化、交互设计、动态影像的实验场。
          移动鼠标，探索场景。
        </motion.p>

        <motion.div
          className="mt-10 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <a
            href="#works"
            data-hover
            className="glass rounded-full px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            探索作品 →
          </a>
          <a
            href="#about"
            data-hover
            className="text-sm font-medium text-white/40 transition-colors hover:text-white"
          >
            关于我
          </a>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs font-mono">SCROLL</span>
          <div className="h-12 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

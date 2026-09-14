import { motion } from 'framer-motion'

const links = [
  { label: '作品', href: '#works', index: 0 },
  { label: '关于', href: '#about', index: 1 },
  { label: '联系', href: '#contact', index: 2 },
]

export default function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.a
        href="#hero"
        className="text-sm font-bold tracking-tight"
        whileHover={{ scale: 1.05 }}
        data-hover
      >
        <span className="text-gradient-pink text-lg">●</span>
        <span className="ml-2">PORTFOLIO</span>
      </motion.a>

      <div className="flex items-center gap-6 md:gap-10">
        {links.map((link) => (
          <motion.a
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            data-hover
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + link.index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            {link.label}
          </motion.a>
        ))}
      </div>

      <motion.a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="glass rounded-full px-4 py-2 text-xs font-medium text-white/80 hover:text-white"
        data-hover
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
      >
        GitHub ↗
      </motion.a>
    </motion.nav>
  )
}

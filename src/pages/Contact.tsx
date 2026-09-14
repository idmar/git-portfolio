import { motion } from 'framer-motion'

const contacts = [
  { label: 'Email', value: 'hello@portfolio.dev', href: 'mailto:hello@portfolio.dev', color: '#ff006e' },
  { label: 'GitHub', value: '@yourname', href: 'https://github.com', color: '#3a86ff' },
  { label: 'Twitter / X', value: '@yourname', href: 'https://twitter.com', color: '#ccff00' },
  { label: 'Dribbble', value: '@yourname', href: 'https://dribbble.com', color: '#8338ec' },
]

export default function Contact() {
  return (
    <section id="contact" className="relative z-10 min-h-screen px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-2 text-xs font-mono tracking-[0.2em] text-white/30">
            03 / GET IN TOUCH
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            联系<span className="text-gradient-pink">·</span>合作
          </h2>
        </motion.div>

        <motion.p
          className="text-lg text-white/50 mb-10 max-w-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          有项目想法？想聊聊创意技术？或者只是想说声 hi？
          期待收到你的消息。
        </motion.p>

        <div className="space-y-3">
          {contacts.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="glass group flex items-center justify-between rounded-xl p-6 transition-all hover:border-white/20"
              data-hover
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 8 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-3 w-3 rounded-full transition-transform group-hover:scale-150"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-sm font-medium text-white/40">{c.label}</span>
              </div>
              <span className="text-base font-bold text-white group-hover:text-white">
                {c.value}
              </span>
            </motion.a>
          ))}
        </div>

        <motion.p
          className="mt-20 text-center text-xs font-mono text-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          © 2026 · Built with React Three Fiber + Framer Motion · Deployed on GitHub Pages
        </motion.p>
      </div>
    </section>
  )
}

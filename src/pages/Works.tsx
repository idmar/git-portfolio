import { motion } from 'framer-motion'
import { works } from '../data/works'
import ProjectCard from '../components/ProjectCard'

const categories = ['全部', '3D 可视化', '3D 建模', '交互设计', '视频渲染', '视频剪辑']

export default function Works() {
  return (
    <section id="works" className="relative z-10 min-h-screen px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* section header */}
        <motion.div
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="mb-2 text-xs font-mono tracking-[0.2em] text-white/30">
              01 / SELECTED WORKS
            </p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              作品<span className="text-gradient-pink">·</span>实验
            </h2>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/40">
            每个项目都是一次跨领域的探索 — 从概念到可交互原型。
          </p>
        </motion.div>

        {/* category filter */}
        <motion.div
          className="mb-10 flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              data-hover
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/30 hover:text-white"
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* project grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {works.map((work, i) => (
            <ProjectCard key={work.id} work={work} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

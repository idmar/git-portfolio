import { motion } from 'framer-motion'
import type { Work } from '../data/works'

const statusLabels: Record<Work['status'], string> = {
  prototype: '原型',
  live: '已上线',
  concept: '概念',
}

const statusColors: Record<Work['status'], string> = {
  prototype: '#ccff00',
  live: '#3a86ff',
  concept: '#6b6b80',
}

export default function ProjectCard({ work, index }: { work: Work; index: number }) {
  return (
    <motion.article
      className="glass group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-500 hover:border-white/20"
      data-hover
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      style={{
        background: `linear-gradient(135deg, ${work.color}08 0%, transparent 60%)`,
      }}
    >
      {/* glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${work.color}15, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <span
          className="text-xs font-mono font-medium"
          style={{ color: statusColors[work.status] }}
        >
          ● {statusLabels[work.status]}
        </span>
        <span className="text-xs font-mono text-white/30">{work.id} / {work.year}</span>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: work.color }}>
          {work.title}
        </h3>
        <p className="text-sm text-white/50 mb-3">{work.category}</p>
        <p className="text-sm text-white/70 leading-relaxed">{work.description}</p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2 mt-4">
        {work.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-mono text-white/50"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  )
}

import { motion } from 'framer-motion'

const skills = [
  { label: 'Three.js / R3F', level: '3D 渲染管线、着色器、后处理' },
  { label: 'React / TypeScript', level: '前端架构、组件设计、状态管理' },
  { label: 'Framer Motion', level: '动效系统、微交互、页面转场' },
  { label: 'GLSL Shaders', level: '顶点/片元着色器、程序化纹理' },
  { label: 'Blender / Spline', level: '3D 建模、材质烘焙、动画导出' },
  { label: 'Video Production', level: '渲染管线输出、剪辑、音效设计' },
]

export default function About() {
  return (
    <section id="about" className="relative z-10 min-h-screen px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-2 text-xs font-mono tracking-[0.2em] text-white/30">
            02 / ABOUT
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            关于<span className="text-gradient-lime">·</span>方向
          </h2>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-8 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg md:text-xl leading-relaxed text-white/80">
            我是一名跨领域创意开发者，专注于{' '}
            <span className="text-gradient-pink font-medium">3D 可视化</span>、
            <span className="text-gradient-lime font-medium">交互设计</span> 与
            <span className="text-gradient-pink font-medium">动态影像</span> 的交叉地带。
            相信代码是一种创作材料，用着色器写诗、用几何体叙事。
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/50">
            这个作品集本身就是一件交互式作品 — 每一次滚动、每一次悬停，
            都是叙事的一部分。从程序化几何到音频反应，从 WebGL 渲染到最终混剪输出，
            探索技术作为表达媒介的边界。
          </p>
        </motion.div>

        {/* skills grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.label}
              className="glass flex items-center justify-between rounded-xl p-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 4 }}
              data-hover
            >
              <div>
                <p className="text-sm font-bold text-white">{skill.label}</p>
                <p className="text-xs text-white/40 mt-1">{skill.level}</p>
              </div>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ['#ff006e', '#3a86ff', '#ccff00', '#8338ec'][i % 4] }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

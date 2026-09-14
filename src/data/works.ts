export interface Work {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  year: string
  status: 'prototype' | 'live' | 'concept'
  color: string
}

export const works: Work[] = [
  {
    id: '01',
    title: 'Generative Typography Lab',
    category: '3D 可视化',
    description: '基于着色器的实时生成式字体艺术，鼠标驱动形变与色彩流动',
    tags: ['Three.js', 'GLSL', 'React'],
    year: '2026',
    status: 'prototype',
    color: '#ff006e',
  },
  {
    id: '02',
    title: 'Spatial Audio Visualizer',
    category: '交互设计',
    description: '音频驱动的 3D 粒子系统，声音频率映射为空间几何运动',
    tags: ['Web Audio', 'WebGL', 'Framer Motion'],
    year: '2026',
    status: 'concept',
    color: '#3a86ff',
  },
  {
    id: '03',
    title: 'Neon City Flythrough',
    category: '视频渲染',
    description: '程序化生成的赛博城市场景，3D 渲染管线输出演示视频',
    tags: ['Three.js', 'Cinematic', 'Postprocessing'],
    year: '2026',
    status: 'prototype',
    color: '#ccff00',
  },
  {
    id: '04',
    title: 'Interactive Brand Identity',
    category: '3D 建模',
    description: '品牌 3D 形象的可交互展示，支持旋转、拆解、材质切换',
    tags: ['GLTF', 'R3F', 'Drei'],
    year: '2026',
    status: 'concept',
    color: '#8338ec',
  },
  {
    id: '05',
    title: 'Motion Design System',
    category: '交互设计',
    description: '组件级动效设计系统，从微交互到页面级转场的完整方案',
    tags: ['Framer Motion', 'Design Tokens', 'React'],
    year: '2026',
    status: 'prototype',
    color: '#ff006e',
  },
  {
    id: '06',
    title: 'Portfolio Showreel',
    category: '视频剪辑',
    description: '作品集 30 秒动态混剪，融合 3D 动画与界面动效',
    tags: ['Premiere', 'After Effects', 'Sound Design'],
    year: '2026',
    status: 'concept',
    color: '#3a86ff',
  },
]

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Lightformer, MeshDistortMaterial, Text3D } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import type { Work } from '../../data/works'

// resolve public/ assets relative to the deploy base path
// (works on both GitHub Pages subdirectory and domain-root hosts)
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

const PALETTE = ['#ff006e', '#3a86ff', '#ccff00', '#8338ec', '#0affc2']

// deterministic pseudo-random so scenes look identical every visit
function makeRnd(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── 01 · Generative Typography (GLSL shader text) ───────────────
const typoVert = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 p = position;
    float wave =
      sin(p.x * 2.6 + uTime * 1.4) *
      cos(p.y * 3.1 + uTime * 0.9) *
      sin(p.z * 2.2 + uTime * 0.7);
    float amp = 0.07 + 0.10 * length(uPointer);
    p += normal * wave * amp;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vPos = p;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const typoFrag = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
    float hue = fract(0.88 + vPos.x * 0.055 + vPos.y * 0.04 + uTime * 0.03 + uPointer.x * 0.06);
    vec3 col = hsv2rgb(vec3(hue, 0.85, 0.55 + 0.55 * fresnel));
    col += fresnel * vec3(0.8, 0.9, 1.0) * 0.5;
    gl_FragColor = vec4(col, 1.0);
  }
`

function TypographyScene() {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const targetPointer = useRef(new THREE.Vector2())

  useFrame((state) => {
    targetPointer.current.lerp(state.pointer, 0.06)
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime
      mat.current.uniforms.uPointer.value.copy(targetPointer.current)
    }
    if (group.current) {
      group.current.rotation.y = targetPointer.current.x * 0.45
      group.current.rotation.x = -targetPointer.current.y * 0.3
    }
  })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
    }),
    [],
  )

  return (
    <group ref={group} position={[-1.35, -0.35, 0]}>
      <Text3D
        font={asset('fonts/helvetiker_bold.typeface.json')}
        size={0.95}
        height={0.38}
        curveSegments={10}
        bevelEnabled
        bevelThickness={0.03}
        bevelSize={0.022}
        bevelSegments={5}
      >
        TYPE
        <shaderMaterial
          ref={mat}
          vertexShader={typoVert}
          fragmentShader={typoFrag}
          uniforms={uniforms}
        />
      </Text3D>
    </group>
  )
}

// ─── 02 · Spatial Audio Visualizer (synthetic spectrum rings) ────
function AudioRingScene() {
  const N = 260
  const pts = useRef<THREE.Points>(null)
  const core = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)

  const positions = useMemo(() => new Float32Array(N * 3), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const band = Math.floor((i / N) * 16)
      const amp =
        0.5 + 0.5 * Math.sin(t * 2.2 + band * 1.7) * Math.sin(t * 0.6 + band * 0.5)
      const r = 1.65 + amp * 0.85
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = Math.sin(a * 3 + t) * 0.2 * (0.3 + amp)
      positions[i * 3 + 2] = Math.sin(a) * r
    }
    if (pts.current) {
      pts.current.geometry.attributes.position.needsUpdate = true
      pts.current.rotation.y = t * 0.15
    }
    if (core.current) {
      const s = 0.75 + 0.12 * Math.sin(t * 2.2)
      core.current.scale.setScalar(s)
    }
    if (group.current) {
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        state.pointer.x * 0.35,
        0.05,
      )
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -state.pointer.y * 0.3,
        0.05,
      )
    }
  })

  return (
    <group ref={group}>
      <points ref={pts}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#3a86ff"
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.8, 3]} />
        <MeshDistortMaterial
          color="#0b0b14"
          emissive="#3a86ff"
          emissiveIntensity={0.9}
          distort={0.35}
          speed={3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </group>
  )
}

// ─── 03 · Neon City Flythrough (instanced buildings + camera path) ─
const CITY_LEN = 90

type Building = {
  x: number
  z: number
  w: number
  h: number
  d: number
  c: THREE.Color
}

function CityFlythroughScene() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const look = useRef(new THREE.Vector3())

  const buildings = useMemo<Building[]>(() => {
    const rnd = makeRnd(7)
    const out: Building[] = []
    for (let i = 0; i < 44; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const neon = rnd() > 0.74
      out.push({
        x: side * (2.6 + rnd() * 6.5),
        z: 14 - rnd() * CITY_LEN,
        w: 0.9 + rnd() * 1.5,
        h: 1.5 + rnd() * 7.5,
        d: 0.9 + rnd() * 1.5,
        c: new THREE.Color(
          neon ? PALETTE[Math.floor(rnd() * PALETTE.length)] : '#12121c',
        ),
      })
    }
    return out
  }, [])

  useLayoutEffect(() => {
    const im = mesh.current
    if (!im) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const col = new THREE.Color()
    // second copy shifted by -CITY_LEN so the camera loop is seamless
    for (let rep = 0; rep < 2; rep++) {
      buildings.forEach((b, i) => {
        const idx = rep * buildings.length + i
        pos.set(b.x, b.h / 2, b.z - rep * CITY_LEN)
        scale.set(b.w, b.h, b.d)
        m.compose(pos, q, scale)
        im.setMatrixAt(idx, m)
        col.copy(b.c)
        if (rep === 1) col.multiplyScalar(0.7)
        im.setColorAt(idx, col)
      })
    }
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
  }, [buildings])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const speed = 4.2 + state.pointer.x * 2.5
    const travel = (t * speed) % CITY_LEN
    const z = 16 - travel
    state.camera.position.set(Math.sin(t * 0.22) * 1.1, 1.35 + Math.sin(t * 0.5) * 0.3, z)
    look.current.set(
      Math.sin(t * 0.22 + 1) * 1.1,
      1.05 + Math.sin(t * 0.5) * 0.25,
      z - 8,
    )
    state.camera.lookAt(look.current)
  })

  return (
    <>
      <color attach="background" args={['#05050a']} />
      <fog attach="fog" args={['#05050a', 6, 42]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 4]} intensity={0.7} color="#8899ff" />
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, buildings.length * 2]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0.15} />
      </instancedMesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -30]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#08080f" roughness={0.9} />
      </mesh>
    </>
  )
}

// ─── 04 · Interactive Brand Identity (exploded assembly) ─────────
type Part = {
  kind: 'ico' | 'torus' | 'plate' | 'cyl' | 'cone' | 'ring'
  base: [number, number, number]
  dir: [number, number, number]
  color: string
  spin: number
}

function PartMesh({ part }: { part: Part }) {
  switch (part.kind) {
    case 'ico':
      return <icosahedronGeometry args={[0.55, 1]} />
    case 'torus':
      return <torusGeometry args={[0.5, 0.16, 16, 48]} />
    case 'plate':
      return <boxGeometry args={[0.8, 0.22, 0.8]} />
    case 'cyl':
      return <cylinderGeometry args={[0.28, 0.28, 0.7, 24]} />
    case 'cone':
      return <coneGeometry args={[0.4, 0.7, 24]} />
    case 'ring':
      return <torusGeometry args={[0.72, 0.05, 12, 48]} />
  }
}

function ExplodedModelScene() {
  const group = useRef<THREE.Group>(null)
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const k = useRef(0.4)

  const parts = useMemo<Part[]>(
    () => [
      { kind: 'ico', base: [0, 0, 0], dir: [0, 0, 0], color: '#ff006e', spin: 0.6 },
      { kind: 'torus', base: [0, 0.85, 0], dir: [0, 1, 0], color: '#8338ec', spin: 1.1 },
      { kind: 'plate', base: [0, -0.85, 0], dir: [0, -1, 0], color: '#3a86ff', spin: 0.4 },
      { kind: 'cyl', base: [0.9, 0, 0], dir: [1, 0, 0], color: '#ccff00', spin: 0.9 },
      { kind: 'cone', base: [-0.9, 0, 0], dir: [-1, 0, 0], color: '#0affc2', spin: 0.8 },
      { kind: 'ring', base: [0, 0, 0.95], dir: [0, 0, 1], color: '#ff006e', spin: 1.3 },
    ],
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const target = 0.35 + (state.pointer.x * 0.5 + 0.5) * 1.35
    k.current = THREE.MathUtils.lerp(k.current, target, 0.08)
    parts.forEach((p, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      mesh.position.set(
        p.base[0] + p.dir[0] * k.current,
        p.base[1] + p.dir[1] * k.current,
        p.base[2] + p.dir[2] * k.current,
      )
      mesh.rotation.y = t * p.spin * 0.4
      mesh.rotation.x = Math.sin(t * p.spin * 0.5) * 0.3
    })
    if (group.current) {
      group.current.rotation.y = t * 0.22
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        -state.pointer.y * 0.25,
        0.06,
      )
    }
  })

  return (
    <>
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.2} position={[2, 2, 3]} scale={[4, 4, 1]} color="#ff006e" />
        <Lightformer intensity={1.6} position={[-2, -1, 2]} scale={[4, 2, 1]} color="#3a86ff" />
        <Lightformer intensity={1.1} position={[0, 3, -2]} scale={[6, 3, 1]} color="#ffffff" />
      </Environment>
      <ambientLight intensity={0.12} />
      <group ref={group}>
        {parts.map((p, i) => (
          <mesh
            key={p.kind + i}
            ref={(el) => {
              refs.current[i] = el
            }}
          >
            <PartMesh part={p} />
            <meshStandardMaterial
              color={p.color}
              metalness={0.85}
              roughness={0.18}
              envMapIntensity={1.3}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

// ─── 05 · Motion Design System (staggered wave grid) ─────────────
function MotionGridScene() {
  const COLS = 8
  const ROWS = 5
  const group = useRef<THREE.Group>(null)
  const refs = useRef<(THREE.Mesh | null)[]>([])

  const cells = useMemo(() => {
    const out: { x: number; z: number; d: number; color: string }[] = []
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        out.push({
          x: (i - (COLS - 1) / 2) * 0.62,
          z: (j - (ROWS - 1) / 2) * 0.62,
          d: Math.hypot(i - (COLS - 1) / 2, j - (ROWS - 1) / 2),
          color: PALETTE[(i + j) % PALETTE.length],
        })
      }
    }
    return out
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    cells.forEach((c, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      const s =
        0.25 +
        Math.abs(Math.sin(t * 1.6 + c.d * 0.65 + state.pointer.x * 2.5)) * 1.15
      mesh.scale.y = s
      mesh.position.y = s / 2
    })
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        state.pointer.x * 0.5,
        0.05,
      )
      group.current.rotation.x = -0.55 - state.pointer.y * 0.15
    }
  })

  return (
    <group ref={group} position={[0, -0.4, 0]}>
      {cells.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, 0.3, c.z]}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <boxGeometry args={[0.34, 1, 0.34]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── 06 · Portfolio Showreel (orbiting reel frames) ──────────────
function ShowreelScene() {
  const group = useRef<THREE.Group>(null)
  const hub = useRef<THREE.Mesh>(null)

  const frames = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        color: PALETTE[i % PALETTE.length],
        tilt: (i % 2 === 0 ? 1 : -1) * 0.12,
      })),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.rotation.y += (0.004 + Math.max(0, state.pointer.x) * 0.012)
      group.current.position.y = Math.sin(t * 0.8) * 0.1
    }
    if (hub.current) {
      hub.current.rotation.x = t * 0.6
      hub.current.rotation.z = t * 0.3
    }
  })

  return (
    <group rotation={[0.18, 0, 0]}>
      <group ref={group}>
        {frames.map((f, i) => (
          <Float key={i} speed={2} floatIntensity={0.6} rotationIntensity={0}>
            <mesh
              position={[Math.sin(f.angle) * 2.3, f.tilt, Math.cos(f.angle) * 2.3]}
              rotation={[0, f.angle + Math.PI, 0]}
            >
              <planeGeometry args={[1.35, 0.85]} />
              <meshBasicMaterial color={f.color} transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>
          </Float>
        ))}
      </group>
      <mesh ref={hub}>
        <torusKnotGeometry args={[0.45, 0.14, 96, 16]} />
        <meshStandardMaterial
          color="#0b0b14"
          emissive="#ccff00"
          emissiveIntensity={1.1}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}

// ─── dispatcher ──────────────────────────────────────────────────
export function WorkScene({ id }: { id: Work['id'] }) {
  switch (id) {
    case '01':
      return <TypographyScene />
    case '02':
      return <AudioRingScene />
    case '03':
      return <CityFlythroughScene />
    case '04':
      return <ExplodedModelScene />
    case '05':
      return <MotionGridScene />
    default:
      return <ShowreelScene />
  }
}

// ─── recorder helpers ────────────────────────────────────────────
function pickMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  const candidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? null
}

// ─── project detail modal ────────────────────────────────────────
export default function ProjectModal({
  work,
  onClose,
}: {
  work: Work
  onClose: () => void
}) {
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const capTimer = useRef<number>(0)
  const [recording, setRecording] = useState(false)
  const canRecord = useMemo(() => pickMime() !== null, [])

  const statusLabels: Record<Work['status'], string> = {
    prototype: '原型',
    live: '已上线',
    concept: '概念',
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const stopRecording = () => {
    window.clearTimeout(capTimer.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null
    setRecording(false)
  }

  // unmount safety: flush any active recording before the canvas dies
  useEffect(() => stopRecording, [])

  const startRecording = () => {
    const canvas = canvasEl.current
    const mime = pickMime()
    if (!canvas || !mime) return
    const stream = canvas.captureStream(30)
    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 6_000_000,
    })
    const chunks: Blob[] = []
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime })
      const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-${work.id}-demo.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
    rec.start(250)
    recorderRef.current = rec
    setRecording(true)
    capTimer.current = window.setTimeout(stopRecording, 20_000) // safety cap
  }

  const dpr = Math.min(
    typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    1.75,
  )

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          stopRecording()
          onClose()
        }}
      />
      <motion.section
        className="glass relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl"
        initial={{ y: 24, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-label={`${work.title} 详情`}
      >
        {/* interactive canvas */}
        <div className="relative h-[40vh] min-h-[240px] w-full bg-[#0a0a12]">
          <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, 6], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              canvasEl.current = gl.domElement
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.2} />
              <directionalLight position={[4, 6, 5]} intensity={0.6} />
              <WorkScene id={work.id} />
              <EffectComposer>
                <Bloom
                  intensity={0.85}
                  luminanceThreshold={0.25}
                  luminanceSmoothing={0.9}
                  mipmapBlur
                />
              </EffectComposer>
            </Suspense>
          </Canvas>
          <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.2em] text-white/35">
            MOVE POINTER TO INTERACT · ESC 关闭
          </p>
          <button
            onClick={() => {
              stopRecording()
              onClose()
            }}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-white/40 hover:text-white"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* meta */}
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 font-mono text-xs text-white/30">
              {work.id} / {work.year} · {work.category} · {statusLabels[work.status]}
            </p>
            <h3 className="text-2xl font-bold" style={{ color: work.color }}>
              {work.title}
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/60">{work.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {work.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {canRecord && (
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                recording
                  ? 'bg-[#ff006e] text-white'
                  : 'glass text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {recording ? '■ 停止并下载' : '● 录制演示（最长 20s）'}
            </button>
          )}
        </div>
      </motion.section>
    </div>
  )
}

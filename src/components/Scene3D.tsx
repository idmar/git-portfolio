import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useState, useEffect } from 'react'

// resolve public/ assets relative to the deploy base path
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

// lightweight tier for phones: fewer particles/shapes, lower DPR
const IS_MOBILE =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

// ─── Distorted Blob ──────────────────────────────────────────────
function DistortedBlob() {
  const mesh = useRef<THREE.Mesh>(null)
  const { pointer } = useThree()

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.y = state.clock.elapsedTime * 0.15
    mesh.current.rotation.x = THREE.MathUtils.lerp(
      mesh.current.rotation.x,
      pointer.y * 0.3,
      0.05,
    )
    mesh.current.position.x = THREE.MathUtils.lerp(
      mesh.current.position.x,
      pointer.x * 0.5,
      0.05,
    )
  })

  return (
    <mesh ref={mesh} scale={2.2} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1, 64]} />
      <MeshDistortMaterial
        color="#ff006e"
        emissive="#8338ec"
        emissiveIntensity={0.3}
        roughness={0.1}
        metalness={0.8}
        distort={0.45}
        speed={2.5}
      />
    </mesh>
  )
}

// ─── Floating Shapes ─────────────────────────────────────────────
function FloatingShapes() {
  const shapes = useMemo(
    () =>
      Array.from({ length: IS_MOBILE ? 7 : 12 }, (_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 2,
        ] as [number, number, number],
        scale: Math.random() * 0.4 + 0.15,
        color: ['#ff006e', '#3a86ff', '#ccff00', '#8338ec'][i % 4],
        geometry: i % 4,
        speed: Math.random() * 2 + 0.5,
        rotationSpeed: Math.random() * 0.5 + 0.1,
      })),
    [],
  )

  return (
    <>
      {shapes.map((s) => (
        <Float
          key={s.id}
          speed={s.speed}
          rotationIntensity={2}
          floatIntensity={1.5}
        >
          <mesh position={s.position} scale={s.scale}>
            {s.geometry === 0 && <boxGeometry args={[1, 1, 1]} />}
            {s.geometry === 1 && <octahedronGeometry args={[0.6]} />}
            {s.geometry === 2 && <tetrahedronGeometry args={[0.8]} />}
            {s.geometry === 3 && <torusGeometry args={[0.4, 0.15, 16, 32]} />}
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// ─── Particle Field ──────────────────────────────────────────────
function ParticleField() {
  const ref = useRef<THREE.Points>(null)
  const count = IS_MOBILE ? 320 : 800

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Mouse Light ─────────────────────────────────────────────────
function MouseLight() {
  const ref = useRef<THREE.PointLight>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = pointer.x * 5
      ref.current.position.y = pointer.y * 5
    }
  })

  return <pointLight ref={ref} color="#ff006e" intensity={50} distance={15} position={[0, 0, 4]} />
}

// ─── Scene Wrapper ──────────────────────────────────────────────
function SceneContents() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <MouseLight />
      <DistortedBlob />
      <FloatingShapes />
      <ParticleField />
      <ContactShadows
        position={[0, -3.5, 0]}
        opacity={0.3}
        scale={15}
        blur={2.5}
        far={4}
        color="#ff006e"
      />
      {/* local HDR (public/hdri) — no runtime CDN dependency */}
      <Environment files={asset('hdri/city.hdr')} />
    </>
  )
}

// ─── Main Export ─────────────────────────────────────────────────
const caOffset = new THREE.Vector2(0.002, 0.002)

export default function Scene3D() {
  const [dpr, setDpr] = useState(1.5)

  useEffect(() => {
    const updateDpr = () => {
      setDpr(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2))
    }
    updateDpr()
    window.addEventListener('resize', updateDpr)
    return () => window.removeEventListener('resize', updateDpr)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}
    >
      <Suspense fallback={null}>
        <SceneContents />
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          {IS_MOBILE ? null : <ChromaticAberration offset={caOffset} />}
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}

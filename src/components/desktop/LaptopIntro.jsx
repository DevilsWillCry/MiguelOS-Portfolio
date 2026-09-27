import React, { Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";

const OPEN_ANGLE = -1.95; // rad (~112°, portátil abierto)
const OPEN_DURATION = 2.2; // s que tarda en abrirse

// easeInOutCubic
const ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function LaptopModel({ onOpened }) {
  const group = useRef();
  const hinge = useRef();
  const screenMat = useRef();
  const startTime = useRef(null);
  const doneRef = useRef(false);

  useFrame((state) => {
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;
    const t = Math.min(elapsed / OPEN_DURATION, 1);
    const e = ease(t);

    if (hinge.current) hinge.current.rotation.x = OPEN_ANGLE * e;
    // La pantalla se enciende conforme se abre
    if (screenMat.current) screenMat.current.emissiveIntensity = 0.2 + e * 1.1;
    // Leve balanceo del conjunto
    if (group.current)
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;

    if (t >= 1 && !doneRef.current) {
      doneRef.current = true;
      onOpened();
    }
  });

  return (
    <group ref={group} position={[0, -0.4, 0]} rotation={[0.15, 0, 0]}>
      {/* Base / teclado */}
      <mesh>
        <boxGeometry args={[3.2, 0.16, 2.2]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.09, 0.15]}>
        <boxGeometry args={[2.9, 0.02, 1.7]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.1, 0.75]}>
        <boxGeometry args={[1.1, 0.02, 0.6]} />
        <meshStandardMaterial color="#111827" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Bisagra en el borde trasero */}
      <group ref={hinge} position={[0, 0.08, -1.05]}>
        {/* Tapa */}
        <mesh position={[0, 0, 1.05]}>
          <boxGeometry args={[3.2, 0.12, 2.1]} />
          <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Pantalla (cara interna) */}
        <mesh position={[0, 0.07, 1.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.9, 1.8]} />
          <meshStandardMaterial
            ref={screenMat}
            color="#0b1020"
            emissive="#ef4444"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function LaptopIntro({ onFinished }) {
  const [fading, setFading] = useState(false);

  const handleOpened = () => {
    // Pausa breve con el portátil abierto, luego funde a negro y pasa al 2D
    setTimeout(() => setFading(true), 400);
    setTimeout(() => onFinished(), 1100);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      <Canvas camera={{ position: [0, 1.1, 6], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["#05070f"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={1.3} />
          <pointLight position={[-4, -2, -4]} intensity={0.7} color="#ef4444" />
          <Stars radius={60} depth={30} count={1500} factor={4} fade speed={1} />
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
            <LaptopModel onOpened={handleOpened} />
          </Float>
        </Suspense>
      </Canvas>

      <motion.span
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm text-white/70 font-mono tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0.4, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        Iniciando Miguel<span className="text-red-600 font-bold">OS</span>...
      </motion.span>
    </motion.div>
  );
}

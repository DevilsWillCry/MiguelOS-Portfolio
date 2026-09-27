import React, { Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

const OPEN_ANGLE = -1.95; // rad (~112°, portátil abierto)
const OPEN_DURATION = 2.2; // s en abrirse
const HOLD = 0.35; // s de pausa con el portátil abierto
const ZOOM_DURATION = 1.4; // s del acercamiento a la pantalla

// easeInOutCubic
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function LaptopModel({ onZoomHalfway }) {
  const group = useRef();
  const hinge = useRef();
  const screen = useRef();
  const screenMat = useRef();

  const phase = useRef("opening"); // opening -> zooming -> done
  const openStart = useRef(null);
  const zoomStart = useRef(null);
  const camFrom = useRef(new THREE.Vector3());
  const halfDone = useRef(false);

  const screenWorld = useRef(new THREE.Vector3());
  const screenNormal = useRef(new THREE.Vector3());

  useFrame((state) => {
    const now = state.clock.elapsedTime;

    if (phase.current === "opening") {
      if (openStart.current === null) openStart.current = now;
      const t = Math.min((now - openStart.current) / OPEN_DURATION, 1);
      const e = ease(t);
      if (hinge.current) hinge.current.rotation.x = OPEN_ANGLE * e;
      if (screenMat.current) screenMat.current.emissiveIntensity = 0.2 + e * 1.0;
      if (group.current) group.current.rotation.y = Math.sin(now * 0.4) * 0.22;

      if (t >= 1 && now - openStart.current >= OPEN_DURATION + HOLD) {
        phase.current = "zooming";
        zoomStart.current = now;
        camFrom.current.copy(state.camera.position);
      }
      return;
    }

    if (phase.current === "zooming") {
      const z = Math.min((now - zoomStart.current) / ZOOM_DURATION, 1);
      const e = ease(z);

      // Posición y normal reales de la pantalla en el mundo (rastreadas en vivo)
      screen.current.getWorldPosition(screenWorld.current);
      screen.current.getWorldDirection(screenNormal.current);

      // Punto objetivo: justo frente a la pantalla, siguiendo su normal
      const target = screenWorld.current
        .clone()
        .addScaledVector(screenNormal.current, 0.45);

      state.camera.position.lerpVectors(camFrom.current, target, e);
      state.camera.lookAt(screenWorld.current);

      // La pantalla se enciende cada vez más fuerte (efecto de "entrar")
      if (screenMat.current) screenMat.current.emissiveIntensity = 1.2 + e * 4.0;

      if (!halfDone.current && z >= 0.6) {
        halfDone.current = true;
        onZoomHalfway();
      }
      if (z >= 1) {
        phase.current = "done";
      }
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
        <mesh ref={screen} position={[0, 0.07, 1.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.9, 1.8]} />
          <meshStandardMaterial
            ref={screenMat}
            color="#0b1020"
            emissive="#ef4444"
            emissiveIntensity={0.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

const FADE_DURATION = 0.85; // s del crossfade final

export default function LaptopIntro({ onFinished }) {
  const [fading, setFading] = useState(false);

  // Cerca del final del zoom, arranca el crossfade (revela el escritorio detrás)
  // y desmonta la intro justo al terminar el fundido, sin cortar la animación.
  const handleZoomHalfway = () => {
    setFading(true);
    setTimeout(() => onFinished(), FADE_DURATION * 1000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
    >
      <Canvas camera={{ position: [0, 1.1, 6], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["#05070f"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={1.3} />
          <pointLight position={[-4, -2, -4]} intensity={0.7} color="#ef4444" />
          <Stars radius={60} depth={30} count={1500} factor={4} fade speed={1} />
          <LaptopModel onZoomHalfway={handleZoomHalfway} />
        </Suspense>
      </Canvas>

      <motion.span
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm text-white/70 font-mono tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: fading ? 0 : [0, 1, 1, 0.4, 1] }}
        transition={{ duration: 2.5, repeat: fading ? 0 : Infinity }}
      >
        Iniciando Miguel<span className="text-red-600 font-bold">OS</span>...
      </motion.span>
    </motion.div>
  );
}

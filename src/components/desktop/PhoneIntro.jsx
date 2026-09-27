import React, { Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const OPEN_DURATION = 2.0; // s: el teléfono gira a verse de frente y se enciende
const HOLD = 0.35; // s de pausa con el teléfono de frente
const ZOOM_DURATION = 1.4; // s del acercamiento a la pantalla
const FADE_DURATION = 0.85; // s del crossfade final

// easeInOutCubic
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Rotación inicial del teléfono (ladeado) → al frente (0,0)
const FROM_ROT = { x: 0.35, y: -0.95 };

function PhoneModel({ onZoomHalfway }) {
  const group = useRef();
  const screen = useRef();
  const screenMat = useRef();

  const phase = useRef("opening"); // opening -> zooming -> done
  const openStart = useRef(null);
  const zoomStart = useRef(null);
  const camFrom = useRef(new THREE.Vector3());
  const halfDone = useRef(false);

  const screenWorld = useRef(new THREE.Vector3());
  const screenNormal = useRef(new THREE.Vector3());
  const lookNow = useRef(new THREE.Vector3());

  const LOOK_FROM = new THREE.Vector3(0, 0, 0.2);

  useFrame((state) => {
    const now = state.clock.elapsedTime;

    if (phase.current === "opening") {
      if (openStart.current === null) openStart.current = now;
      const t = Math.min((now - openStart.current) / OPEN_DURATION, 1);
      const e = ease(t);

      if (group.current) {
        group.current.rotation.x = FROM_ROT.x * (1 - e);
        group.current.rotation.y = FROM_ROT.y * (1 - e);
      }
      if (screenMat.current) screenMat.current.emissiveIntensity = 0.15 + e * 1.0;

      state.camera.lookAt(LOOK_FROM);

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

      screen.current.getWorldPosition(screenWorld.current);
      screen.current.getWorldDirection(screenNormal.current);

      // Vuelo horizontal hacia el frente de la pantalla (misma altura de cámara)
      const target = screenWorld.current
        .clone()
        .addScaledVector(screenNormal.current, 0.5);
      target.y = camFrom.current.y;

      state.camera.position.lerpVectors(camFrom.current, target, e);

      lookNow.current.copy(LOOK_FROM).lerp(screenWorld.current, e);
      state.camera.lookAt(lookNow.current);

      if (screenMat.current) screenMat.current.emissiveIntensity = 1.2 + e * 4.0;

      if (!halfDone.current && z >= 0.6) {
        halfDone.current = true;
        onZoomHalfway();
      }
      if (z >= 1) phase.current = "done";
    }
  });

  return (
    <group ref={group} rotation={[FROM_ROT.x, FROM_ROT.y, 0]}>
      {/* Cuerpo del teléfono */}
      <RoundedBox args={[2, 4, 0.22]} radius={0.16} smoothness={6}>
        <meshStandardMaterial color="#1f2937" metalness={0.75} roughness={0.3} />
      </RoundedBox>

      {/* Pantalla (cara frontal) */}
      <mesh ref={screen} position={[0, 0, 0.12]}>
        <planeGeometry args={[1.78, 3.75]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#0b1020"
          emissive="#ef4444"
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Notch superior */}
      <mesh position={[0, 1.7, 0.13]}>
        <planeGeometry args={[0.5, 0.12]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

export default function PhoneIntro({ onFinished }) {
  const [fading, setFading] = useState(false);

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
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["#05070f"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={1.3} />
          <pointLight position={[-4, -2, -4]} intensity={0.7} color="#ef4444" />
          <Stars radius={60} depth={30} count={1200} factor={4} fade speed={1} />
          <PhoneModel onZoomHalfway={handleZoomHalfway} />
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

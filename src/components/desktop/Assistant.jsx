import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { FaTimes, FaArrowRight } from "react-icons/fa";

const MESSAGES = [
  "¡Hola! Soy Migu, tu asistente de MiguelOS.",
  "Haz doble clic en los iconos del escritorio para abrir las apps.",
  "Prueba la app 'Visor 3D', ¡tiene un modelo interactivo!",
  "En 'Proyectos' encontrarás mi trabajo. Échale un ojo.",
  "Puedes cambiar el fondo desde 'Cambiar temas'.",
  "¿Listo para explorar? Disfruta el recorrido.",
];

// Robotcito flotante: cuerpo, cara con ojos brillantes y antena.
function Bot() {
  const group = useRef();
  const blink = useRef(1);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Mira suavemente de lado a lado
      group.current.rotation.y = Math.sin(t * 0.9) * 0.35;
      group.current.rotation.x = Math.sin(t * 0.6) * 0.08;
    }
    // Parpadeo ocasional
    const phase = t % 4;
    blink.current = phase > 3.85 ? 0.1 : 1;
  });

  return (
    <Float speed={2.2} floatIntensity={0.7} rotationIntensity={0.15}>
      <group ref={group}>
        {/* Cuerpo */}
        <mesh>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color="#e11d48" metalness={0.45} roughness={0.28} />
        </mesh>

        {/* Visor / cara oscura */}
        <mesh position={[0, 0.05, 0.72]}>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial color="#0b1020" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Ojos */}
        <mesh position={[-0.24, 0.12, 1.12]} scale={[1, blink.current, 1]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#22d3ee"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.24, 0.12, 1.12]} scale={[1, blink.current, 1]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#22d3ee"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>

        {/* Antena */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial
            color="#fca5a5"
            emissive="#ef4444"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Assistant({ isOn }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [index, setIndex] = useState(0);

  // Aparece un rato después de encender
  useEffect(() => {
    if (!isOn || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, [isOn, dismissed]);

  // Se oculta si se apaga el PC
  useEffect(() => {
    if (!isOn) setVisible(false);
  }, [isOn]);

  const nextTip = () => {
    setBubbleOpen(true);
    setIndex((i) => (i + 1) % MESSAGES.length);
  };

  const close = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="absolute bottom-20 right-4 z-[45] flex flex-col items-end gap-2 max-md:bottom-20 max-md:right-2">
      {/* Globo de diálogo */}
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-56 max-w-[70vw] rounded-2xl rounded-br-sm border border-white/10 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-3 text-white"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-red-400">Migu</span>
              <button
                onClick={close}
                aria-label="Cerrar asistente"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-gray-100">
              {MESSAGES[index]}
            </p>
            <div className="flex justify-end mt-2">
              <button
                onClick={nextTip}
                className="group flex items-center gap-1.5 text-[11px] text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg px-2.5 py-1 transition-all active:scale-95"
              >
                Siguiente
                <FaArrowRight className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            {/* Cola del globo */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-gray-900/95 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personaje 3D */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        onClick={() => (bubbleOpen ? nextTip() : setBubbleOpen(true))}
        className="w-24 h-24 cursor-pointer drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        title="Migu, tu asistente"
      >
        <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 4, 5]} intensity={1.4} />
            <pointLight position={[-3, -2, 2]} intensity={0.6} color="#22d3ee" />
            <Bot />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

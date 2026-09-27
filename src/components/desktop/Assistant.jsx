import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Center } from "@react-three/drei";
import * as THREE from "three";
import { FaTimes, FaArrowRight } from "react-icons/fa";

const MODEL_URL = "/modelo/migu.glb";
const MODEL_SCALE = 1.6;
const DANCE_MAX = 2.8; // s máx que dura el baile antes de volver a idle

const MESSAGES = [
  "¡Hola! Soy Migu, tu asistente de MiguelOS.",
  "Haz doble clic en los iconos del escritorio para abrir las apps.",
  "Prueba la app 'Visor 3D', ¡tiene un modelo interactivo!",
  "En 'Proyectos' encontrarás mi trabajo. Échale un ojo.",
  "Puedes cambiar el fondo desde 'Cambiar temas'.",
  "¿Listo para explorar? Disfruta el recorrido.",
];

const CONTEXT = {
  about: "Ese es mi 'Sobre mí' en formato JSON. ¡Conóceme!",
  projects: "Aquí están mis proyectos. Abre una carpeta para ver los detalles.",
  theme: "Desde aquí personalizas el fondo del escritorio.",
  model3d: "¡El Visor 3D! Arrastra para rotar el modelo y usa la rueda para zoom.",
};

// Modelo riggeado de Migu: animación esquelética real (idle "Alert" en bucle,
// y "Dance" como celebración que se dispara con danceNonce).
function MiguModel({ danceNonce }) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  // Idle en bucle
  useEffect(() => {
    const idle = actions?.Alert;
    if (!idle) return;
    idle.reset().fadeIn(0.4).play();
    return () => idle.fadeOut(0.3);
  }, [actions]);

  // Baile al recibir un trigger, con retorno automático a idle
  useEffect(() => {
    if (danceNonce === 0) return;
    const dance = actions?.Dance;
    const idle = actions?.Alert;
    if (!dance) return;

    dance.reset();
    dance.setLoop(THREE.LoopRepeat);
    idle?.fadeOut(0.2);
    dance.fadeIn(0.2).play();

    const dur = Math.min(dance.getClip().duration, DANCE_MAX);
    const timer = setTimeout(() => {
      dance.fadeOut(0.4);
      idle?.reset().fadeIn(0.4).play();
    }, dur * 1000);
    return () => clearTimeout(timer);
  }, [danceNonce, actions]);

  // Flotación sutil (además de la animación esquelética)
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.04;
    }
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={MODEL_SCALE} />
      </Center>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function Assistant({ isOn, windows }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [danceNonce, setDanceNonce] = useState(0);

  const prevWindows = useRef({});
  const dance = () => setDanceNonce((n) => n + 1);

  // Aparece un rato después de encender, bailando un saludo
  useEffect(() => {
    if (!isOn || dismissed) return;
    const timer = setTimeout(() => {
      setVisible(true);
      dance();
    }, 3500);
    return () => clearTimeout(timer);
  }, [isOn, dismissed]);

  useEffect(() => {
    if (!isOn) setVisible(false);
  }, [isOn]);

  // Mensajes contextuales + baile al abrir una app
  useEffect(() => {
    if (!windows) return;
    if (!dismissed) {
      Object.keys(windows).forEach((k) => {
        const openedNow = windows[k].show && !prevWindows.current[k]?.show;
        if (openedNow && CONTEXT[k]) {
          setMessage(CONTEXT[k]);
          setBubbleOpen(true);
          setVisible(true);
          dance();
        }
      });
    }
    prevWindows.current = Object.fromEntries(
      Object.keys(windows).map((k) => [k, { show: windows[k].show }])
    );
  }, [windows, dismissed]);

  const nextTip = () => {
    const n = (index + 1) % MESSAGES.length;
    setIndex(n);
    setMessage(MESSAGES[n]);
    setBubbleOpen(true);
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
            className="relative w-60 max-w-[72vw] rounded-2xl rounded-br-sm border border-white/10 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-3 text-white"
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
            <p className="text-xs leading-relaxed text-gray-100">{message}</p>
            <div className="flex justify-end mt-2">
              <button
                onClick={nextTip}
                className="group flex items-center gap-1.5 text-[11px] text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg px-2.5 py-1 transition-all active:scale-95"
              >
                Siguiente
                <FaArrowRight className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-gray-900/95 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personaje 3D */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        onClick={() => (bubbleOpen ? dance() : setBubbleOpen(true))}
        className="w-36 h-36 max-md:w-28 max-md:h-28 cursor-pointer drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        title="Migu, tu asistente"
      >
        <Canvas
          camera={{ position: [0, 0, 4.0], fov: 45 }}
          dpr={[1, 2]}
          gl={{ alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 4, 5]} intensity={1.5} />
            <pointLight position={[-3, -2, 2]} intensity={0.7} color="#22d3ee" />
            <MiguModel danceNonce={danceNonce} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

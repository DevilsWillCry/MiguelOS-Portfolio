import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Center } from "@react-three/drei";
import * as THREE from "three";
import { FaTimes, FaArrowRight } from "react-icons/fa";

const MODEL_URL = "/modelo/migu.glb";
const MODEL_SCALE = 1.5;

// Idles que se ejecutan al azar (Hanging se reserva para el arrastre)
const IDLE_POOL = [
  "Idle_Neutral",
  "Idle_Drunk",
  "Idle_Dwarf",
  "Idle_Offensive",
  "Idle_Warrior",
];

const MESSAGES = [
  "¡Hola! Soy Migu, tu asistente de MiguelOS.",
  "Haz doble clic en los iconos del escritorio para abrir las apps.",
  "Prueba la app 'Visor 3D', ¡tiene un modelo interactivo!",
  "En 'Proyectos' encontrarás mi trabajo. Échale un ojo.",
  "Puedes cambiar el fondo desde 'Cambiar temas'.",
  "Puedes arrastrarme por el escritorio si quieres.",
  "¿Listo para explorar? Disfruta el recorrido.",
];

const CONTEXT = {
  about: "Ese es mi 'Sobre mí' en formato JSON. ¡Conóceme!",
  projects: "Aquí están mis proyectos. Abre una carpeta para ver los detalles.",
  theme: "Desde aquí personalizas el fondo del escritorio.",
  model3d: "¡El Visor 3D! Arrastra para rotar el modelo y usa la rueda para zoom.",
};

// Modelo riggeado de Migu con animaciones de Mixamo:
// - Idle (Neutral Idle) en bucle
// - Wave (saludo) transitorio en eventos
// - Hang (Hanging Idle) mientras se arrastra a Migu
function MiguModel({ waveNonce, dragging }) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, mixer } = useAnimations(animations, group);
  const currentRef = useRef(null);
  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;

  const idleTimer = useRef(null);

  // Reproduce una acción con crossfade suave desde la actual
  const fadeTo = (name, { loop = THREE.LoopRepeat, reps = Infinity, timeScale = 1, fade = 0.5 } = {}) => {
    const next = actions?.[name];
    if (!next) return null;
    const prev = currentRef.current;
    next.reset();
    next.setLoop(loop, reps);
    next.clampWhenFinished = false;
    next.timeScale = timeScale;
    next.setEffectiveWeight(1);
    next.fadeIn(fade).play();
    if (prev && prev !== next) prev.fadeOut(fade);
    currentRef.current = next;
    return next;
  };

  // Idle aleatorio EN BUCLE; se reprograma el cambio tras ~una vuelta
  const playRandomIdle = () => {
    clearTimeout(idleTimer.current);
    const pool = IDLE_POOL.filter((n) => actions?.[n]);
    if (pool.length === 0) return;
    const prevName = currentRef.current?.getClip().name;
    const choices = pool.length > 1 ? pool.filter((n) => n !== prevName) : pool;
    const name = choices[Math.floor(Math.random() * choices.length)];
    const act = fadeTo(name, { loop: THREE.LoopRepeat });
    const dur = act?.getClip().duration || 7;
    idleTimer.current = setTimeout(() => {
      if (!draggingRef.current) playRandomIdle();
    }, Math.max(4, dur) * 1000);
  };

  // Arranque
  useEffect(() => {
    if (actions) playRandomIdle();
    return () => clearTimeout(idleTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  // Arrastre: Hanging en bucle / al soltar, vuelve a idles aleatorios
  useEffect(() => {
    if (!actions) return;
    if (dragging) {
      clearTimeout(idleTimer.current);
      fadeTo("Hang", { loop: THREE.LoopRepeat });
    } else {
      playRandomIdle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, actions]);

  // Saludo transitorio (no interrumpe si está siendo arrastrado)
  useEffect(() => {
    if (waveNonce === 0 || draggingRef.current) return;
    clearTimeout(idleTimer.current);
    fadeTo("Wave", { loop: THREE.LoopRepeat, reps: 3, timeScale: 0.9, fade: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waveNonce]);

  // El saludo (reps finitas) termina → volver a un idle aleatorio
  useEffect(() => {
    if (!mixer) return;
    const onFinished = (e) => {
      if (draggingRef.current) return;
      if (e.action !== currentRef.current) return;
      playRandomIdle();
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer]);

  // Flotación sutil
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

export default function Assistant({ isOn, windows, containerRef }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [waveNonce, setWaveNonce] = useState(0);
  const [dragging, setDragging] = useState(false);

  const prevWindows = useRef({});
  const wave = () => setWaveNonce((n) => n + 1);

  // Posición de arrastre compartida: Migu y el globo usan las mismas motion
  // values, así el mensaje lo sigue cuando lo arrastras.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!isOn || dismissed) return;
    const timer = setTimeout(() => {
      setVisible(true);
      wave();
    }, 3500);
    return () => clearTimeout(timer);
  }, [isOn, dismissed]);

  useEffect(() => {
    if (!isOn) setVisible(false);
  }, [isOn]);

  useEffect(() => {
    if (!windows) return;
    if (!dismissed) {
      Object.keys(windows).forEach((k) => {
        const openedNow = windows[k].show && !prevWindows.current[k]?.show;
        if (openedNow && CONTEXT[k]) {
          setMessage(CONTEXT[k]);
          setBubbleOpen(true);
          setVisible(true);
          wave();
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
      {/* Globo de diálogo (usa las mismas x/y que Migu para seguirlo al arrastrar) */}
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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

      {/* Personaje 3D (arrastrable: al sostenerlo hace el "hanging idle") */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        dragElastic={0.15}
        style={{ x, y }}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        onClick={() => (bubbleOpen ? wave() : setBubbleOpen(true))}
        className={`w-48 h-48 max-md:w-36 max-md:h-36 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        title="Migu — arrástrame o haz clic"
      >
        <Canvas
          camera={{ position: [0, 0.2, 5.2], fov: 45 }}
          dpr={[1, 2]}
          gl={{ alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 4, 5]} intensity={1.5} />
            <pointLight position={[-3, -2, 2]} intensity={0.7} color="#22d3ee" />
            <MiguModel waveNonce={waveNonce} dragging={dragging} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

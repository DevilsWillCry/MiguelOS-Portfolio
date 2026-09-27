import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { FaTimes, FaArrowRight } from "react-icons/fa";

const MODEL_URL = "/modelo/migu.glb";
const TARGET_HEIGHT = 2.6; // alto deseado en el encuadre (auto-ajuste de escala)

// Saludo hecho a mano sobre ESTE rig (rotaciones locales sumadas a la pose bind).
// Si el brazo queda al revés/raro, ajusta signos y valores aquí.
const WAVE = {
  duration: 2.2,
  arm: { x: 0, y: 0, z: -2.1 }, // levanta el brazo hacia arriba/afuera
  fore: { x: 0, y: 0, z: -0.5 }, // dobla el codo
  hand: { x: 0, y: 0, z: 0.2 },
  oscAmp: 0.5, // amplitud del "agite" de la mano
  oscSpeed: 12,
};

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

// Modelo ESTÁTICO (en su pose natural, sin animación esquelética → sin deformación).
// El movimiento se hace por transformación de todo el cuerpo (flotar, gestos, vaivén).
function MiguModel({ gestureRef, dragging }) {
  const group = useRef();
  const { scene } = useGLTF(MODEL_URL);

  // Auto-escala + material (baja metalicidad para que no se vea negro)
  const fitScale = useMemo(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        m.metalness = 0.15;
        m.roughness = 0.8;
        m.needsUpdate = true;
      });
    });
    scene.scale.set(1, 1, 1);
    scene.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    return size.y > 0 ? TARGET_HEIGHT / size.y : 1;
  }, [scene]);

  // Huesos del brazo derecho + su rotación de bind (pose natural).
  // GLTFLoader puede sanitizar los nombres (quitar ":"), así que buscamos por
  // sufijo del nombre "limpio" para encontrarlos igual.
  const arm = useMemo(() => {
    const clean = (s) => (s || "").replace(/[^a-z]/gi, "").toLowerCase();
    const find = (suffix) => {
      let found = null;
      scene.traverse((o) => {
        if (!found && clean(o.name).endsWith(suffix)) found = o;
      });
      return found;
    };
    const bones = {
      arm: find("rightarm"),
      fore: find("rightforearm"),
      hand: find("righthand"),
    };
    const bind = {
      arm: bones.arm?.quaternion.clone(),
      fore: bones.fore?.quaternion.clone(),
      hand: bones.hand?.quaternion.clone(),
    };
    return { bones, bind };
  }, [scene]);

  // Objetos reutilizables para no crear basura por frame
  const tmp = useMemo(
    () => ({ e: new THREE.Euler(), q: new THREE.Quaternion(), t: new THREE.Quaternion() }),
    []
  );

  const poseBone = (bone, bindQ, rot, extraZ, weight) => {
    if (!bone || !bindQ) return;
    if (weight <= 0.0001) {
      bone.quaternion.copy(bindQ);
      return;
    }
    tmp.e.set(rot.x, rot.y, rot.z + extraZ);
    tmp.q.setFromEuler(tmp.e);
    tmp.t.copy(bindQ).multiply(tmp.q); // bind * delta (rotación local sumada)
    bone.quaternion.copy(bindQ).slerp(tmp.t, weight);
  };

  useFrame((state) => {
    const o = group.current;
    if (!o) return;
    const t = state.clock.elapsedTime;

    // Idle base del cuerpo: flota y se balancea
    let rotX = 0;
    let rotY = Math.sin(t * 0.6) * 0.18;
    let rotZ = 0;
    let posY = Math.sin(t * 1.6) * 0.05;

    // Peso del saludo (0 = brazo en pose natural)
    let waveW = 0;

    const g = gestureRef.current;
    if (g && g.type !== "idle") {
      if (g.t0 == null) g.t0 = t;
      const dt = t - g.t0;

      if (g.type === "wave") {
        const dur = WAVE.duration;
        const inT = 0.3, outT = 0.5;
        waveW = dt < inT ? dt / inT : dt > dur - outT ? Math.max(0, (dur - dt) / outT) : 1;
        if (dt >= dur) g.type = "idle";
      } else if (g.type === "point") {
        const dur = 1.2;
        const decay = Math.max(0, 1 - dt / dur);
        rotX = (0.12 + Math.sin(dt * 10) * 0.1) * decay;
        if (dt >= dur) g.type = "idle";
      }
    }

    // Aplica el saludo a los huesos del brazo (o los deja en bind si waveW=0)
    const dtNow = g && g.t0 != null ? t - g.t0 : 0;
    const osc = Math.sin(dtNow * WAVE.oscSpeed) * WAVE.oscAmp * waveW;
    poseBone(arm.bones.arm, arm.bind.arm, WAVE.arm, 0, waveW);
    poseBone(arm.bones.fore, arm.bind.fore, WAVE.fore, osc, waveW);
    poseBone(arm.bones.hand, arm.bind.hand, WAVE.hand, 0, waveW);

    // Al arrastrarlo: vaivén tipo péndulo, como si colgara del mouse
    if (dragging) {
      rotZ += Math.sin(t * 3) * 0.18;
      rotX += 0.12;
    }

    o.rotation.set(rotX, rotY, rotZ);
    o.position.y = posY;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={fitScale} />
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
  const [dragging, setDragging] = useState(false);

  const prevWindows = useRef({});
  const gesture = useRef({ type: "wave", t0: null });
  const playGesture = (type) => {
    gesture.current = { type, t0: null };
  };

  // Posición de arrastre compartida (el globo sigue a Migu)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!isOn || dismissed) return;
    const timer = setTimeout(() => {
      setVisible(true);
      playGesture("wave");
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
          playGesture("point");
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
    playGesture("wave");
  };

  const close = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="absolute bottom-20 right-4 z-[45] flex flex-col items-end gap-2 max-md:bottom-20 max-md:right-2">
      {/* Globo de diálogo (sigue a Migu con las mismas x/y) */}
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

      {/* Personaje 3D (arrastrable) */}
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
        onClick={() => (bubbleOpen ? playGesture("wave") : setBubbleOpen(true))}
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
            <ambientLight intensity={0.8} />
            <directionalLight position={[3, 4, 5]} intensity={1.6} />
            <pointLight position={[-3, -2, 2]} intensity={0.7} color="#22d3ee" />
            <MiguModel gestureRef={gesture} dragging={dragging} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

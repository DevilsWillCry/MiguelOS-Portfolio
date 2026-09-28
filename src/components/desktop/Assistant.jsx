import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FaTimes, FaArrowRight } from "react-icons/fa";

const MODEL_URL = "/modelo/migu.glb";
const TARGET_HEIGHT = 2.6; // alto deseado en el encuadre (auto-ajuste de escala)

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
function MiguModel({ gestureRef, dragging, tint }) {
  const group = useRef();
  const { scene } = useGLTF(MODEL_URL);

  // Auto-escala + centrado. Se mide UNA vez tras montar (timing fiable, con el
  // modelo ya en el grafo) y se guarda en estado, para que el tamaño sea estable
  // y no cambie al abrir otras apps.
  const [fit, setFit] = useState({ scale: 1, offset: [0, 0, 0] });

  useEffect(() => {
    // Pose de bind + material (una sola vez)
    scene.traverse((o) => {
      if (o.isSkinnedMesh && o.skeleton) o.skeleton.pose();
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        m.metalness = 0.15;
        m.roughness = 0.8;
        m.needsUpdate = true;
      });
    });

    const measure = () => {
      // Mide la geometría en espacio local (sin depender del grafo padre),
      // resolviendo el transform de cada malla respecto a la raíz del modelo.
      scene.updateWorldMatrix(true, true);
      const inv = new THREE.Matrix4().copy(scene.matrixWorld).invert();
      const box = new THREE.Box3();
      const tmp = new THREE.Box3();
      const mtx = new THREE.Matrix4();
      scene.traverse((o) => {
        if (o.isMesh && o.geometry) {
          o.geometry.computeBoundingBox();
          tmp.copy(o.geometry.boundingBox);
          mtx.multiplyMatrices(inv, o.matrixWorld);
          tmp.applyMatrix4(mtx);
          box.union(tmp);
        }
      });
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      if (size.y > 0.0001 && isFinite(size.y)) {
        const s = TARGET_HEIGHT / size.y;
        setFit({ scale: s, offset: [-center.x * s, -center.y * s, -center.z * s] });
      }
    };

    measure();
    const raf = requestAnimationFrame(measure); // segunda pasada por si acaso
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  const fitScale = fit.scale;
  const centerOffset = fit.offset;

  // Tinte que CONSERVA los detalles: se mantiene la textura y se aplica una
  // mezcla tipo "screen" en el shader → recolorea las zonas oscuras del cuerpo
  // pero deja intactas las claras (ojos, abdomen). uAmount=0 => original.
  useEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        if (!m.userData._tintPatched) {
          m.userData._uTint = { value: new THREE.Color("#ffffff") };
          m.userData._uAmount = { value: 0 };
          m.onBeforeCompile = (shader) => {
            shader.uniforms.uTint = m.userData._uTint;
            shader.uniforms.uAmount = m.userData._uAmount;
            shader.fragmentShader =
              "uniform vec3 uTint;\nuniform float uAmount;\n" +
              shader.fragmentShader.replace(
                "#include <map_fragment>",
                "#include <map_fragment>\n  diffuseColor.rgb = mix(diffuseColor.rgb, 1.0 - (1.0 - diffuseColor.rgb) * (1.0 - uTint), uAmount);"
              );
          };
          m.userData._tintPatched = true;
          m.needsUpdate = true;
        }
        if (tint) {
          m.userData._uTint.value.set(tint);
          m.userData._uAmount.value = 0.8;
        } else {
          m.userData._uAmount.value = 0;
        }
      });
    });
  }, [scene, tint]);

  // Movimiento SOLO de cuerpo (no toca el rig): flota, se balancea y hace gestos
  // moviendo todo el modelo (saludo = meneo + saltitos, señalar = inclinación).
  useFrame((state) => {
    const o = group.current;
    if (!o) return;
    const t = state.clock.elapsedTime;

    let rotX = 0;
    let rotY = Math.sin(t * 0.6) * 0.18;
    let rotZ = 0;
    let posY = Math.sin(t * 1.6) * 0.05;

    const g = gestureRef.current;
    if (g && g.type !== "idle") {
      if (g.t0 == null) g.t0 = t;
      const dt = t - g.t0;
      const dur = 1.3;
      const decay = Math.max(0, 1 - dt / dur);
      if (g.type === "greet") {
        rotZ += Math.sin(dt * 13) * 0.22 * decay; // se mece contento
        posY += Math.abs(Math.sin(dt * 6.5)) * 0.14 * decay; // saltitos
      } else if (g.type === "point") {
        rotX += (0.14 + Math.sin(dt * 10) * 0.1) * decay; // se inclina
      }
      if (dt >= dur) g.type = "idle";
    }

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
      <primitive object={scene} scale={fitScale} position={centerOffset} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function Assistant({ isOn, windows, containerRef, isMobile, enabled = true, tint = null }) {
  const [visible, setVisible] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [dragging, setDragging] = useState(false);

  const prevWindows = useRef({});
  const gesture = useRef({ type: "greet", t0: null });
  const playGesture = (type) => {
    gesture.current = { type, t0: null };
  };

  // Posición de arrastre compartida (el globo sigue a Migu)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!isOn) return;
    const timer = setTimeout(() => {
      setVisible(true);
      playGesture("greet");
    }, 3500);
    return () => clearTimeout(timer);
  }, [isOn]);

  useEffect(() => {
    if (!isOn) setVisible(false);
  }, [isOn]);

  // Mensajes contextuales al abrir una app (reabre el globo aunque estuviera cerrado)
  useEffect(() => {
    if (!windows) return;
    Object.keys(windows).forEach((k) => {
      const openedNow = windows[k].show && !prevWindows.current[k]?.show;
      if (openedNow && CONTEXT[k]) {
        setMessage(CONTEXT[k]);
        setBubbleOpen(true);
        setVisible(true);
        playGesture("point");
      }
    });
    prevWindows.current = Object.fromEntries(
      Object.keys(windows).map((k) => [k, { show: windows[k].show }])
    );
  }, [windows]);

  const nextTip = () => {
    const n = (index + 1) % MESSAGES.length;
    setIndex(n);
    setMessage(MESSAGES[n]);
    setBubbleOpen(true);
    playGesture("greet");
  };

  // La X solo cierra el globo; Migu se queda en pantalla y arrastrable
  const closeBubble = () => setBubbleOpen(false);

  // Clic/tap sobre Migu: si el globo está abierto, saluda; si está cerrado,
  // lo reabre (tap en móvil, doble clic en PC vía onDoubleClick)
  const handleModelClick = () => {
    if (bubbleOpen) {
      playGesture("greet");
    } else if (isMobile) {
      setBubbleOpen(true);
    } else {
      playGesture("greet");
    }
  };
  const handleModelDoubleClick = () => {
    if (!isMobile && !bubbleOpen) setBubbleOpen(true);
  };

  if (!visible || !enabled) return null;

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
                onClick={closeBubble}
                aria-label="Cerrar mensaje"
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
        onClick={handleModelClick}
        onDoubleClick={handleModelDoubleClick}
        className={`w-48 h-48 max-md:w-36 max-md:h-36 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        title="Migu — arrástrame; doble clic para ver el mensaje"
      >
        <Canvas
          camera={{ position: [0, 0.2, 5.2], fov: 45 }}
          dpr={[1, 2]}
          gl={{ alpha: true }}
          resize={{ debounce: 0 }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[3, 4, 5]} intensity={1.6} />
            <pointLight position={[-3, -2, 2]} intensity={0.7} color="#22d3ee" />
            <MiguModel gestureRef={gesture} dragging={dragging} tint={tint} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

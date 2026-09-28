import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, useGLTF } from "@react-three/drei";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import {
  FaWindowClose,
  FaMinus,
  FaWindowMaximize,
  FaWindowRestore,
  FaPlay,
  FaRedo,
} from "react-icons/fa";
import { getWindowClass } from "../../helpers/windowClass";
import useWindowFrame from "../../hooks/useWindowFrame";

const BOUND = 4.2; // rango horizontal del jugador
const PLAYER_Z = 5; // z del jugador (cerca de cámara)
const SPAWN_Z = -48; // z donde nacen los obstáculos
const PAST_Z = 8.5; // z tras el cual el obstáculo se recicla (esquivado)
const COUNT = 16; // obstáculos en el pool
const BASE_SPEED = 15;
const GRACE = 22; // distancia libre al inicio (para que no choque de una)
const COLORS = ["#ef4444", "#22d3ee", "#a855f7", "#f59e0b", "#ec4899"];
const MIGU_URL = "/modelo/migu.glb";
const BEST_KEY = "miguos_dodge_best";

function randX() {
  return (Math.random() * 2 - 1) * BOUND;
}

// Jugador: modelo de Migu clonado (para no chocar con el del escritorio),
// escalado y en pose de bind.
function MiguPlayer() {
  const { scene } = useGLTF(MIGU_URL);
  const model = useMemo(() => {
    const c = skeletonClone(scene);
    c.traverse((o) => {
      if (o.isSkinnedMesh && o.skeleton) o.skeleton.pose();
      if (o.isMesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          m.metalness = 0.15;
          m.roughness = 0.8;
        });
      }
    });
    return c;
  }, [scene]);

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = size.y > 0 ? 1.6 / size.y : 1;
    return { s, offset: [-center.x * s, -center.y * s, -center.z * s] };
  }, [model]);

  return <primitive object={model} scale={fit.s} position={fit.offset} />;
}

function Scene({ gameRef, onScore, onGameOver, scoreRef }) {
  const player = useRef();
  const grid = useRef();
  const obsRefs = useRef([]);
  const obsData = useRef(
    Array.from({ length: COUNT }, () => ({ x: 0, z: 0 }))
  );

  // Formas geométricas aleatorias para los obstáculos
  const shapes = useMemo(
    () => [
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.SphereGeometry(0.8, 24, 24),
      new THREE.OctahedronGeometry(0.95), // rombo / diamante
      new THREE.ConeGeometry(0.85, 1.5, 6),
      new THREE.TorusGeometry(0.6, 0.26, 14, 28),
      new THREE.TetrahedronGeometry(1.05),
      new THREE.CylinderGeometry(0.7, 0.7, 1.3, 12),
      new THREE.DodecahedronGeometry(0.85),
    ],
    []
  );
  useEffect(() => () => shapes.forEach((g) => g.dispose()), [shapes]);

  const dressObstacle = (mesh) => {
    if (!mesh) return;
    mesh.geometry = shapes[Math.floor(Math.random() * shapes.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    mesh.material.color.set(c);
    mesh.material.emissive.set(c);
  };

  const initAll = () => {
    obsData.current.forEach((d, i) => {
      d.x = randX();
      // Espacio de gracia: el más cercano nace a -GRACE y el resto más lejos
      d.z = -GRACE - i * 3.2 - Math.random() * 2;
      dressObstacle(obsRefs.current[i]);
    });
    if (player.current) player.current.position.x = 0;
    gameRef.current.targetX = 0;
    gameRef.current.playerX = 0;
  };

  const respawn = (d, mesh) => {
    d.z = SPAWN_Z - Math.random() * 12;
    d.x = randX();
    dressObstacle(mesh);
  };

  useFrame((state, delta) => {
    const g = gameRef.current;
    const dt = Math.min(delta, 0.05); // evita saltos si baja el framerate
    const speed = BASE_SPEED + scoreRef.current * 0.5;

    // Suelo con líneas que se desplazan para dar sensación de velocidad
    if (grid.current) {
      grid.current.position.z = (state.clock.elapsedTime * speed) % 2;
    }

    if (g.reset) {
      initAll();
      g.reset = false;
    }

    // Movimiento del jugador (mouse/táctil fija targetX; teclado lo empuja)
    if (g.keyDir) g.targetX += g.keyDir * BOUND * 1.4 * dt;
    g.targetX = THREE.MathUtils.clamp(g.targetX, -BOUND, BOUND);
    if (player.current) {
      player.current.position.x = THREE.MathUtils.damp(
        player.current.position.x,
        g.targetX,
        12,
        dt
      );
      player.current.rotation.z = (g.targetX - player.current.position.x) * 0.3;
      g.playerX = player.current.position.x;
    }

    if (!g.running) return;

    for (let i = 0; i < COUNT; i++) {
      const d = obsData.current[i];
      const mesh = obsRefs.current[i];
      d.z += speed * dt;
      if (mesh) {
        mesh.position.set(d.x, 0.6, d.z);
        mesh.rotation.x += dt * 2;
        mesh.rotation.y += dt * 1.5;
      }
      // Colisión
      if (
        Math.abs(d.z - PLAYER_Z) < 0.95 &&
        Math.abs(d.x - g.playerX) < 1.05
      ) {
        g.running = false;
        onGameOver();
        return;
      }
      // Esquivado
      if (d.z > PAST_Z) {
        onScore();
        respawn(d, mesh);
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#05070f"]} />
      <fog attach="fog" args={["#05070f", 12, 48]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={1} />
      <pointLight position={[0, 4, 6]} intensity={0.8} color="#22d3ee" />
      <Stars radius={60} depth={40} count={800} factor={4} fade speed={1} />

      {/* Suelo */}
      <gridHelper
        ref={grid}
        args={[60, 60, "#ef4444", "#123"]}
        position={[0, 0, 0]}
      />

      {/* Jugador: Migu */}
      <group ref={player} position={[0, 0.9, PLAYER_Z]}>
        <MiguPlayer />
      </group>

      {/* Obstáculos (geometría asignada dinámicamente al reaparecer) */}
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh key={i} ref={(el) => (obsRefs.current[i] = el)} position={[0, 0.6, SPAWN_Z]}>
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.8}
            metalness={0.2}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export default function DodgeGame({
  onMinimizeChange,
  onMaximizeChange,
  setMaximize,
  isOn,
  containerRef,
  isMobile,
}) {
  const { x, y, isMaximized, maximize, restore } = useWindowFrame();
  const dragControls = useDragControls();
  const canDrag = !isMobile && !isMaximized;

  const [phase, setPhase] = useState("ready"); // ready | playing | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const scoreRef = useRef(0);
  const gameRef = useRef({ running: false, reset: false, targetX: 0, playerX: 0, keyDir: 0 });

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch (e) {
      /* ignore */
    }
  }, []);

  // Si se apaga el PC, cerrar
  useEffect(() => {
    if (!isOn) {
      setMaximize((prev) => ({ ...prev, game: { show: false, minimized: false } }));
    }
  }, [isOn]);

  // Teclado
  useEffect(() => {
    const down = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) gameRef.current.keyDir = -1;
      if (["ArrowRight", "d", "D"].includes(e.key)) gameRef.current.keyDir = 1;
      if (["ArrowLeft", "ArrowRight"].includes(e.key) && phase === "playing") e.preventDefault();
    };
    const up = (e) => {
      if (["ArrowLeft", "a", "A", "ArrowRight", "d", "D"].includes(e.key))
        gameRef.current.keyDir = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    gameRef.current.reset = true;
    gameRef.current.running = true;
    setPhase("playing");
  };

  const handleScore = () => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  const handleGameOver = () => {
    setPhase("over");
    setBest((b) => {
      const nb = Math.max(b, scoreRef.current);
      try {
        localStorage.setItem(BEST_KEY, String(nb));
      } catch (e) {
        /* ignore */
      }
      return nb;
    });
  };

  // Control por puntero (mouse/táctil) sobre el lienzo
  const handlePointer = (e) => {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ndc = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    gameRef.current.targetX = THREE.MathUtils.clamp(ndc * BOUND, -BOUND, BOUND);
  };

  const baseClass =
    "absolute top-24 left-24 w-[46%] h-[62%] bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[42%] min-xl:h-[62%] min-xl:top-24 min-xl:left-64 max-md:top-12 max-md:left-3 max-md:w-[80%] max-md:h-[60%] min-lg:top-[2rem] min-lg:left-[8rem] min-lg:w-[52%] min-lg:h-[60%] flex flex-col";

  return (
    <AnimatePresence>
      {onMaximizeChange && (
        <motion.div
          drag={canDrag}
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={containerRef}
          dragMomentum={false}
          style={{ x, y }}
          className={getWindowClass({ isMobile, isMaximized, base: baseClass })}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
        >
          {/* Barra superior */}
          <div
            className="absolute top-0 left-0 right-0 h-10 bg-gray-800 px-3 rounded-t-xl flex justify-between items-center cursor-move z-30"
            onPointerDown={(e) => canDrag && dragControls.start(e)}
          >
            <span className="text-sm">
              Neon <span className="text-red-500 font-bold">Dodge</span>
            </span>
            <div className="flex gap-2 items-center">
              <FaMinus
                className="text-yellow-400 cursor-pointer"
                onClick={() => {
                  onMinimizeChange("game");
                  setMaximize((prev) => ({ ...prev, game: { show: false, minimized: true } }));
                }}
              />
              {!isMobile &&
                (isMaximized ? (
                  <FaWindowRestore className="text-green-400 cursor-pointer text-sm" onClick={restore} />
                ) : (
                  <FaWindowMaximize className="text-green-400 cursor-pointer text-sm" onClick={maximize} />
                ))}
              <FaWindowClose
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  restore();
                  gameRef.current.running = false;
                  setPhase("ready");
                  setMaximize((prev) => ({ ...prev, game: { show: false, minimized: false } }));
                }}
              />
            </div>
          </div>

          {/* Área de juego */}
          <div
            className="absolute top-10 left-0 right-0 bottom-0 overflow-hidden rounded-b-xl select-none"
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
          >
            <Canvas
              camera={{ position: [0, 3.2, 10], fov: 55 }}
              dpr={[1, 2]}
              resize={{ debounce: 0 }}
            >
              <Suspense fallback={null}>
                <Scene
                  gameRef={gameRef}
                  scoreRef={scoreRef}
                  onScore={handleScore}
                  onGameOver={handleGameOver}
                />
              </Suspense>
            </Canvas>

            {/* Marcador */}
            {phase === "playing" && (
              <div className="absolute top-3 left-4 text-white font-mono text-lg pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {score}
              </div>
            )}

            {/* Pantalla de inicio */}
            {phase === "ready" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm text-white text-center px-6">
                <h2 className="text-2xl font-bold tracking-wide">
                  Neon <span className="text-red-500">Dodge</span>
                </h2>
                <p className="text-xs text-gray-300 max-w-xs">
                  Esquiva los bloques. Muévete con el <b>mouse</b>, las <b>flechas</b> o
                  arrastrando el dedo. ¡La velocidad sube!
                </p>
                <button
                  onClick={start}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl px-5 py-2.5 font-semibold shadow-lg"
                >
                  <FaPlay className="text-sm" /> Jugar
                </button>
                <span className="text-[11px] text-gray-400">Récord: {best}</span>
              </div>
            )}

            {/* Game over */}
            {phase === "over" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm text-white text-center px-6">
                <h2 className="text-2xl font-bold text-red-500">¡Chocaste!</h2>
                <div className="text-sm">
                  Puntaje: <b className="text-lg">{score}</b>
                </div>
                <div className="text-[12px] text-gray-300">
                  Récord: {best}
                  {score >= best && score > 0 && (
                    <span className="text-amber-400 font-bold"> · ¡Nuevo récord!</span>
                  )}
                </div>
                <button
                  onClick={start}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl px-5 py-2.5 font-semibold shadow-lg mt-1"
                >
                  <FaRedo className="text-sm" /> Reintentar
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

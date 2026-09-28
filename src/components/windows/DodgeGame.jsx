import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  FaWindowClose,
  FaMinus,
  FaWindowMaximize,
  FaWindowRestore,
  FaPlay,
  FaRedo,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
} from "react-icons/fa";
import { getWindowClass } from "../../helpers/windowClass";
import useWindowFrame from "../../hooks/useWindowFrame";

import stingrayUrl from "../../assets/neon-dodge-assets/3d-models/f-zero__fire_stingray.glb";
import falconUrl from "../../assets/neon-dodge-assets/3d-models/f-zero__blue_falcon.glb";

const BOUND = 4.2;
const PLAYER_Z = 5;
const SPAWN_Z = -48;
const PAST_Z = 8.5;
const COUNT = 16;
const BASE_SPEED = 15;
const GRACE = 22;
const COLORS = ["#ef4444", "#22d3ee", "#a855f7", "#f59e0b", "#ec4899"];
const BEST_KEY = "miguos_dodge_best";

// Config de naves. baseRotation orienta el modelo (ajustable si la punta mira mal).
const SHIPS = [
  {
    id: "stingray",
    name: "Fire Stingray",
    url: stingrayUrl,
    perk: "Blindada: aguanta 1 golpe",
    baseRotation: [0, 0, 0],
    handling: 9,
    speedMul: 0.95,
    shield: 1,
    stats: { Manejo: 3, Velocidad: 3, Escudo: 5 },
  },
  {
    id: "falcon",
    name: "Blue Falcon",
    url: falconUrl,
    perk: "Ágil y veloz (sin escudo)",
    baseRotation: [0, 0, 0],
    handling: 14,
    speedMul: 1.15,
    shield: 0,
    stats: { Manejo: 5, Velocidad: 4, Escudo: 0 },
  },
];

useGLTF.preload(stingrayUrl);
useGLTF.preload(falconUrl);

function randX() {
  return (Math.random() * 2 - 1) * BOUND;
}

// Carga y normaliza una nave: la centra, la escala a un tamaño objetivo y le
// aplica la rotación base. targetSize ~ dimensión máxima final.
function ShipModel({ ship, targetSize = 2 }) {
  const { scene } = useGLTF(ship.url);
  const model = useMemo(() => scene.clone(true), [scene]);

  const fit = useMemo(() => {
    model.rotation.set(...ship.baseRotation);
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxd = Math.max(size.x, size.y, size.z) || 1;
    const s = targetSize / maxd;
    return { s, offset: [-center.x * s, -center.y * s, -center.z * s] };
  }, [model, ship, targetSize]);

  return (
    <group scale={fit.s} position={fit.offset}>
      <primitive object={model} rotation={ship.baseRotation} />
    </group>
  );
}

function Scene({ gameRef, onScore, onGameOver, onShieldChange, scoreRef, phase, ship }) {
  const player = useRef();
  const grid = useRef();
  const obsRefs = useRef([]);
  const obsData = useRef(Array.from({ length: COUNT }, () => ({ x: 0, z: 0 })));

  const shapes = useMemo(
    () => [
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.SphereGeometry(0.8, 24, 24),
      new THREE.OctahedronGeometry(0.95),
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
      d.z = -GRACE - i * 3.2 - Math.random() * 2;
      dressObstacle(obsRefs.current[i]);
    });
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
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const speed = (BASE_SPEED + scoreRef.current * 0.5) * (g.speedMul || 1);

    if (grid.current) grid.current.position.z = (t * speed) % 2;

    if (g.reset) {
      initAll();
      g.reset = false;
    }

    // --- Nave (jugador) ---
    if (player.current) {
      if (phase === "ready") {
        // Vista de selector: centrada y girando
        player.current.position.set(0, 1.1, 2.6);
        player.current.rotation.set(0, t * 0.9, 0);
        player.current.visible = true;
      } else {
        // Juego: se controla en el carril
        if (g.keyDir) g.targetX += g.keyDir * BOUND * 1.4 * dt;
        g.targetX = THREE.MathUtils.clamp(g.targetX, -BOUND, BOUND);
        const px = THREE.MathUtils.damp(player.current.position.x, g.targetX, g.handling || 10, dt);
        player.current.position.set(px, 0.9, PLAYER_Z);
        player.current.rotation.set(0, 0, (g.targetX - px) * 0.35);
        g.playerX = px;
        // Parpadeo durante invulnerabilidad
        player.current.visible = g.invulnUntil > t ? Math.floor(t * 12) % 2 === 0 : true;
      }
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
      const hit =
        Math.abs(d.z - PLAYER_Z) < 0.9 && Math.abs(d.x - g.playerX) < 0.95;
      if (hit && g.invulnUntil <= t) {
        if (g.shield > 0) {
          g.shield -= 1;
          onShieldChange(g.shield);
          g.invulnUntil = t + 1.3; // breve invulnerabilidad
          respawn(d, mesh);
        } else {
          g.running = false;
          onGameOver();
          return;
        }
      }
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 6, 4]} intensity={1.1} />
      <pointLight position={[0, 4, 6]} intensity={0.9} color="#22d3ee" />
      <Stars radius={60} depth={40} count={800} factor={4} fade speed={1} />

      <gridHelper ref={grid} args={[60, 60, "#ef4444", "#123"]} position={[0, 0, 0]} />

      {/* Nave (selector + jugador) */}
      <group ref={player} position={[0, 1.1, 2.6]}>
        <Suspense fallback={null}>
          <ShipModel ship={ship} targetSize={2.4} />
        </Suspense>
      </group>

      {/* Obstáculos (ocultos en el selector) */}
      <group visible={phase !== "ready"}>
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
      </group>
    </>
  );
}

function StatBar({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-16 text-gray-300 text-right">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`w-3 h-2 rounded-sm ${
              i < value ? "bg-red-500" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
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
  const [shipIndex, setShipIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [shieldHUD, setShieldHUD] = useState(0);
  const scoreRef = useRef(0);
  const gameRef = useRef({
    running: false,
    reset: false,
    targetX: 0,
    playerX: 0,
    keyDir: 0,
    handling: 10,
    speedMul: 1,
    shield: 0,
    invulnUntil: 0,
  });

  const ship = SHIPS[shipIndex];

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isOn) setMaximize((prev) => ({ ...prev, game: { show: false, minimized: false } }));
  }, [isOn]);

  // Al abrir la ventana, el canvas mide mal su tamaño (por la animación de
  // entrada) y solo se corrige con un resize. Lo disparamos nosotros.
  useEffect(() => {
    if (!onMaximizeChange) return;
    const ids = [60, 250, 600].map((d) =>
      setTimeout(() => window.dispatchEvent(new Event("resize")), d)
    );
    return () => ids.forEach(clearTimeout);
  }, [onMaximizeChange]);

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
    gameRef.current.handling = ship.handling;
    gameRef.current.speedMul = ship.speedMul;
    gameRef.current.shield = ship.shield;
    gameRef.current.invulnUntil = 0;
    setShieldHUD(ship.shield);
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

  const changeShip = (dir) => setShipIndex((i) => (i + dir + SHIPS.length) % SHIPS.length);

  const handlePointer = (e) => {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ndc = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    gameRef.current.targetX = THREE.MathUtils.clamp(ndc * BOUND, -BOUND, BOUND);
  };

  const baseClass =
    "absolute top-24 left-24 w-[46%] h-[64%] bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[44%] min-xl:h-[64%] min-xl:top-20 min-xl:left-56 max-md:top-12 max-md:left-3 max-md:w-[82%] max-md:h-[62%] min-lg:top-[2rem] min-lg:left-[7rem] min-lg:w-[54%] min-lg:h-[62%] flex flex-col";

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
            <Canvas camera={{ position: [0, 3.2, 10], fov: 55 }} dpr={[1, 2]} resize={{ debounce: 0 }}>
              <Suspense fallback={null}>
                <Scene
                  gameRef={gameRef}
                  scoreRef={scoreRef}
                  onScore={handleScore}
                  onGameOver={handleGameOver}
                  onShieldChange={setShieldHUD}
                  phase={phase}
                  ship={ship}
                />
              </Suspense>
            </Canvas>

            {/* HUD en juego */}
            {phase === "playing" && (
              <div className="absolute top-3 left-4 flex items-center gap-3 pointer-events-none">
                <span className="text-white font-mono text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {score}
                </span>
                {shieldHUD > 0 && (
                  <span className="flex items-center gap-1 text-cyan-300 text-sm">
                    <FaShieldAlt /> {shieldHUD}
                  </span>
                )}
              </div>
            )}

            {/* Selector de naves */}
            {phase === "ready" && (
              <div className="absolute inset-0 flex flex-col items-center justify-between py-5 text-white pointer-events-none">
                <h2 className="text-2xl font-bold tracking-wide pointer-events-none">
                  Neon <span className="text-red-500">Dodge</span>
                </h2>

                {/* Controles del selector (la nave gira en el 3D detrás) */}
                <div className="w-full flex items-center justify-between px-4 pointer-events-none">
                  <button
                    onClick={() => changeShip(-1)}
                    className="pointer-events-auto text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 active:scale-90 transition-all"
                    aria-label="Nave anterior"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={() => changeShip(1)}
                    className="pointer-events-auto text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 active:scale-90 transition-all"
                    aria-label="Nave siguiente"
                  >
                    <FaChevronRight />
                  </button>
                </div>

                {/* Ficha de la nave */}
                <div className="pointer-events-auto bg-black/55 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 flex flex-col items-center gap-2 w-[85%] max-w-sm">
                  <span className="text-lg font-bold">{ship.name}</span>
                  <span className="text-[11px] text-amber-300">{ship.perk}</span>
                  <div className="flex flex-col gap-1 my-1">
                    {Object.entries(ship.stats).map(([k, v]) => (
                      <StatBar key={k} label={k} value={v} />
                    ))}
                  </div>
                  <button
                    onClick={start}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl px-6 py-2.5 font-semibold shadow-lg"
                  >
                    <FaPlay className="text-sm" /> Jugar
                  </button>
                  <span className="text-[11px] text-gray-400">Récord: {best}</span>
                </div>
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
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={start}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl px-4 py-2 font-semibold shadow-lg"
                  >
                    <FaRedo className="text-sm" /> Reintentar
                  </button>
                  <button
                    onClick={() => setPhase("ready")}
                    className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl px-4 py-2 font-semibold"
                  >
                    Cambiar nave
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

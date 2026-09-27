import React, { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import {
  FaWindowClose,
  FaMinus,
  FaWindowMaximize,
  FaWindowRestore,
} from "react-icons/fa";
import { getWindowClass } from "../../helpers/windowClass";

function Scene() {
  return (
    <>
      <color attach="background" args={["#0b1020"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, -5]} intensity={0.7} color="#7c3aed" />

      <Stars radius={50} depth={30} count={1200} factor={4} fade speed={1} />

      {/* Figura central flotante y distorsionada */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh>
          <icosahedronGeometry args={[1.4, 6]} />
          <MeshDistortMaterial
            color="#ef4444"
            roughness={0.2}
            metalness={0.6}
            distort={0.35}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Anillo alrededor */}
      <mesh rotation={[0.5, 0.2, 0]}>
        <torusGeometry args={[2.4, 0.05, 16, 140]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        minDistance={3}
        maxDistance={10}
      />
    </>
  );
}

export default function ThreeDViewer({
  onMinimizeChange,
  onMaximizeChange,
  setMaximize,
  isOn,
  containerRef,
  isMobile,
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isOn) {
      setMaximize((prev) => ({
        ...prev,
        model3d: { show: false, minimized: false },
      }));
    }
  }, [isOn]);

  const baseClass =
    "absolute top-24 left-24 w-[50%] h-[55%] bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[45%] min-xl:h-[55%] min-xl:top-40 min-xl:left-64 max-md:top-12 max-md:left-3 max-md:-translate-x-1/2 max-md:w-[80%] max-md:h-[50%] min-lg:top-[2rem] min-lg:left-[10rem] min-lg:w-[50%] min-lg:h-[55%] flex flex-col";

  return (
    <AnimatePresence>
      {onMaximizeChange && (
        <motion.div
          drag={!isMobile && !isMaximized}
          dragConstraints={containerRef}
          dragMomentum={false}
          dragElastic={0.8}
          dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
          className={getWindowClass({ isMobile, isMaximized, base: baseClass })}
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 200 }}
          transition={{ duration: 0.25 }}
        >
          {/* Barra superior */}
          <div className="sticky top-0 w-full bg-gray-800 px-3 py-2 rounded-t-xl flex justify-between items-center cursor-move z-30 flex-shrink-0">
            <span className="text-sm">Visor 3D</span>
            <div className="flex gap-2 items-center">
              <FaMinus
                className="text-yellow-400 cursor-pointer"
                onClick={() => {
                  onMinimizeChange("model3d");
                  setMaximize((prev) => ({
                    ...prev,
                    model3d: { show: false, minimized: true },
                  }));
                }}
              />
              {!isMobile &&
                (isMaximized ? (
                  <FaWindowRestore
                    className="text-green-400 cursor-pointer text-sm"
                    onClick={() => setIsMaximized(false)}
                  />
                ) : (
                  <FaWindowMaximize
                    className="text-green-400 cursor-pointer text-sm"
                    onClick={() => setIsMaximized(true)}
                  />
                ))}
              <FaWindowClose
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setIsMaximized(false);
                  setMaximize((prev) => ({
                    ...prev,
                    model3d: { show: false, minimized: false },
                  }));
                }}
              />
            </div>
          </div>

          {/* Lienzo 3D. stopPropagation evita que arrastrar la escena mueva la ventana:
              la ventana se arrastra por la barra de título, y aquí se orbita el modelo. */}
          <div
            className="relative flex-1 min-h-0 overflow-hidden rounded-b-xl"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              dpr={[1, 2]}
              resize={{ debounce: 0 }}
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>

            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/50 pointer-events-none">
              Arrastra para rotar · rueda para zoom
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

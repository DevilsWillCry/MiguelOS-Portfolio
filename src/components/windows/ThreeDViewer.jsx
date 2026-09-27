import React, { Suspense, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import {
  FaWindowClose,
  FaMinus,
  FaWindowMaximize,
  FaWindowRestore,
} from "react-icons/fa";
import { getWindowClass } from "../../helpers/windowClass";
import useWindowFrame from "../../hooks/useWindowFrame";

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
  const { x, y, isMaximized, maximize, restore } = useWindowFrame();
  const dragControls = useDragControls();
  const canDrag = !isMobile && !isMaximized;

  useEffect(() => {
    if (!isOn) {
      setMaximize((prev) => ({
        ...prev,
        model3d: { show: false, minimized: false },
      }));
    }
  }, [isOn]);

  const baseClass =
    "absolute top-24 left-24 w-[50%] h-[55%] bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[45%] min-xl:h-[55%] min-xl:top-40 min-xl:left-64 max-md:top-12 max-md:left-3 max-md:w-[80%] max-md:h-[50%] min-lg:top-[2rem] min-lg:left-[10rem] min-lg:w-[50%] min-lg:h-[55%]";

  return (
    <AnimatePresence>
      {onMaximizeChange && (
        <motion.div
          drag={canDrag}
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={containerRef}
          dragMomentum={false}
          dragElastic={0.8}
          dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
          style={{ x, y }}
          className={getWindowClass({ isMobile, isMaximized, base: baseClass })}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
        >
          {/* Barra superior: único punto de arrastre (el lienzo queda libre para orbitar) */}
          <div
            className="absolute top-0 left-0 right-0 h-10 bg-gray-800 px-3 rounded-t-xl flex justify-between items-center cursor-move z-30"
            onPointerDown={(e) => {
              if (canDrag) dragControls.start(e);
            }}
          >
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
                    onClick={restore}
                  />
                ) : (
                  <FaWindowMaximize
                    className="text-green-400 cursor-pointer text-sm"
                    onClick={maximize}
                  />
                ))}
              <FaWindowClose
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  restore();
                  setMaximize((prev) => ({
                    ...prev,
                    model3d: { show: false, minimized: false },
                  }));
                }}
              />
            </div>
          </div>

          {/* Lienzo 3D con límites absolutos (top-10 = debajo de la barra) para
              tener siempre un tamaño en píxeles definido. Al arrastrarse la
              ventana solo desde la barra, el canvas queda libre para OrbitControls. */}
          <div className="absolute top-10 left-0 right-0 bottom-0 overflow-hidden rounded-b-xl">
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              dpr={[1, 2]}
              resize={{ debounce: 0 }}
              style={{ position: "absolute", inset: 0, display: "block" }}
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

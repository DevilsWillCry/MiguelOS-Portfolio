import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWindowClose, FaMinus, FaWindowMaximize, FaWindowRestore } from "react-icons/fa";
import { getWindowClass } from "../../helpers/windowClass";
import useWindowFrame from "../../hooks/useWindowFrame";

const TINTS = [
  { id: "original", label: "Original", value: null, css: "#e5e7eb" },
  { id: "red", label: "Rojo", value: "#ff6b6b", css: "#ff6b6b" },
  { id: "blue", label: "Azul", value: "#6ba8ff", css: "#6ba8ff" },
  { id: "green", label: "Verde", value: "#6bff9e", css: "#6bff9e" },
  { id: "purple", label: "Morado", value: "#c06bff", css: "#c06bff" },
  { id: "amber", label: "Ámbar", value: "#ffd86b", css: "#ffd86b" },
  { id: "cyan", label: "Cian", value: "#67e8f9", css: "#67e8f9" },
  { id: "pink", label: "Rosa", value: "#ff8fce", css: "#ff8fce" },
];

export default function MiguSettings({
  onMinimizeChange,
  onMaximizeChange,
  setMaximize,
  containerRef,
  isMobile,
  miguVisible,
  setMiguVisible,
  miguTint,
  setMiguTint,
}) {
  const { x, y, isMaximized, maximize, restore } = useWindowFrame();

  const baseClass =
    "absolute bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[38%] min-xl:h-[52%] min-xl:top-40 min-xl:left-56 max-md:top-12 max-md:left-3 max-md:w-[80%] max-md:h-[55%] min-lg:top-[2rem] min-lg:left-[9rem] min-lg:w-[48%] min-lg:h-[55%] flex flex-col";

  return (
    <AnimatePresence>
      {onMaximizeChange && (
        <motion.div
          drag={!isMobile && !isMaximized}
          dragConstraints={containerRef}
          dragMomentum={false}
          dragElastic={0.8}
          style={{ x, y }}
          className={getWindowClass({ isMobile, isMaximized, base: baseClass })}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
        >
          {/* Barra superior */}
          <div className="sticky top-0 w-full bg-gray-800 px-3 py-2 rounded-t-xl flex justify-between items-center cursor-move z-30 flex-shrink-0">
            <span className="text-sm">Personalizar a Migu</span>
            <div className="flex gap-2 items-center">
              <FaMinus
                className="text-yellow-400 cursor-pointer"
                onClick={() => {
                  onMinimizeChange("migu");
                  setMaximize((prev) => ({
                    ...prev,
                    migu: { show: false, minimized: true },
                  }));
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
                  setMaximize((prev) => ({
                    ...prev,
                    migu: { show: false, minimized: false },
                  }));
                }}
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col gap-5 text-white">
            {/* Visibilidad */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-200">Visibilidad</h3>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm">Mostrar a Migu</span>
                  <span className="text-[11px] text-gray-400">
                    Oculta o muestra al asistente en el escritorio
                  </span>
                </div>
                <button
                  onClick={() => setMiguVisible((v) => !v)}
                  role="switch"
                  aria-checked={miguVisible}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    miguVisible ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      miguVisible ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Color */}
            <div className={miguVisible ? "" : "opacity-50 pointer-events-none"}>
              <h3 className="text-sm font-semibold mb-2 text-gray-200">Color</h3>
              <div className="grid grid-cols-4 gap-3">
                {TINTS.map((t) => {
                  const selected = (miguTint ?? null) === t.value;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setMiguTint(t.value)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <span
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selected
                            ? "border-white scale-110 ring-2 ring-blue-500"
                            : "border-white/20 group-hover:border-white/50"
                        }`}
                        style={{ backgroundColor: t.css }}
                      />
                      <span className="text-[10px] text-gray-300">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                El color tiñe la textura original de Migu.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

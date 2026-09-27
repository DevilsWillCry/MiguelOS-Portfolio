import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaCircle, FaSquare, FaWindowClose } from "react-icons/fa";

// Barra de navegación inferior estilo Android para el modo móvil/tablet.
// Recibe el estado de las apps y los handlers desde DesktopPortfolio.
export default function MobileNavBar({
  apps,
  windows,
  showRecents,
  onBack,
  onHome,
  onToggleRecents,
  onSelectApp,
  onCloseApp,
}) {
  const openApps = apps.filter(
    (app) => windows[app.id]?.show || windows[app.id]?.minimized
  );

  return (
    <>
      {/* Overlay de apps recientes */}
      <AnimatePresence>
        {showRecents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bottom-14 z-[60] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6"
          >
            <span className="text-white/80 text-sm font-semibold">
              Apps recientes
            </span>
            {openApps.length === 0 ? (
              <span className="text-white/50 text-xs">No hay apps abiertas</span>
            ) : (
              <div className="flex flex-row flex-wrap gap-4 justify-center w-full">
                {openApps.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative flex flex-col items-center gap-2 bg-gray-800/90 rounded-xl p-4 w-32 border border-gray-700/50"
                    onClick={() => onSelectApp(app.id)}
                  >
                    <FaWindowClose
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseApp(app.id);
                      }}
                    />
                    <img
                      src={app.icon}
                      alt={app.label}
                      className="w-12 h-12 object-contain pointer-events-none"
                    />
                    <span className="text-xs text-white text-center break-words w-full">
                      {app.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de navegación */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/90 backdrop-blur-xl flex items-center justify-around px-8 z-[70] border-t border-gray-800">
        <button
          onClick={onBack}
          aria-label="Atrás"
          className="text-white/90 p-3 rounded-full active:bg-white/10 transition-all"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onHome}
          aria-label="Inicio"
          className="text-white/90 p-3 rounded-full active:bg-white/10 transition-all"
        >
          <FaCircle className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleRecents}
          aria-label="Apps recientes"
          className={`text-white/90 p-3 rounded-full transition-all ${
            showRecents ? "bg-white/20" : "active:bg-white/10"
          }`}
        >
          <FaSquare className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}

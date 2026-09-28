import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaPowerOff, FaRegUserCircle } from "react-icons/fa";

export default function HomeDetail({
  isOn,
  isMaximizedHome,
  items,
  onHomeMaximizedIcon,
  icons,
  labels,
  onShutdown,
}) {
  const [query, setQuery] = useState("");

  const apps = Object.keys(items).map((key) => ({
    key,
    icon: icons?.[key],
    label: labels?.[key] ?? key,
  }));

  const filtered = apps.filter((app) =>
    app.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <AnimatePresence>
      {isMaximizedHome && isOn && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[26rem] max-w-[92vw] rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-gray-900 backdrop-blur-2xl shadow-2xl shadow-black/50 text-white p-4 z-[60]"
        >
          {/* Cabecera de perfil */}
          <div className="flex items-center gap-3 px-1 pb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-lg shadow-lg shadow-red-900/40">
              M
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold">Miguel Ángel</span>
              <span className="text-[11px] text-gray-400">
                Portafolio · Miguel<span className="text-red-500 font-bold">OS</span>
              </span>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aplicaciones..."
              className="w-full bg-white/5 focus:bg-white/10 border border-white/10 focus:border-red-500/50 rounded-xl pl-9 pr-3 py-2 text-sm outline-none transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Sección de apps */}
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-semibold text-gray-300">
              Aplicaciones
            </span>
            <span className="text-[11px] text-gray-500">{filtered.length}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 min-h-[6rem]">
            {filtered.length === 0 ? (
              <div className="col-span-4 flex flex-col items-center justify-center py-8 text-gray-500 text-xs gap-2">
                <FaSearch className="text-lg opacity-50" />
                Sin resultados
              </div>
            ) : (
              filtered.map((app) => (
                <button
                  key={app.key}
                  onClick={() => onHomeMaximizedIcon(app.key)}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700/70 to-gray-800/70 border border-white/10 group-hover:border-white/20 flex items-center justify-center shadow-md transition-all group-hover:shadow-lg">
                    <img
                      src={app.icon}
                      alt={`${app.key} icon`}
                      className="w-7 h-7 object-contain group-hover:brightness-110 transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-gray-200 text-center leading-tight w-full truncate px-0.5">
                    {app.label}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Pie */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 px-1">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaRegUserCircle className="text-sm" />
              <span>Visitante</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <FaPowerOff className="text-red-500/70" />
              <span>MiguelOS v1</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

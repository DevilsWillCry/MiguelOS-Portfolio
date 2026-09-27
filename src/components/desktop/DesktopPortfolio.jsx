import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

import AboutMeDesktop from "../windows/AboutMeDesktop";
import ProjectsDesktop from "../windows/ProjectsDesktop";
import ThemeBackgroundChanger from "../windows/ThemeBackgroundChanger";
import ThreeDViewer from "../windows/ThreeDViewer";

import jsonIcon from "../../assets/json-icon.svg";
import ProjectIcon from "../../assets/project_icon.png";
import ThemeChangerIcon from "../../assets/theme-changer-icon.svg";
import devIcon from "../../assets/dev-icon.svg";
import windowsIcon from "../../assets/home_icon.min.svg";
import mainBackground from "../../assets/main-background.jpg";
import HomeDetail from "../taskbar/HomeDetail";
import MobileNavBar from "../taskbar/MobileNavBar";

const desktopIcons = [
  { id: "about",    icon: jsonIcon,         label: "Sobre_mí.json" },
  { id: "projects", icon: ProjectIcon,      label: "Proyectos"     },
  { id: "theme",    icon: ThemeChangerIcon, label: "Cambiar temas" },
  { id: "model3d",  icon: devIcon,          label: "Visor 3D"      },
];

// Mapas id → icono / etiqueta, para la taskbar y el menú de inicio.
const iconById = Object.fromEntries(desktopIcons.map((a) => [a.id, a.icon]));
const labelById = Object.fromEntries(desktopIcons.map((a) => [a.id, a.label]));

// Dimensiones de cada celda del grid (deben coincidir con w-28 del icono)
const ICON_W    = 112; // w-28 = 7rem = 112px
const ICON_H    = 104; // alto aproximado del bloque icono+texto
const GRID_TOP  = 56;  // px desde el top (bajo el título "MiguelOS V1")
const GRID_LEFT = 4;   // px desde el left

const getPixelPos = (col, row) => ({
  x: GRID_LEFT + col * ICON_W,
  y: GRID_TOP  + row * ICON_H,
});

const SNAP = { type: "spring", stiffness: 600, damping: 40 };

// Icono individual del escritorio. La posición se maneja SOLO con motion values
// (transform), que es la misma fuente que usa `drag`, evitando conflictos.
function DesktopIcon({ item, index, cell, resolveCell, onOpen, containerRef, isMobile }) {
  const initial = getPixelPos(cell.col, cell.row);
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const dragged = useRef(false);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
      dragged.current = true;
    }

    const col = Math.max(0, Math.round((x.get() - GRID_LEFT) / ICON_W));
    const row = Math.max(0, Math.round((y.get() - GRID_TOP) / ICON_H));

    // El padre decide la celda final (la pedida si está libre, o la actual si no)
    const resolved = resolveCell(index, col, row);
    const target = getPixelPos(resolved.col, resolved.row);
    animate(x, target.x, SNAP);
    animate(y, target.y, SNAP);
  };

  // Abre la app, salvo que la interacción haya sido un arrastre real.
  const handleOpen = () => {
    if (dragged.current) return;
    onOpen(item.id);
  };

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0.15}
      style={{ position: "absolute", top: 0, left: 0, x, y }}
      onPointerDown={() => {
        dragged.current = false;
      }}
      onDragEnd={handleDragEnd}
      onClick={isMobile ? handleOpen : undefined}
      onDoubleClick={isMobile ? undefined : handleOpen}
      className="flex flex-col items-center cursor-pointer hover:bg-white/10 p-3 rounded-xl w-28 select-none z-10"
    >
      <img
        src={item.icon}
        alt={item.label}
        className="w-10 h-10 object-cover pointer-events-none"
      />
      <span className="text-xs mt-1 break-words text-center w-full">
        {item.label}
      </span>
    </motion.div>
  );
}

const defaultTheme = {
  id: "default",
  name: "MiguelOS Default",
  gradient: "from-gray-900 to-gray-800",
  color: "#0f172a",
  type: "image",
  imageUrl: mainBackground,
};

export default function DesktopPortfolio({ onMinimizeChange, isOn, isOff, isMobile }) {
  const screenRef = useRef(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [isMaximizedHome, setIsMaximizedHome] = useState(false);
  const [showRecents, setShowRecents] = useState(false);

  
  const handleHomeMaximized = () => {
    setIsMaximizedHome(!isMaximizedHome);
  };

  const [windows, setWindows] = useState({
    about: { show: false, minimized: false },
    projects: { show: false, minimized: false },
    theme: { show: false, minimized: false },
    model3d: { show: false, minimized: false },
  });

  // Posiciones en el grid: cada icono ocupa una celda { col, row }
  const [cells, setCells] = useState(
    () => desktopIcons.map((_, i) => ({ col: 0, row: i }))
  );
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  // Decide la celda final de un icono al soltarlo:
  // la pedida si está libre, o la actual si ya está ocupada (snap-back).
  const resolveCell = (index, col, row) => {
    const current = cellsRef.current;
    const occupied = current.some(
      (c, i) => i !== index && c.col === col && c.row === row
    );
    if (occupied) return current[index];

    setCells((prev) =>
      prev.map((c, i) => (i === index ? { col, row } : c))
    );
    return { col, row };
  };

  const handleOpenWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { show: true, minimized: true },
    }));
  };

  const handleWindowsMinimized = (nameObject) => {
    if (typeof nameObject != "string") return;

    setWindows({
      ...windows,
      [nameObject]: {
        ...windows[nameObject],
        minimized: !windows[nameObject].minimized,
      },
    });
  };

  const handleWindowsMaximized = (nameObject) => {
    if (typeof nameObject != "string") return;
    // Al clickear la barra: siempre abre la ventana sin minimizar
    setWindows({
      ...windows,
      [nameObject]: {
        show: true,
        minimized: true,
      },
    });
  };

  // --- Handlers de la barra de navegación móvil (estilo Android) ---

  // Atrás: oculta la app en primer plano y la deja en recientes → escritorio.
  const handleMobileBack = () => {
    setWindows((prev) => {
      const frontKey = Object.keys(prev).find((k) => prev[k].show);
      if (!frontKey) return prev;
      return { ...prev, [frontKey]: { show: false, minimized: true } };
    });
  };

  // Inicio: oculta todas las apps (siguen en recientes) → escritorio con iconos.
  const handleMobileHome = () => {
    setWindows((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        next[k] = { show: false, minimized: prev[k].show || prev[k].minimized };
      });
      return next;
    });
    setShowRecents(false);
  };

  // Trae una app al frente desde el overlay de recientes.
  const handleMobileSelectApp = (id) => {
    handleOpenWindow(id);
    setShowRecents(false);
  };

  // Cierra una app por completo desde recientes.
  const handleMobileCloseApp = (id) => {
    setWindows((prev) => ({ ...prev, [id]: { show: false, minimized: false } }));
  };


  useEffect(() => {
    Object.keys(windows).forEach((key) => {
      if (windows[key].show) {
        setIsMaximizedHome(false);
      }
    });
  }, [windows]);

  return (
    <div
      ref={screenRef}
      className={`text-white font-mono overflow-hidden w-full h-full z-0 ${
        isOn ? "opacity-100" : "opacity-0 duration-1000 pointer-events-none"
      } transition-all ${theme.type === "image" ? "bg-black bg-cover bg-center bg-no-repeat bg-fixed" : `bg-gradient-to-r ${theme.gradient}`}`}
      style={
        theme.type === "image"
          ? { backgroundImage: `url(${theme.imageUrl})` }
          : {}
      }
    >
      {/* Escritorio */}
      <div className="absolute top-4 left-4 text-xl font-bold">
        Miguel<span className="text-red-800 font-bold">OS</span> V1
      </div>

      {/* Iconos del escritorio — cada uno se posiciona en su celda del grid */}
      {desktopIcons.map((item, index) => (
        <DesktopIcon
          key={item.id}
          item={item}
          index={index}
          cell={cells[index]}
          resolveCell={resolveCell}
          onOpen={handleOpenWindow}
          containerRef={screenRef}
          isMobile={isMobile}
        />
      ))}

      {/* Acerca de mi */}
      <AboutMeDesktop
        onMinimizeChange={handleWindowsMinimized}
        onMaximizeChange={windows.about.show}
        setMaximize={setWindows}
        isOn={isOn}
        containerRef={screenRef}
        isMobile={isMobile}
      />

      {/* Projectos en el escritorio */}
      <ProjectsDesktop
        onMinimizeChange={handleWindowsMinimized}
        onMaximizeChange={windows.projects.show}
        setMaximize={setWindows}
        isOn={isOn}
        containerRef={screenRef}
        isMobile={isMobile}
      />

      {/* Cambiador de tema en el escritorio */}
      <ThemeBackgroundChanger
        onMinimizeChange={handleWindowsMinimized}
        onMaximizeChange={windows.theme.show}
        setMaximize={setWindows}
        isOn={isOn}
        containerRef={screenRef}
        theme={theme}
        setTheme={setTheme}
        isMobile={isMobile}
      />

      {/* Visor 3D en el escritorio */}
      <ThreeDViewer
        onMinimizeChange={handleWindowsMinimized}
        onMaximizeChange={windows.model3d.show}
        setMaximize={setWindows}
        isOn={isOn}
        containerRef={screenRef}
        isMobile={isMobile}
      />

      {/* Barra de tareas - Windows 11 Modern Style (solo escritorio) */}
      {!isMobile && (
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-b from-gray-950/90 to-gray-900/95 flex items-center justify-center px-0 max-md:hidden border-t border-gray-700/40 backdrop-blur-xl shadow-2xl z-[50]">
        {/* Contenedor central */}
        <div className="flex items-center gap-1 bg-gray-900/50 px-3 py-1 rounded-2xl border border-gray-700/30 shadow-lg">
          {/* Windows Start Button */}
          <button
            className={`group relative bg-gradient-to-br ${theme.gradient} contrast-125 hover:contrast-100 text-white p-2.5 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/40 border border-gray-700/40 hover:border-gray-600/60 overflow-hidden`}
            onClick={() => handleHomeMaximized()}
          >
            <img
              src={windowsIcon}
              alt="windows icon"
              className="w-5 h-5 group-hover:brightness-110 transition-all"
            />
            <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10 transition-all"></div>

          </button>
            <HomeDetail isOn={isOn} isMaximizedHome={isMaximizedHome} items={windows} onHomeMaximizedIcon={handleWindowsMaximized} icons={iconById} labels={labelById} />

          {/* Divisor visual */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-600/40 to-transparent mx-1"></div>

          {/* Botones de ventanas minimizadas */}
          {Object.keys(windows).map((key) => {
            return (
              windows[key].minimized && (
                <button
                  key={key}
                  onClick={() => handleWindowsMaximized(key)}
                  className="group relative flex items-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl border border-gray-700/40 hover:border-gray-600/60 overflow-hidden"
                >
                  {/* Fondo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Contenido */}
                  <div className="relative z-10">
                    <img
                      src={iconById[key]}
                      alt={`${key} icon`}
                      className="w-4 h-4 group-hover:brightness-110 transition-all"
                    />
                  </div>

                  {/* Etiqueta */}
                  <span className="relative z-10 capitalize font-medium text-gray-100 group-hover:text-white transition-colors">
                    {labelById[key] ?? key}
                  </span>
                </button>
              )
            );
          })}
        </div>
      </div>
      )}

      {/* Barra de navegación inferior - Modo móvil/tablet (estilo Android) */}
      {isMobile && (
        <MobileNavBar
          apps={desktopIcons}
          windows={windows}
          showRecents={showRecents}
          onBack={handleMobileBack}
          onHome={handleMobileHome}
          onToggleRecents={() => setShowRecents((v) => !v)}
          onSelectApp={handleMobileSelectApp}
          onCloseApp={handleMobileCloseApp}
        />
      )}
    </div>
  );
}

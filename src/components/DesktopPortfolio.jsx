import { useEffect, useRef, useState } from "react";

import AboutMeDesktop from "./AboutMeDesktop";
import ProjectsDesktop from "./ProjectsDesktop";
import ThemeBackgroundChanger from "./ThemeBackgroundChanger";

import jsonIcon from "../assets/json-icon.svg";
import ProjectIcon from "../assets/project_icon.png";
import ThemeChangerIcon from "../assets/theme-changer-icon.svg";
import windowsIcon from "../assets/home_icon.min.svg";
import HomeDetail from "./HomeDetail";

export default function DesktopPortfolio({ onMinimizeChange, isOn, isOff }) {
  const screenRef = useRef(null);
  const [theme, setTheme] = useState("bg-black");
  const [isMaximizedHome, setIsMaximizedHome] = useState(false);

  
  const handleHomeMaximized = () => {
    setIsMaximizedHome(!isMaximizedHome);
  };

  const [windows, setWindows] = useState({
    about: { show: false, minimized: false },
    projects: { show: false, minimized: false },
    theme: { show: false, minimized: false },
  });

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
      } transition-all ${theme.type === "image" ? "bg-black bg-contain bg-center bg-no-repeat bg-fixed" : `bg-gradient-to-r ${theme.gradient}`}`}
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

      {/* Acerca de mi */}
      <AboutMeDesktop
        onMinimizeChange={handleWindowsMinimized}
        onMaximizeChange={windows.about.show}
        setMaximize={setWindows}
        isOn={isOn}
        containerRef={screenRef}
      />

      {/* Projectos en el escritorio */}
      <ProjectsDesktop
        onMinimizeChange={handleWindowsMinimized}
        onMaximizeChange={windows.projects.show}
        setMaximize={setWindows}
        isOn={isOn}
        containerRef={screenRef}
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
      />

      {/* Barra de tareas - Windows 11 Modern Style */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-b from-gray-950/90 to-gray-900/95 flex items-center justify-center px-0 max-md:hidden border-t border-gray-700/40 backdrop-blur-xl shadow-2xl z-[50]">
        {/* Contenedor central */}
        <div className="flex items-center gap-1 bg-gray-900/50 px-3 py-1 rounded-2xl border border-gray-700/30 shadow-lg">
          {/* Windows Start Button */}
          <button
            className={`group relative bg-gradient-to-br ${theme} contrast-125 hover:contrast-100 text-white p-2.5 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/40 border border-gray-700/40 hover:border-gray-600/60 overflow-hidden`}
            onClick={() => handleHomeMaximized()}
          >
            <img
              src={windowsIcon}
              alt="windows icon"
              className="w-5 h-5 group-hover:brightness-110 transition-all"
            />
            <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10 transition-all"></div>

          </button>
            <HomeDetail isOn={isOn} isMaximizedHome={isMaximizedHome} items={windows} onHomeMaximizedIcon={handleWindowsMaximized} />

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
                    {key === "about" ? (
                      <img
                        src={jsonIcon}
                        alt="json icon"
                        className="w-4 h-4 group-hover:brightness-110 transition-all"
                      />
                    ) : key === "projects" ? (
                      <img
                        src={ProjectIcon}
                        alt="folder icon"
                        className="w-4 h-4 group-hover:brightness-110 transition-all"
                      />
                    ) : (
                      <img
                        src={ThemeChangerIcon}
                        alt="folder icon"
                        className="w-4 h-4 group-hover:brightness-110 transition-all"
                      />
                    )}
                  </div>

                  {/* Etiqueta */}
                  <span className="relative z-10 capitalize font-medium text-gray-100 group-hover:text-white transition-colors">
                    {key}
                  </span>
                </button>
              )
            );
          })}
        </div>
      </div>
    </div>
  );
}

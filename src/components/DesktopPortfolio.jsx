import { useRef, useState } from "react";

import AboutMeDesktop from "./AboutMeDesktop";
import ProjectsDesktop from "./ProjectsDesktop";

export default function DesktopPortfolio({ onMinimizeChange, isOn, isOff }) {
  const screenRef = useRef(null);

  const [windows, setWindows] = useState({
    about: { show: false, minimized: false },
    projects: { show: false, minimized: false },
  });
  
  const handleWindowsMinimized = (nameObject) => {
    console.log(nameObject);
    if (typeof nameObject != "string") return;

    setWindows({
      ...windows,
      [nameObject]: { ...windows[nameObject], minimized: !windows[nameObject].minimized},
    });
  };

  const handleWindowsMaximized = (nameObject) => {
    console.log(nameObject);
    if (typeof nameObject != "string") return;
    setWindows({
      ...windows,
      [nameObject]: { ...windows[nameObject], show: !windows[nameObject].show },
    });
  };

  console.log(windows);
  
  return (
    <div
      ref={screenRef}
      className={`bg-black text-white font-mono overflow-hidden w-full h-full  z-0 ${
        isOn ? "opacity-100" : "opacity-0 duration-1000 pointer-events-none"
      } transition-all`}
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

      {/* Barra de tareas */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-r from-gray-800/80 to-gray-900/80 flex items-center px-2 max-md:hidden">
        {
          Object.keys(windows).map((key) => {
            return windows[key].minimized && (
              <button
                key={key}
                onClick={() => handleWindowsMaximized(key)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded mr-2"
              >
                {key}
              </button>
            );
          })
        }
      </div>
    </div>
  );
}

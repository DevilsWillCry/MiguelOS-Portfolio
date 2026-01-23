import React from "react";

import jsonIcon from "../assets/json-icon.svg";
import ProjectIcon from "../assets/project_icon.png";
import ThemeChangerIcon from "../assets/theme-changer-icon.svg";
import windowsIcon from "../assets/home_icon.min.svg";

export default function HomeDetail({ isOn, isMaximizedHome, items, onHomeMaximizedIcon}) {
  return (
    <>
      {isMaximizedHome && isOn && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[106%] w-[25rem] h-[30rem] bg-gradient-to-b bg-gray-900  text-white rounded-lg shadow-lg flex justify-center items-start p-3 py-10 text-center flex-row">
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2  text-xl font-bold flex items-center gap-2 text-nowrap py-1">
            Selecciona una <span className="text-red-800 font-bold">app</span>
          </div>
          {/* Contenido de la ventana maximizada */}
          {Object.keys(items).map((key, index) => {
            return (
              items[key] && (
                <button
                  key={key}
                  onClick={() => onHomeMaximizedIcon(key)}
                  className="group relative flex-col flex items-center w-[5rem] h-[5rem] bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-xs px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl border border-gray-700/40 hover:border-gray-600/60 overflow-hidden justify-center m-3 "
                >
                  <div className="relative z-10">
                    {key === "about" ? (
                      <img
                        src={jsonIcon}
                        alt="json icon"
                        className="w-[80%] h-[80%] group-hover:brightness-110 transition-all pl-2"
                      />
                    ) : key === "projects" ? (
                      <img
                        src={ProjectIcon}
                        alt="folder icon"
                        className="w-[80%] h-[80%] group-hover:brightness-110 transition-all pl-2"
                      />
                    ) : (
                      <img
                        src={ThemeChangerIcon}
                        alt="folder icon"
                        className="w-[80%] h-[80%] group-hover:brightness-110 transition-all  pl-2"
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
      )}
    </>
  );
}

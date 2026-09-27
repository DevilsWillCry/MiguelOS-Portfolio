import React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowDownUp from "../ui/ArrowDownUp";
import { FaWindowClose, FaMinus, FaWindowMaximize, FaWindowRestore } from "react-icons/fa";
import addImageIcon from "../../assets/add-image-icon.min.svg";
import { getWindowClass } from "../../helpers/windowClass";


export default function ThemeBackgroundChanger({
  onMinimizeChange,
  onMaximizeChange,
  setMaximize,
  isOn,
  containerRef,
  theme,
  setTheme,
  isMobile,
}) {
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [customImage, setCustomImage] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const baseClass =
    "absolute bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[50%] min-xl:h-[60%] min-xl:top-52 min-xl:left-80 max-md:top-12 max-md:left-3 max-md:-translate-x-1/2 max-md:w-[80%] max-md:h-[50%] min-lg:top-[1rem] min-lg:left-[7rem] min-lg:w-[50%] min-lg:h-[60%] flex flex-col";

  // Manejar carga de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();                
    reader.onload = (event) => {
      const imageUrl = event.target?.result;
      const customTheme = {
        id: "custom",
        name: "Imagen personalizada",
        gradient: "",
        color: "#000000",
        type: "image",
        imageUrl: imageUrl,
      };
      setTheme(customTheme);
      setCustomImage(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  // Disparar input file cuando se selecciona el tema de imagen
  const handleImageThemeClick = () => {
    fileInputRef.current?.click();
  };
  
  // Temas disponibles con colores y nombres
  const themes = [
    { id: 1, name: "Add a image", gradient: "from-black to-black-800", color: "#3f0a2a", type: "image" },
    { id: 2, name: "Midnight Dark", gradient: "from-gray-900 to-gray-800", color: "#0f172a", type: "solid-color" },
    { id: 3, name: "Ocean Blue", gradient: "from-blue-900 to-blue-300", color: "#001f3f", type: "solid-color" },
    { id: 4, name: "Forest Green", gradient: "from-green-900 to-green-800", color: "#1a3a1a", type: "solid-color" },
    { id: 5, name: "Purple Night", gradient: "from-purple-900 to-purple-300", color: "#2d1b4e", type: "solid-color" },
    { id: 6, name: "Crimson Red", gradient: "from-red-900 to-red-500", color: "#3f1a1a", type: "solid-color" },
    { id: 7, name: "Amber Gold", gradient: "from-amber-600 to-amber-900", color: "#3f2a0a", type: "solid-color" },
    { id: 8, name: "Lime Green", gradient: "from-lime-600 to-lime-900", color: "#1f3a0a", type: "solid-color" },
    { id: 9, name: "Teal Blue", gradient: "from-teal-600 to-teal-900", color: "#0f3a3f", type: "solid-color" },
  ];

  return (
    <>
      {/* Ventana Cambiador de Tema */}
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
            transition={{ duration: 0.5 }}
          >

            {/* Barra superior */}
            <div className="sticky top-0 w-full bg-gray-800 px-3 py-2 rounded-t-xl flex justify-between items-center cursor-move z-30 flex-shrink-0">
              <span className="text-sm">Cambiar temas</span>
              <div className="flex gap-2 items-center">
                <FaMinus
                  className="text-yellow-400 cursor-pointer"
                  onClick={() => {
                    onMinimizeChange("theme");
                    setMaximize((prev) => ({
                      ...prev,
                      theme: {
                        show: false,
                        minimized: true,
                      },
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
                      theme: {
                        show: false,
                        minimized: false,
                      },
                    }));
                  }}
                />
              </div>
            </div>

            {/* Contenedor scrolleable con temas */}
            <div className="relative flex-1 overflow-hidden pb-10 rounded-xl">
              {/* Grid de temas */}
              <div ref={scrollContainerRef} className="relative overflow-y-auto overflow-x-hidden h-full scrollbar-hide p-4">
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((theme, index) => (
                    <motion.div
                      key={theme.id}
                      onClick={() => setSelectedTheme(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedTheme === index ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/50" : "ring-1 ring-gray-700/50"
                      }`}
                    >
                      {/* Preview del tema */}
                      <div
                        className={`h-32 bg-gradient-to-br ${theme.gradient} flex items-center justify-center relative overflow-hidden`}
                      >
                        {/* Efecto hover */}
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                        
                        {/* Contenido */}
                        <div className="relative z-10 text-center">
                          <div className="text-3xl font-bold text-white/80 mb-2">●</div>
                          {
                            theme.type === "solid-color" ?<div className={`w-12 h-12 rounded-full mx-auto bg-gradient-to-br ${theme.gradient} border-2 border-white/30`}></div> : <img src={addImageIcon} alt="Add Image" className="w-12 h-12 mx-auto border-black/30 " />
                          
                          }
                        </div>
                      </div>

                      {/* Nombre del tema */}
                      <div className={`p-3 text-center transition-all duration-300 ${
                        selectedTheme === index 
                          ? "bg-blue-600/20 border-t border-blue-500/30" 
                          : "bg-gray-800/50 border-t border-gray-700/30 group-hover:bg-gray-700/50"
                      }`}>
                        <p className="text-xs font-semibold text-white/90 truncate">{theme.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Click para aplicar</p>
                      </div>

                      {/* Checkmark si está seleccionado */}
                      {selectedTheme === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-20 "
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Input file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Botón de aplicar tema (sticky) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-t from-gray-900 to-transparent flex gap-2 pb-2 w-[97%]">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (themes[selectedTheme].type === "image") {
                      handleImageThemeClick();
                    } else {
                      const selected = themes[selectedTheme];
                      setTheme(selected);
                    }
                  }}
                  className={`z-30 flex-1 items-center justify-center bg-gradient-to-r ${
                       themes[selectedTheme].gradient
                  } hover:contrast-200 text-white font-semibold py-2 px-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  {themes[selectedTheme].type === "image" ? "Subir Imagen" : "Aplicar tema"}
                </motion.button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

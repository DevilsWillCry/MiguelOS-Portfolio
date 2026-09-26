import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWindowClose, FaMinus, FaUserCircle } from "react-icons/fa";
import jsonIcon from "../../assets/json-icon.svg";
import JsonCodeBlock from "../code/JsonCodeBlock";
import ArrowDownUp from "../ui/ArrowDownUp";

export default function AboutMeDesktop({
  onMinimizeChange,
  onMaximizeChange,
  setMaximize,
  isOn,
  containerRef,
}) {
  const loadMoreRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isObserved, setIsObserved] = useState(false);

  useEffect(() => {
    if (!isOn) {
      setMaximize((prev) => ({
        ...prev,
        about: {
          show: false,
          minimized: false,
        },
      }));
    }
  }, [isOn]);

  useEffect(() => {
    let observer;

    const tryObserve = () => {
      if (!loadMoreRef.current) {
        requestAnimationFrame(tryObserve); // vuelve a intentarlo en el siguiente frame
        return;
      }

      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsObserved(true);
        } else {
          setIsObserved(false);
        }
      });

      observer.observe(loadMoreRef.current);
    };

    tryObserve(); // inicia la observación

    return () => {
      if (observer && loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef, onMaximizeChange]);

  return (
    <div>
      {/* Icono en el escritorio */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        dragElastic={0.8}
        dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
        className="absolute top-20 left-10 flex flex-col items-center cursor-pointer hover:bg-white/10 p-3 rounded-xl w-28 h-auto"
        onClick={() => {
          setMaximize((prev) => ({
            ...prev,
            about: {
              show: true,
              minimized: true,
            },
          }));
        }}
      >
        <img
          src={jsonIcon}
          alt="user icon"
          className="w-10 h-10 object-cover pointer-events-none"
        />
        <span className="text-xs mt-1 break-all">Sobre_mí.json</span>
      </motion.div>

      {/* Ventana Sobre Mí */}
      <AnimatePresence>
        {onMaximizeChange && (
          <motion.div
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            dragElastic={0.8}
            dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
            className="absolute bg-gray-900 rounded-xl shadow-xl z-10 min-xl:w-[50%] min-xl:h-[60%] min-xl:top-32 min-xl:left-40 max-md:top-12 max-md:left-3 max-md:-translate-x-1/2 max-md:w-[80%] max-md:h-[50%] min-lg:top-[1rem] min-lg:left-[7rem] min-lg:w-[50%] min-lg:h-[60%] flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 200 }}
            transition={{ duration: 0.5 }}
          >
            {/* Barra superior */}
            <div className="sticky top-0 w-full bg-gray-800 px-3 py-2 rounded-t-xl flex justify-between items-center cursor-move z-30 flex-shrink-0">
              <span className="text-sm">Sobre_mí.json</span>
              <div className="flex gap-2">
                <FaMinus
                  className="text-yellow-400 cursor-pointer"
                  onClick={() => {
                    onMinimizeChange("about");
                    setMaximize((prev) => ({
                      ...prev,
                      about: {
                        show: false,
                        minimized: true,
                      },
                    }));
                  }}
                />
                <FaWindowClose
                  className="text-red-500 cursor-pointer"
                  onClick={() => {
                    setMaximize((prev) => ({
                      ...prev,
                      about: {
                        show: false,
                        minimized: false,
                      },
                    }));
                  }}
                />
              </div>
            </div>

            {/* Contenedor scrolleable con flecha posicionada dentro */}
            <div className="relative flex-1 overflow-hidden">
              {/* Contenido scrolleable */}
              <div ref={scrollContainerRef} className="relative overflow-y-auto overflow-x-hidden h-full scrollbar-hide py-1">
                <JsonCodeBlock />
                <div ref={loadMoreRef} className="w-[1px] h-[1px]"></div>
              </div>

              {/* Flecha sticky al final */}
              <div className="sticky bottom-0 right-0 pointer-events-none z-[1000]w-auto h-auto bg-white">
                <ArrowDownUp isObserved={isObserved} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

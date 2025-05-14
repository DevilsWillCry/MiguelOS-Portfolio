import React, { useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";
import { arrayProjectsDesktop } from "../helpers/arrayProjectsDesktop";

export default function StartUpPcFrame({ isOn, isOff, setAudioOn }) {
  const lines = [
    "[System Booting...]",
    "Loading user profile...",
    "> Name: Miguel Angel",
    "> Passion: Web Development",
    "> Status: ONLINE",
    `> Projects loaded: ${arrayProjectsDesktop.length}`,
    "> GitHub synced: ✔",
    "> Network: Connected to LinkedIn",
    "> Welcome to my Portfolio!",
    ">> Press any key to continue to my story...",
  ];

  const [showFrame, setShowFrame] = useState(true);
  const [visibleLines, setVisibleLines] = useState([]);
  const timeoutRef = useRef(null);

  const time = 8000;

  useEffect(() => {
    if (showFrame) {
      timeoutRef.current = setTimeout(() => {
        setShowFrame(false);
        setAudioOn(true);
      }, time);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [showFrame, isOn]);

  useEffect(() => {
    console.log(isOn);
    if (isOn) {
      setShowFrame(true);
      setVisibleLines([]);
    } else {
      clearTimeout(timeoutRef.current);
      console.log("Evento ocurrió antes de que se ocultara el frame");
    }
  }, [isOn]);

  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < lines.length) {
        setVisibleLines((prev) => [...prev, lines[currentIndex-1]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 300); // tiempo entre líneas

    return () => clearInterval(interval);
  }, [isOn]);

  /* TODO: insertar audio en PCFrame y añadir una función que lo reproduzca cuando acabe la animación de inicio */
  return (
    <>
      {showFrame && (
        <div
          onClick={() => {
            visibleLines.length >= lines.length ? (setShowFrame(false), setAudioOn(true)): null; 
          }}
          className={`bg-black text-white font-mono overflow-hidden w-full h-full flex flex-col items-start  ${
            showFrame && isOn
              ? "opacity-100"
              : "opacity-0 hidden duration-1000 pointer-events-none"
          } transition-all z-[100]  absolute top-0 left-1/2 -translate-x-1/2`}
        >
          <div className="ml-2 max-md:text-xs">
            {visibleLines.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2W text-xl font-bold max-md:-translate-y-0 flex flex-col items-center">
            <span className="mb-4 text-3xl">
              Miguel<span className="text-red-800 font-bold text-4xl">OS</span>
              _V1
            </span>
            <ClipLoader color="#c62828" size={40} />
          </div>
        </div>
      )}
    </>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ShutDownPcFrame({ isOn, isOff, count }) {
  const lines = [
    "[System Shutting Down...]",
    "Saving user preferences...",
    "Closing active projects...",
    "Terminating connections...",
    "> GitHub sync: COMPLETE",
    "> LinkedIn connection: CLOSED",
    "Releasing resources...",
    "Clearing cache...",
    "Goodbye, Miguel.",
    "[System OFFLINE]",
  ];

  const [showFrameOff, setShowFrameOff] = useState(true);
  const [visibleLines, setVisibleLines] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (showFrameOff) {
      timeoutRef.current = setTimeout(() => {
        setShowFrameOff(false);
      }, 5000);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [showFrameOff, isOn]);

  useEffect(() => {
    console.log(isOn);
    if (!isOn) {
      setShowFrameOff(true);
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
        setVisibleLines((prev) => [...prev, lines[currentIndex - 1]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 300); // tiempo entre líneas

    return () => clearInterval(interval);
  }, [isOn]);

  console.log(showFrameOff);

  return (
    <div
      className={`bg-black text-white font-mono overflow-hidden w-full h-full ${
        showFrameOff && !isOn && count >= 2
          ? "opacity-100"
          : "opacity-0 hidden duration-1000 pointer-events-none"
      } transition-all z-[100]  absolute top-0 left-1/2 -translate-x-1/2`}
    >
      <div className="whitespace-pre-wrap ml-2 mt-2 max-md:text-xs">
        {visibleLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2W text-xl font-bold max-md:-translate-y-0 flex flex-col items-center">
        <span className="mb-4 text-3xl">
          Shutting Down...
        </span>
        <ClipLoader color="#c62828" size={40} />
      </div>
    </div>
  );
}

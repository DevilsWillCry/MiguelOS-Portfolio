import React, { useEffect, useRef, useState } from "react";
import Switchers from "./Switchers";
import DesktopPortfolio from "./DesktopPortfolio";
import StartUpPcFrame from "./StartUpPcFrame";
import ShutDownPcFrame from "./ShutDownPcFrame";
import startUpWindowsSound from "../assets/Windows_Startup_Sound.wav";

function PcFrame() {
  const [count, setCount] = useState(0);
  const [isOn, setIsOn] = useState(false);
  const [isOffScreen, setIsOffScreen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const timeoutRef = useRef(null);
  const handleClick = () => {
    setIsOn(!isOn);
    setCount(count + 1);
  };

  useEffect(() => {
    // Si la pantalla está apagada, inicia el timeout de 5 segundos
    if (!isOn) {
      // Limpiar timeout previo, en caso de existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsOffScreen(true);
      }, 5000);
    } else {
      // Si la pantalla se enciende, cancelar el timeout y actualizar el estado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Si la pantalla estaba en estado off, actualizamos a on
      if (isOffScreen) {
        setIsOffScreen(false);
      }
    }

    // Función de cleanup para cancelar el timeout cuando el efecto se vuelva a ejecutar
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOn, isOffScreen]);

  console.log(timeoutRef);

  useEffect(() => {
    if (isOn && audioOn) {
      const audio = new Audio(startUpWindowsSound);
      audio.play();
    } else if (!isOn && audioOn) {
      const audio = new Audio(startUpWindowsSound);
      audio.pause();
      setAudioOn(false);
    }
    const timeout = setTimeout(() => {
      setAudioOn(false);
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };

  }, [isOn, audioOn]);

  console.log(audioOn);
  return (
    <>
      {/* Marco sobresaliente del Frame del PC en TOP*/}
      <div className="before:w-[90%] before:h-[90%] before:fixed before:border-solid before:border-t-[5px]  before:border-b-[5px] before:rounded-t-xl before:border-gray-400 before:top-0 before:z-[60] before:left-[50%] before:translate-x-[-50%] before:pointer-events-none items-center">
        {/* Marco del Frame del PC*/}
        <div
          className={`w-[90%] h-[90%] fixed border-solid border-[35px]  border-[#222222] rounded-t-xl  z-0 top-0 left-[50%] translate-x-[-50%] overflow-hidden shadow-[0_0_3px_0_white]  transition-all  duration-1000 ${
            isOn ? "bg-none animate-tv-flicker" : "bg-black"
          }`}
        >
          {/* Pantalla de encendido del PC */}
          <StartUpPcFrame
            isOn={isOn}
            isOff={isOffScreen}
            setAudioOn={setAudioOn}
          />

          {/* Pantalla del PC */}
          <DesktopPortfolio isOn={isOn} isOff={isOffScreen} />

          {/* Pantalla de apagado del PC */}
          <ShutDownPcFrame isOn={isOn} isOff={isOffScreen} count={count} />
        </div>

        {/* Lente de la cámara frontal del PC*/}
        <div className="h-[2%] w-[1%] absolute top-3 left-[50%] translate-x-[-50%]  bg-black z-[101] rounded-full"></div>
      </div>
      {/* Bloque inferior del PC*/}
      <div className=" border-gray-500 flex flex-row items-center justify-end px-5 fixed bottom-3 right-[50%] translate-x-[50%] w-[95%] h-[9%] z-[60] bg-[#222222] rounded-br-2xl rounded-bl-2xl">
        <Switchers isOn={isOn} isOff={isOffScreen} handleClick={handleClick} />
      </div>
    </>
  );
}

export default PcFrame;

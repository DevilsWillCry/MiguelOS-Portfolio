import React, { useEffect, useRef, useState } from "react";
import Switchers from "./Switchers";
import DesktopPortfolio from "./DesktopPortfolio";
import StartUpPcFrame from "./StartUpPcFrame";
import ShutDownPcFrame from "./ShutDownPcFrame";
import PhoneFrame from "./PhoneFrame";
import LaptopIntro from "./LaptopIntro";
import useDeviceType from "../../hooks/useDeviceType";
import startUpWindowsSound from "../../assets/Windows_Startup_Sound.wav";

function PcFrame() {
  const [count, setCount] = useState(0);
  const [isOn, setIsOn] = useState(true);
  const [isOffScreen, setIsOffScreen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const timeoutRef = useRef(null);
  const { isMobile } = useDeviceType();
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

  // Contenido de la pantalla del OS (compartido por ambos marcos)
  const screen = (
    <>
      {/* Pantalla de encendido */}
      <StartUpPcFrame isOn={isOn} isOff={isOffScreen} setAudioOn={setAudioOn} />

      {/* Pantalla del OS */}
      <DesktopPortfolio isOn={isOn} isOff={isOffScreen} isMobile={isMobile} />

      {/* Pantalla de apagado */}
      <ShutDownPcFrame isOn={isOn} isOff={isOffScreen} count={count} />
    </>
  );

  // Modo móvil/tablet: marco de teléfono a pantalla completa
  if (isMobile) {
    return <PhoneFrame isOn={isOn}>{screen}</PhoneFrame>;
  }

  // Modo escritorio: marco de monitor
  const monitor = (
    <>
      {/* Bisel del monitor: degradado vertical + relieve con sombras internas/externas */}
      <div
        className="fixed top-0 left-[50%] translate-x-[-50%] w-[90%] h-[90%] z-0 rounded-t-2xl bg-gradient-to-b from-[#3d3d42] via-[#242427] to-[#141416] shadow-[0_28px_60px_-14px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.18),inset_0_2px_3px_rgba(255,255,255,0.16),inset_0_-8px_18px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(0,0,0,0.5)]"
      >
        {/* Reflejo superior sutil del plástico */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-2xl bg-gradient-to-b from-white/10 to-transparent" />

        {/* Lente de la cámara frontal del PC */}
        <div className="h-3 w-3 absolute top-2.5 left-[50%] translate-x-[-50%] bg-[#0a0a0a] z-[101] rounded-full shadow-[inset_0_0_3px_rgba(0,0,0,0.9),0_0_4px_rgba(255,255,255,0.15)]">
          <div className="h-[35%] w-[35%] bg-cyan-200/70 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Pantalla recesada dentro del bisel */}
        <div
          className={`absolute inset-[30px] top-[38px] rounded-lg overflow-hidden shadow-[inset_0_0_0_2px_rgba(0,0,0,0.9),inset_0_4px_14px_rgba(0,0,0,0.85),0_0_2px_rgba(255,255,255,0.2)] transition-all duration-1000 ${
            isOn ? "bg-none animate-tv-flicker" : "bg-black"
          }`}
        >
          {screen}
        </div>

        {/* Marca del bisel inferior */}
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.35em] font-semibold text-white/25">
          Miguel<span className="text-red-600/60">OS</span>
        </div>
      </div>

      {/* Base / peana del monitor con relieve */}
      <div className="flex flex-row items-center justify-end px-5 fixed bottom-3 right-[50%] translate-x-[50%] w-[95%] h-[9%] z-[60] rounded-b-2xl bg-gradient-to-b from-[#2b2b2f] to-[#121214] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.85),inset_0_2px_2px_rgba(255,255,255,0.12),inset_0_-5px_12px_rgba(0,0,0,0.65)] max-md:w-[90%]">
        <Switchers isOn={isOn} isOff={isOffScreen} handleClick={handleClick} />
      </div>
    </>
  );

  // El monitor 2D se monta detrás desde el inicio; la intro 3D va encima y se
  // desvanece revelándolo (crossfade), evitando un corte de escena brusco.
  return (
    <>
      {monitor}
      {!introDone && <LaptopIntro onFinished={() => setIntroDone(true)} />}
    </>
  );
}

export default PcFrame;

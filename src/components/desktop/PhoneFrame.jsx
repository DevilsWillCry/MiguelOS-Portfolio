import React from "react";

// Marco de teléfono para dispositivos táctiles: ocupa todo el viewport,
// con bisel redondeado y notch superior. Envuelve la pantalla del OS.
export default function PhoneFrame({ isOn, children }) {
  return (
    <div className="fixed inset-0 z-0 bg-black p-2 flex items-center justify-center">
      {/* Cuerpo del teléfono */}
      <div className="relative w-full h-full rounded-[2.5rem] border-solid border-[6px] border-[#222222] overflow-hidden shadow-[0_0_3px_0_white]">
        {/* Notch superior */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-[101] flex items-center justify-center gap-2">
          <div className="w-8 h-1 bg-[#333] rounded-full" />
          <div className="w-2 h-2 bg-[#111] rounded-full ring-1 ring-[#333]" />
        </div>

        {/* Pantalla */}
        <div
          className={`w-full h-full transition-all duration-1000 ${
            isOn ? "bg-none animate-tv-flicker" : "bg-black"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

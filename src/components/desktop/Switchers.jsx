import React from "react";
import { FaPowerOff } from "react-icons/fa";
import PointerHand from "../../assets/pointer-hand.webp";

const Switchers = ({ isOn, isOff, handleClick }) => {
  return (
    <div className="relative flex items-center gap-3">
      {/* Mano indicadora cuando la pantalla está apagada */}
      <div
        className={`transition-all w-9 h-9 absolute -left-10 -bottom-2 z-[500] pointer-events-none ${
          isOff ? "opacity-100 animate-bounce" : "opacity-0"
        }`}
      >
        <img
          src={PointerHand}
          alt="Pulsa para encender"
          className="object-contain -scale-x-100"
        />
      </div>

      {/* LED de estado */}
      <span
        className={`w-2 h-2 rounded-full transition-all duration-500 ${
          isOn
            ? "bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.85)]"
            : "bg-gray-700 shadow-inner"
        }`}
      />

      {/* Botón físico de encendido/apagado */}
      <button
        onClick={handleClick}
        aria-label={isOn ? "Apagar PC" : "Encender PC"}
        title={isOn ? "Apagar" : "Encender"}
        className="group relative w-11 h-11 rounded-full flex items-center justify-center transition-all
                   bg-gradient-to-b from-[#2c2c30] to-[#131315]
                   border border-black/70
                   shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-3px_5px_rgba(0,0,0,0.6),0_2px_5px_rgba(0,0,0,0.55)]
                   hover:brightness-125 active:scale-95 active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]"
      >
        {/* Anillo de brillo cuando está encendido */}
        <span
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            isOn ? "shadow-[0_0_10px_2px_rgba(74,222,128,0.4)]" : ""
          }`}
        />
        <FaPowerOff
          className={`text-lg transition-all duration-500 ${
            isOn
              ? "text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.9)]"
              : "text-gray-500 group-hover:text-gray-300"
          }`}
        />
      </button>
    </div>
  );
};

export default Switchers;

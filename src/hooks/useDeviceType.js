import { useState } from "react";

// Detecta una sola vez (al montar) si el dispositivo es táctil (móvil o tablet).
// No cambia al redimensionar la ventana: refleja el dispositivo físico, no el ancho.
function detectIsMobile() {
  if (typeof window === "undefined") return false;

  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  const uaMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
      navigator.userAgent || ""
    );

  // iPadOS moderno se reporta como "Macintosh" pero tiene varios puntos táctiles.
  const iPadOS = navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent || "");

  return coarsePointer || uaMobile || iPadOS;
}

export default function useDeviceType() {
  const [isMobile] = useState(detectIsMobile);
  return { isMobile };
}

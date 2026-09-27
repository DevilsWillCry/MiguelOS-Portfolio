import { useState } from "react";
import { useMotionValue } from "framer-motion";

// Maneja el estado común de una ventana de app: posición de arrastre (x, y) y
// si está maximizada. Al maximizar/restaurar resetea el transform de arrastre a 0
// para que la ventana no quede desplazada fuera de la pantalla.
export default function useWindowFrame() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMaximized, setIsMaximized] = useState(false);

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  const maximize = () => {
    resetPosition();
    setIsMaximized(true);
  };

  const restore = () => {
    resetPosition();
    setIsMaximized(false);
  };

  return { x, y, isMaximized, maximize, restore };
}

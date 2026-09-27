// Devuelve las clases de posición/tamaño de una ventana de app según el modo:
// - móvil: pantalla completa dejando espacio para la barra de navegación inferior
// - maximizada (PC): llena la pantalla del monitor por encima de la taskbar
// - normal: las clases base que recibe cada ventana
export function getWindowClass({ isMobile, isMaximized, base }) {
  if (isMobile) {
    return "absolute top-0 left-0 w-full h-[calc(100%-3.5rem)] bg-gray-900 z-20 flex flex-col";
  }
  if (isMaximized) {
    return "absolute top-0 left-0 right-0 bottom-14 bg-gray-900 shadow-xl z-30 flex flex-col";
  }
  return base;
}

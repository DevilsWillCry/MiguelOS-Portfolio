import { useEffect, useState } from "react";

const Carousel = (props) => {
  const totalElements = props.arrayElements.length;
  //Donde 90 es el width de cada image del carousel
  const [translateZpos, setTranslateZpos] = useState(0
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      // Cambia el valor de translateZpos según el ancho de la ventana
      if (width <= 540) {
        setTranslateZpos(80 / 2 / Math.tan(Math.PI / totalElements) + 10);
      } else if (width <= 1024) {
        setTranslateZpos(100 / 2 / Math.tan(Math.PI / totalElements) + 10);
      } else {
        setTranslateZpos(250 / 2 / Math.tan(Math.PI / totalElements) + 10);
      }
    };

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener("resize", handleResize);

    // Llamar la función al cargar para ajustar inicialmente el valor
    handleResize();

    // Limpieza del evento al desmontar el componente
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [totalElements]);

  

  return (
    <div className="container relative text-center text-white lg:w-[180px] max-sm:w-[50px] sm:w-[140px] h-auto [perspective:1000px] mt-[150px] mx-auto mb-0 z-10">
      <div
        className="carousel absolute w-[100%] h-[100%] [transform-style:preserve-3d] animate-rotate360 [transform-origin:center] lg:left-0 max-sm:left-1/2 sm:left-1/2 "
        style={{ backfaceVisibility: "hidden", willChange: "transform" }}
      >
        {props.arrayElements.map((elemento, index) => (
          <div
            key={elemento.id}
            className={`carousel__face absolute flex flex-col text-center lg:w-[150px] max-sm:w-[50px] sm:w-[100px] h-auto top-[30px] bg-cover`}
            style={{
              transform: `rotateY(${(360 / totalElements) * index}deg) translateZ(${translateZpos}px)`,
            }}
          >
            <img
              className="block w-full lg:h-[220px] max-sm:h-[60px] sm:h-[60px] rounded-xl"
              src={elemento.image}
              alt={elemento.name + ".jpg"}
            />
            <span className="lg:text-[0.6vw] max-sm:text-[3vw] sm:text-[2vw] m-auto">
              {elemento.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;

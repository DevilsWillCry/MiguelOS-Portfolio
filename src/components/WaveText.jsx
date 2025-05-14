import React from "react";

const WaveText = (props) => {
  const text = props.text; 

  return (
    <>
      {text.split("").map((letter, index) => (
        <span
          key={index}
          className={`inline-block font-bold animate-waveAndColorChange`}
          style={{ animationDelay: `${index * 100}ms` }} // Aplicar retraso a cada letra
        >
          {letter === " " ? "\u00A0" : letter} {/* Manejar espacios */}
        </span>
      ))}
    </>
  );
};

export default WaveText;


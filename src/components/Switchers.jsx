import React from "react";

import PointerHand from "../assets/pointer-hand.webp"

const Switchers = ({ isOn, isOff, handleClick }) => {
  return (
    <>
      <div className={`transition-all w-10 h-10 absolute bottom-0 -right-1 z-[500] ${isOff ? "opacity-100 animate-pulse" : "opacity-0"}`}>
        <img src={PointerHand} alt="Pointer Hand when screen is Off" className="object-contain" />
      </div>
      <span
        className={`absolute w-[150px] h-[50%] rounded-[25px] my-3 z-[200] transition-all duration-1000 hover:animate-none`}
      >
        <input
          type="checkbox"
          id="switcher-1"
          onClick={handleClick}
          checked={isOn || false}
          className={`
            peer appearance-none relative w-full h-full rounded-[25px] bg-black outline-none font-oswald
            before:content-['ON'] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[15px] before:z-20 before:text-[#CCCCCC]
            after:content-['OFF'] after:absolute after:top-1/2 after:-translate-y-1/2 after:right-[15px] after:z-20 after:text-[#1E1E1E]
            transition-colors duration-500 checked:bg-white
          `}
        />
        <label
          htmlFor="switcher-1"
          className={`
                absolute top-[10px] bottom-[10px] rounded-[20px]
                left-[100px] right-[10px] bg-red-600
                transition-all duration-500
                peer-checked:left-[8px] peer-checked:right-[100px] peer-checked:bg-green-600
                `}
        ></label>
      </span>
    </>
  );
};

export default Switchers;

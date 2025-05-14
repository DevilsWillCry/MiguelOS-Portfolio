import React from "react";
import arrowDownIcon from "../assets/arrow-down-icon..min.svg";

export default function ArrowDownUp({ isObserved }) {
  return (
      <img
        src={arrowDownIcon}
        className={`absolute bottom-3  right-1  -translate-x-3/4  transition-all  w-6 h-6  text-white fill-white invert p-1 ${
          isObserved ? "animate-rotateArrowUp" : "animate-rotateArrowDown"
        } `}
        alt="arrow down icon"
      />
  );
}

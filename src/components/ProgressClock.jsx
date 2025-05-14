import React from "react";

function ProgressClock() {
  return (
    <div className="absolute bottom-0 right-3 z-[0] flex">
      <figure className="component" aria-hidden="true">
        <div className="timer-wrapper w-24 h-24">
          <svg
            className="timer w-20 h-20"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="#fff"
            viewBox="0 0 256 256"
          >
            <rect width="256" height="256" fill="none"></rect>
            <circle cx="128" cy="128" r="88" fill="var(--color-theme)"></circle>
            <circle
              cx="128"
              cy="128"
              r="88"
              fill="none"
              stroke="#b50556"
              stroke-miterlimit="10"
              stroke-width="16"
            ></circle>
            <line
              className="timer-hand"
              x1="128"
              y1="128"
              x2="167.6"
              y2="88.4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            ></line>
            <line
              className="timer-switch"
              x1="104"
              y1="8"
              x2="152"
              y2="8"
              fill="none"
              stroke="#ffd700"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            ></line>
          </svg>
        </div>
        <figcaption className="caption"></figcaption>
      </figure>
    </div>
  );
}

export default ProgressClock;

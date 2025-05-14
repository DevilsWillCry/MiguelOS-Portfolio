const withMT = require("@material-tailwind/react/utils/withMT");
/** @type {import('tailwindcss').Config} */
export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        lato: ["Lato", "sans-serif"],
        hyperlegible: ['"Atkinson Hyperlegible Mono"', "monospace"],
      },
      colors: {
        myColor: "#b50556",
      },
      keyframes: {
        "turn-on": {
          "0%": { left: "100%" },
          "100%": { left: "0" },
        },
        tvflicker: {
          "0%": { boxShadow: "0 0 100px 0 rgba(225,235,255,0.4)" },
          "100%": { boxShadow: "0 0 60px 0 rgba(200,220,255,0.6)" },
        },
        "scale-in-ver-top": {
          "0%": {
            transform: "scaleY(0)",
            "transform-origin": "100% 0%",
            opacity: "1",
          },
          "100%": {
            transform: "scaleY(1)",
          },
        },
        "slide-in-fwd-center": {
          "0%": {
            transform: "translateZ(-1400px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateZ(0)",
            opacity: "1",
          },
        },
        "slide-in-blurred-top": {
          "0%": {
            transform: "translateY(-1000px) scaleY(2.5) scaleX(0.2)",
            "transform-origin": "50% 0%",
            filter: "blur(40px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0) scaleY(1) scaleX(1)",
            "transform-origin": "50% 50%",
            filter: "blur(0)",
            opacity: "1",
          },
        },
        "text-pop-up-top": {
          "0%": {
            transform: "translateY(0)",
            "transform-origin": "50% 50%",
            "text-shadow": "none",
          },
          "100%": {
            transform: "translateY(-50px)",
            "transform-origin": "50% 50%",
            "text-shadow":
              "0 1px 0 #cccccc, 0 2px 0 #cccccc, 0 3px 0 #cccccc, 0 4px 0 #cccccc, 0 5px 0 #cccccc, 0 6px 0 #cccccc, 0 7px 0 #cccccc, 0 8px 0 #cccccc, 0 9px 0 #cccccc, 0 50px 30px rgba(0, 0, 0, 0.3)",
          },
        },
        "color-change-2x": {
          "0%": {
            background: "#19dcea",
          },
          "100%": {
            background: "#b22cff",
          },
        },
        rainbow: {
          "0%, 100%": { color: "#ff0000" }, // Rojo
          "16.67%": { color: "#ff7f00" }, // Naranja
          "33.33%": { color: "#ffff00" }, // Amarillo
          "50%": { color: "#00ff00" }, // Verde
          "66.67%": { color: "#0000ff" }, // Azul
          "83.33%": { color: "#4b0082" }, // Índigo
        },
        wave: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        vibrate: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        shakeHorizontal: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%": { transform: "translateX(-10px)" },
          "20%, 40%, 60%": { transform: "translateX(10px)" },
          "80%": { transform: "translateX(8px)" },
          "90%": { transform: "translateX(-8px)" },
        },
        shadowDropCenter: {
          "0%": {
            transform: "translateZ(0)",
            boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
          },
          "100%": {
            transform: "translateZ(50px)",
            boxShadow: "0 0 20px 0px rgba(0, 0, 0, 0.35)",
          },
        },
        rotate360: {
          from: { transform: "rotateY(0deg)" },
          to: { transform: "rotateY(-360deg)" },
        },
        infiniteScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(0px - 100%))" },
        },
        zoomIn: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scaleY(1.11) scaleX(1.15) translateY(35px)" },
        },
        rotateArrowUp: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
        rotateArrowDown: {
          "0%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      animation: {
        "scale-in-ver-top": "scale-in-ver-top 1s ease-in-out both",
        "slide-in-fwd-center": "slide-in-fwd-center 1.5s ease-in-out both",
        "slide-in-blurred-top": "slide-in-blurred-top 0.8s ease-in-out both",
        "text-pop-up-top": "text-pop-up-top 0.6s ease-in-out both",
        "color-change-2x": "color-change-2x 2s linear infinite alternate both",
        rainbow: "rainbow 4s linear infinite",
        wave: "wave 2s ease-in-out infinite",
        waveAndColorChange:
          "rainbow 4s linear infinite, wave 1s ease-in-out infinite",
        vibrate: "vibrate 0.6s linear infinite both",
        shakeHorizontal:
          "shakeHorizontal  1.5s cubic-bezier(0.455, 0.030, 0.515, 0.955) both infinite",
        shadowDropCenter:
          "shadowDropCenter 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
        rotate360: "rotate360 20s infinite linear forwards",
        infiniteScroll: "infiniteScroll 10s infinite linear forwards",
        "tv-flicker": "tvflicker 0.5s infinite alternate",
        "turn-on": "turn-on 0.5s ease-out",
        zoomIn: "zoomIn 2s ease-in-out both",
        rotateArrowUp: "rotateArrowUp 0.5s ease-in-out both",
        rotateArrowDown: "rotateArrowDown 0.5s ease-in-out both",
      },
      backgroundImage: {
        "background-main": "url('/src/assets/main-background.jpg')",
      },
      boxShadow: {
        "custom-inset": "inset 0 0 0 2000px rgba(0, 0, 0, 0.5)",
      },
    },
    screens: {
      "max-sm": { max: "540px" },
      "max-md": { max: "768px" },
      "max-lg": { max: "1024px" },
      "max-xl": { max: "1280px" },
      "max-text-screen": { max: "720px" },
      "min-lg": { min: "768px" },
      "min-xl": { min: "1024px" },
    },
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/typography"),
  ],
});

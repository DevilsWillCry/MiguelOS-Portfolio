import React, { useEffect, useRef, useState } from "react";
import ArrowDownUp from "./ArrowDownUp";

export default function JsonCodeBlock() {
  const [isObserved, setIsObserved] = useState(false);

  return (
    <div className="relative">
      <pre className="bg-gray-900 text-sm p-5 rounded-md font-mono overflow-y-auto leading-relaxed text-wrap h-full w-full ">
        <code>
          <span className="text-sky-400">{"{"}</span>
          {"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">"name"</span>:{" "}
          <span className="text-green-400">"Miguel Angel"</span>,{"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">"role"</span>:{" "}
          <span className="text-green-400">"Desarrollador Web Junior"</span>,
          {"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">"abilities"</span>:{" "}
          <span className="text-sky-400">[</span>
          {"\n"}
          <span className="flex flex-wrap gap-x-2 text-green-400 ml-10">
            <span>"HTML",</span>
            <span>"CSS",</span>
            <span>"JavaScript",</span>
            <span>"TypeScript",</span>
            <span>"React",</span>
            <span>"Next.js",</span>
            <span>"Redux",</span>
            <span>"SQL",</span>
            <span>"MongoDB",</span>
            <span>"Git",</span>
            <span>"Github",</span>
            <span>"Tailwind",</span>
            <span>"Bootstrap",</span>
            <span>"Material UI"</span>
          </span>
          &nbsp;&nbsp;<span className="text-sky-400">]</span>,{"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">"softSkills"</span>:{" "}
          <span className="text-sky-400">[</span>
          {"\n"}
          <span className="flex flex-wrap gap-x-2 text-green-400 ml-10">
            <span>"Creatividad",</span>
            <span>"Resolución de problemas",</span>
            <span>"Comunicación",</span>
            <span>"Pensamiento crítico",</span>
            <span>"Trabajo en equipo"</span>
          </span>
          {"\n"}&nbsp;&nbsp;<span className="text-sky-400">]</span>,{"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">"passion"</span>:{" "}
          <span className="text-green-400">
            "Construir interfaces limpias y funcionales"
          </span>
          ,{"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">
            "englishLevel"
          </span>: <span className="text-green-400">"Intermedio (B1+)"</span>
          {"\n"}
          &nbsp;&nbsp;<span className="text-amber-300">"availableForWork"</span>
          : <span className="text-orange-400">true</span>
          {"\n"}
          <span className="text-sky-400">{"}"}</span>
        </code>
      </pre>
    </div>
  );
}

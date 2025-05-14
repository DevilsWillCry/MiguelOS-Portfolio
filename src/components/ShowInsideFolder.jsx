import { useRef, useState } from "react";
import { arrayElements } from "../helpers/arrayCarousel";
import { motion, AnimatePresence } from "framer-motion";
import foldericon from "../assets/folder-icon.svg";
import gifBoxEmpty from "../assets/box-empty-gif-icon.gif";
import DescriptionProjectDesktop from "./DescriptionProjectDesktop";
import readmeIcon from "../assets/readme-icon.svg";

export default function ShowInsideFolder({ file, containerRef, setReadme }) {
  console.log(file);
  const [folderOpened, setFolderOpened] = useState(false);

  function filterTechnologies(technologies, arrayElements) {
    const array = [];
    for (let i = 0; i < technologies.technologies.length; i++) {
      for (let j = 0; j < arrayElements.length; j++) {
        if (technologies.technologies[i] === arrayElements[j].technology) {
          array.push(arrayElements[j]);
        }
      }
    }
    return array;
  }

  const arrayFiltered =
  file?.technologies !== undefined && file?.technologies.length > 0
  ? filterTechnologies(file, arrayElements)
  : undefined;
  

  return (
    <div className="w-full h-full relative overflow-auto">
      {arrayFiltered !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 200 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-start w-full h-full "
        >
          <div
            onClick={() => setReadme(file)}
            className="flex flex-row items-start justify-start w-full h-auto mt-2 hover:cursor-pointer hover:bg-white/10 hover:p-1 transition-all"
          >
            <img src={readmeIcon} alt="folder-icon" className="w-4 h-4" />
            <h1 className="text-white ml-1">info.md</h1>
          </div>
          <div
            onClick={() => setFolderOpened(!folderOpened)}
            className="flex flex-row items-start justify-start w-full h-auto mt-2 hover:bg-white/10 hover:cursor-pointer hover:p-1 transition-all"
          >
            <img src={foldericon} alt="folder-icon" className="w-4 h-4" />
            <h1 className="text-white ml-1">src</h1>
          </div>
        </motion.div>
      )}

      {folderOpened && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 200 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0-translate-y-1/2 -translate-x-1/2 flex flex-row justify-between gap-x-1 w-full h-full bg-gray-900 overflow-y-auto scrollbar-hide"
        >
          <div className="flex flex-col p-2">
            <h2 className="font-bold mt-1 mb-1">Nombre</h2>

            {arrayFiltered !== undefined &&
              arrayFiltered.map((element, index) => (
                <div key={index} className="w-full flex items-center gap-2">
                  {element.technology === "README" ? (
                    ""
                  ) : (
                    <img src={element.image} className="w-4 h-4" alt="" />
                  )}

                  {element.technology === "README" ? (
                    ""
                  ) : (
                    <span className="flex-1">{element.name}</span>
                  )}
                </div>
              ))}
          </div>
          <div className="flex flex-col p-2">
            <h2 className="font-bold mt-1 mb-1">Fecha</h2>
            {arrayFiltered !== undefined &&
              arrayFiltered.map((element, index) => (
                <div key={index} className="w-full flex items-center gap-2">
                  {element.technology === "README" ? (
                    ""
                  ) : (
                    <span className="ml-1">{element.date}</span>
                  )}
                </div>
              ))}
          </div>
          <div className="flex flex-col p-2">
            <h2 className="font-bold mt-1 mb-1">Tamaño</h2>
            {arrayFiltered !== undefined &&
              arrayFiltered.map((element, index) => (
                <div
                  key={index}
                  className="w-full flex items-center gap-2 text-nowrap"
                >
                  {element.technology === "README" ? (
                    ""
                  ) : (
                    <span className="ml-1">{element.size}</span>
                  )}
                </div>
              ))}
          </div>
        </motion.div>
      )}
      {arrayFiltered === undefined && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]  flex  flex-col w-32 h-32 items-center">
          <img
            src={gifBoxEmpty}
            className="object-cover items-center justify-center mr-5 opacity-50"
            alt=""
          />
          <h2 className="font-bold mt-2 mb-1 text-[10px] text-center">
            No hay datos
          </h2>
        </div>
      )}
    </div>
  );
}

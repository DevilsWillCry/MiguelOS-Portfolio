import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWindowClose,
  FaMinus,
  FaUserCircle,
  FaArrowAltCircleLeft,
} from "react-icons/fa";
import ProjectIcon from "../assets/project_icon.png";
import FolderIcon from "../assets/folder-icon.svg";
import { arrayProjectsDesktop } from "../helpers/arrayProjectsDesktop";
import ShowInsideFolder from "./ShowInsideFolder";
import DescriptionProjectDesktop from "./DescriptionProjectDesktop";
import ArrowDownUp from "./ArrowDownUp";

export default function ProjectsDesktop({
  onMinimizeChange,
  onMaximizeChange,
  setMaximize,
  isOn,
  containerRef,
}) {
  const [activeProject, setActiveProject] = useState(null);
  const [showProjects, setShowProjects] = useState(null);
  const [readmeClicked, setReadmeClicked] = useState(null);

  const projects = arrayProjectsDesktop;
  const loadMoreRef = useRef(null);

  const [isObserved, setIsObserved] = useState(false);

  useEffect(() => {
    console.log(isOn);
    if (!isOn) {
      setMaximize((prev) => ({
        ...prev,
        projects: {
          show: false,
          minimized: false,
        },
      }));
      setReadmeClicked(null);
    }
  }, [isOn]);

  function setReadmeChildren(children) {
    setReadmeClicked(children);
  }

  //show with console log width and height of containerRef and update when it changes
  useEffect(() => {
    console.log(
      containerRef.current.offsetWidth,
      containerRef.current.offsetHeight
    );
  }, [containerRef]);

  useEffect(() => {
    let observer;

    const tryObserve = () => {
      if (!loadMoreRef.current) {
        requestAnimationFrame(tryObserve); // vuelve a intentarlo en el siguiente frame
        return;
      }

      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log("Está intersectando");
          setIsObserved(true);
        } else {
          console.log("No está intersectando");
          setIsObserved(false);
        }
      });

      observer.observe(loadMoreRef.current);
    };

    tryObserve(); // inicia la observación

    return () => {
      if (observer && loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef, onMaximizeChange]);
  
  return (
    <>
      {/* Icono en el escritorio */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0.8}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
        className="absolute w-28 h-auto flex flex-col items-center cursor-pointer hover:bg-white/10 p-3 rounded-xl min-xl:top-80 min-xl:left-10 max-md:top-20 max-md:left-36 min-lg:left-48 min-lg:top-10"
        onClick={() => {
          setMaximize((prev) => ({
            ...prev,
            projects: {
              show: true,
              minimized: false,
            },
          }));
        }}
      >
        <img
          src={ProjectIcon}
          alt="Projects Icon"
          className="w-10 h-10 pointer-events-none"
        />
        <span className="text-xs mt-1 break-all">Proyectos</span>
      </motion.div>

      {/* Ventana Proyectos */}
      <AnimatePresence>
        {onMaximizeChange && (
          <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.8}
            dragMomentum={false}
            className={`absolute min-xl:top-[12rem] min-xl:left-[25rem] bg-gray-900 rounded-xl shadow-xl w-[300px] h-[250px] z-10 max-md:top-32 max-md:left-10 max-md:-translate-x-1/2 max-md:w-[75%] max-md:h-[40%] min-lg:top-[1rem] min-lg:left-[22rem] `}
            initial={{ opacity: 0, scale: 0.8, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 200 }}
            transition={{ duration: 0.5 }}
          >
            
            {/* Barra superior */}
            <div className="relative bg-gray-800 px-3 py-2 rounded-t-xl flex justify-between items-center cursor-move max-md:px-4 ">
              {activeProject != null && (
                <div
                  className="max-md:visible min-lg:hidden absolute top-1/2  left-2 -translate-y-[55%] -translate-x-0"
                  onClick={() => setActiveProject(null)}
                >
                  {/* arrow left icon using react icons */}
                  <FaArrowAltCircleLeft className="text-base" />
                </div>
              )}
              <span
                className={`text-sm ${
                  activeProject != null ? "max-md:ml-4" : ""
                } `}
              >
                {showProjects == null && activeProject == null && "Proyectos"}
              </span>
              <div className="flex gap-2">
                <FaMinus
                  className="text-yellow-400 cursor-pointer hover:text-yellow-800"
                  onClick={() => {
                    onMinimizeChange("projects");
                    setMaximize((prev) => ({
                      ...prev,
                      projects: {
                        show: false,
                        minimized: true,
                      },
                    }));
                  }}
                />
                <FaWindowClose
                  className="text-red-500 cursor-pointer hover:text-red-800"
                  onClick={() => {
                    setMaximize((prev) => ({
                      ...prev,
                      projects: {
                        show: false,
                        minimized: false,
                      },
                    }));
                    setActiveProject(null);
                  }}
                />
              </div>
            </div>

            {/* Contenido de la ventana - Insert proyects were like folders*/}
            <div className="relative p-1 text-xs flex flex-row flex-wrap items-center flex-shrink-0 gap-1 scrollbar-hide h-[80%] justify-normal w-full transition-all">
              <ArrowDownUp isObserved={isObserved} />
              <div className="w-full h-full overflow-y-auto scrollbar-hide flex flex-row flex-wrap items-center flex-shrink-0 gap-3">
                {projects.map((project) => (
                  <span
                    key={project.id}
                    onClick={() => setActiveProject(project.id)}
                    className={`flex flex-col gap-2 justify-center w-[45%] h-[45%] p-2 items-center cursor-pointer hover:bg-white/10 rounded text-center overflow-y-hidden scrollbar-hide ${
                      activeProject ? "hidden" : ""
                    }`}
                  >
                    <img
                      src={FolderIcon}
                      alt="Projects Icon"
                      className="w-10 h-10 pointer-events-none"
                    />
                    <span className="max-md:hidden">
                      {project.name.length > 10
                        ? project.name.substring(0, 10) + "..."
                        : project.name}
                    </span>
                    <span className="min-lg:hidden">
                      {project.name.length > 5
                        ? project.name.substring(0, 5) + "..."
                        : project.name}
                    </span>
                  </span>
                ))}
                <div ref={loadMoreRef} className="w-[1px] h-[1px]"></div>
              </div>
              {activeProject != null && (
                <div className="w-full h-full bg-gray-900 rounded  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white p-2 mt-1">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 200 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <div className="w-full flex flex-row border-solid border-b-2 rounded border-gray-600 max-md:hidden overflow-auto">
                      <span
                        className="hover:font-bold cursor-pointer flex flex-row gap-x-1"
                        onClick={() => (
                          setActiveProject(null), setReadmeClicked(null)
                        )}
                      >
                        <FaArrowAltCircleLeft className="text-base" />
                        desktop/projects/
                      </span>
                      <span>{projects[activeProject - 1].name}</span>
                    </div>
                    <ShowInsideFolder
                      file={projects[activeProject - 1]}
                      containerRef={containerRef}
                      setReadme={setReadmeChildren}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {readmeClicked && (
          <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.8}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 200, bounceDamping: 30 }}
            initial={{ opacity: 0, scale: 0.8, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 200 }}
            transition={{ duration: 0.5 }}
            className={`absolute min-xl:top-[6rem] min-xl:left-[40rem] bg-gray-900 rounded-xl shadow-xl w-[500px] h-[450px] z-10 max-md:top-40 max-md:left-10 max-md:-translate-x-1/2 max-md:w-[80%] max-md:h-[50%] min-lg:top-[1rem] min-lg:left-[22rem] overflow-auto scrollbar-hide p-2`}
          >
            <div className="absolute top-0 left-0 bg-gray-800 px-3 py-2 rounded-t-xl flex justify-between items-center cursor-pointer max-md:px-4 w-full">
              <span
                className={`text-sm ${
                  activeProject != null ? "max-md:ml-4" : ""
                } `}
              >
                info.md
              </span>
              <FaWindowClose
                onClick={() => setReadmeClicked(null)}
                className="text-red-500 cursor-pointer hover:text-red-800"
              />
            </div>
            {/* TODO: Solucionar el problema del scroll */}
            <div className="w-full h-full overflow-y-auto scrollbar-hide">
              <DescriptionProjectDesktop
                content={readmeClicked.description}
                isOn={isOn}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logoImage from "../assets/code-brackets-icon.svg";
import {
  HomeIcon,
  UserCircleIcon,
  TrophyIcon,
  CommandLineIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";

const navigationItems = [
  {
    name: "Inicio",
    href: "#home",
    current: true,
    image: <HomeIcon className="text-myColor w-5 h-5" />,
  },
  {
    name: "Tecnologías",
    href: "#technologies",
    current: false,
    image: <CommandLineIcon className="text-myColor w-5 h-5" />,
  },
  {
    name: "Proyectos",
    href: "#projects",
    current: false,
    image: <TrophyIcon className="text-myColor w-5 h-5" />,
  },
  {
    name: "Sobre mí",
    href: "#about",
    current: false,
    image: <UserCircleIcon className="text-myColor w-5 h-5" />,
  },
  {
    name: "Contacto",
    href: "#contact",
    current: false,
    image: <PhoneIcon className="text-myColor w-5 h-5" />,
  },
];

function NavBar({scrollData}) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentNavigation, setNavigation] = useState(navigationItems);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleNavBar = () => {
    setIsNavOpen(true);
  };

  const handleCloseNavBar = () => {
    setIsNavOpen(false);
  };

  // Actualiza el estado de navegación al hacer click en un enlace.
  const handleScrollToSection = (e) => {
    const sectionName = e.target.textContent;
    setNavigation(
      currentNavigation.map((navItem) =>
        navItem.name === sectionName
          ? { ...navItem, current: true }
          : { ...navItem, current: false }
      )
    );
    setIsNavOpen(false);
  };

  // IntersectionObserver para actualizar el item activo según la sección visible.
  useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (!mainContainer) return;
    const sectionElements = currentNavigation.map((item) =>
      document.querySelector(item.href)
    );
    const observerOptions = {
      root: mainContainer,
      threshold: 0.5,
    };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute("id");
          setNavigation((prevNav) =>
            prevNav.map((item) => ({
              ...item,
              current: item.href === `#${activeId}`,
            }))
          );
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sectionElements.forEach((section) => {
      if (section) observer.observe(section);
    });
    return () => {
      observer.disconnect();
    };
  }, [currentNavigation]);

  return (
    <div
      className={`flex flex-row justify-between sticky top-8 left-1/2  w-full h-auto px-5 py-2 transition-all duration-300 backdrop-blur-md shadow-lg  z-[100] max-sm:w-[100%] max-sm:-translate-x-[5%]  ${
        scrollData > 0
          ? "bg-gradient-to-r from-gray-800/80 to-gray-900/80"
          : "bg-gradient-to-r from-gray-800 to-gray-900"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-x-2 p-1 max-sm:ml-3">
        <img
          className="h-9 w-[50px] object-cover rounded-full opacity-90 sm:hidden lg:block"
          src={logoImage}
          alt="logo-image.png"
        />
        <h1 className="text-gray-300 text-lg hidden sm:block px-3 font-semibold sm:text-xs lg:text-2xl lg:ml-0 sm:ml-5">
          MiguelDev
        </h1>
      </div>

      {/* Icono de hamburguesa para mobile */}
      <Bars3Icon
        onClick={handleNavBar}
        className="w-8 flex sm:hidden text-white cursor-pointer mr-4"
      />

      {/* Menú de navegación */}
      <div
        className={`flex flex-col sm:flex-row items-center transition-transform duration-300 ease-in-out absolute sm:static top-0 left-0 w-full sm:w-auto p-4 sm:p-0 ${
          isNavOpen ? "translate-y-0" : "-translate-y-full"
        } sm:translate-y-0 bg-gray-900 sm:bg-transparent`}
      >
        <div className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-5 text-center items-center ">
          {currentNavigation.map((item) => (
            <div key={item.name} className="flex items-center">
              <a
                onClick={(e) => handleScrollToSection(e)}
                href={item.href}
                className={`transition-colors duration-300 px-4 py-2 rounded-full text-sm sm:text-[1.5vw] lg:text-[1vw] ${
                  item.current
                    ? "font-bold text-white bg-gray-500"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {item.name}
              </a>
            </div>
          ))}
        </div>

        {/* Icono de cerrar en mobile */}
        <div
          onClick={handleCloseNavBar}
          className="flex sm:hidden mt-4 bg-red-500 hover:bg-red-700 p-1 rounded-full"
        >
          <XMarkIcon className="w-6 h-6 text-white cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

export default NavBar;

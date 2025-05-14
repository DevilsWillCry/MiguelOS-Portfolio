import React, { useEffect } from 'react';

const ParticlesComponent = () => {
  useEffect(() => {
    // Función para inicializar particles.js
    const initParticles = () => {
      if (window.particlesJS) {
        window.particlesJS('particles-js', {
          "particles": {
            "number": {
              "value": 80,
              "density": {
                "enable": true,
                "value_area": 800
              }
            },
            "color": { "value": "#ffffff" },
            "shape": {
              "type": "circle",
              "stroke": { "width": 0, "color": "#000000" },
              "polygon": { "nb_sides": 5 },
              "image": { "src": "img/github.svg", "width": 100, "height": 100 }
            },
            "opacity": {
              "value": 0.5,
              "random": false,
              "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false }
            },
            "size": {
              "value": 3,
              "random": true,
              "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false }
            },
            "line_linked": {
              "enable": true,
              "distance": 150,
              "color": "#ffffff",
              "opacity": 0.4,
              "width": 1
            },
            "move": {
              "enable": true,
              "speed": 6,
              "direction": "none",
              "random": false,
              "straight": false,
              "out_mode": "out",
              "bounce": false,
              "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 }
            }
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": {
              "onhover": { "enable": true, "mode": "repulse" },
              "onclick": { "enable": true, "mode": "push" },
              "resize": true
            },
            "modes": {
              "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
              "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
              "repulse": { "distance": 200, "duration": 0.4 },
              "push": { "particles_nb": 4 },
              "remove": { "particles_nb": 2 }
            }
          },
          "retina_detect": true
        });
      }
    };

    // Carga de particles.js (si aún no está cargado)
    if (typeof window.particlesJS === 'undefined') {
      const particlesScript = document.createElement('script');
      // Usar HTTPS para evitar Mixed Content
      particlesScript.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      particlesScript.async = true;
      particlesScript.onload = initParticles;
      document.body.appendChild(particlesScript);
    } else {
      initParticles();
    }

    // Función para inicializar stats.js y actualizar el contador de partículas
    const initStats = () => {
      const stats = new window.Stats();
      stats.setMode(0);
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      document.body.appendChild(stats.domElement);

      const countParticlesElement = document.querySelector('.js-count-particles');
      const update = () => {
        stats.begin();
        stats.end();
        if (
          window.pJSDom &&
          window.pJSDom[0] &&
          window.pJSDom[0].pJS &&
          window.pJSDom[0].pJS.particles &&
          window.pJSDom[0].pJS.particles.array
        ) {
          countParticlesElement.innerText = window.pJSDom[0].pJS.particles.array.length;
        }
        requestAnimationFrame(update);
      };
      update();
    };

    // Carga de stats.js (si aún no está cargado)
    if (typeof window.Stats === 'undefined') {
      const statsScript = document.createElement('script');
      // Usar HTTPS para evitar Mixed Content
      statsScript.src = 'https://threejs.org/examples/js/libs/stats.min.js';
      statsScript.async = true;
      statsScript.onload = initStats;
      document.body.appendChild(statsScript);
    } else {
      initStats();
    }
  }, []);

  return (
    <>
      {/* Contenedor de particles.js */}
      <div
        id="particles-js"
        style={{
          position: 'fixed',
          width: '100%',
          height: `${(87+4)*4}vh`,
          backgroundColor: '#070707',
          backgroundImage: 'url("")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: '50% 50%'
        }}
      ></div>
    </>
  );
};

export default ParticlesComponent;

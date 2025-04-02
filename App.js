document.addEventListener("DOMContentLoaded", () => {
  const iniciarJuegoBtn = document.getElementById("iniciarJuego");
  const disparoBtn = document.getElementById("disparo");
  const verRankingBtn = document.getElementById("verRanking");
  const climaElemento = document.getElementById("clima");
  const mapaJuego = document.getElementById("mapaJuego");

  const inicioPantalla = document.getElementById("inicio");
  const juegoPantalla = document.getElementById("juego");
  const finalPantalla = document.getElementById("final");
  const paisSelect = document.getElementById("pais");
  //const flagContainer = document.getElementById("flag-container");
  //const selectedFlag = document.getElementById("selected-flag");

  // Cargar los países desde la API
  fetch("http://127.0.0.1:5000/countries")
    .then(response => response.json())
    .then(data => {
      paisSelect.innerHTML = ""; // se limpia la informacion
      data.forEach(pais => {
        const option = document.createElement("option");
        option.value = Object.keys(pais)[0];
        option.textContent = pais[option.value];
        paisSelect.appendChild(option);
      });
    })
      .catch(error => {
        console.error("Error al cargar países:", error);
      });

  // Función para iniciar el juego
  iniciarJuegoBtn.addEventListener("click", () => {
    const nickname = document.getElementById("nickname").value;
    const pais = document.getElementById("pais").value;
    const ubicacion = document.getElementById("ubicacion").value;

    if (nickname && pais && ubicacion) {
      // Mostrar pantalla de juego
      inicioPantalla.classList.remove("active");
      juegoPantalla.classList.add("active");

      // Cargar mapa y clima
      crearMapa(10, 10);
      obtenerClima(ubicacion); // Usar la ubicación ingresada por el usuario
    } else {
      alert("Por favor, ingresa tu nombre, país y ubicación.");
    }
  });

  // Crear un mapa de juego dinámico (10x10)
  function crearMapa(filas, columnas) {
    mapaJuego.innerHTML = "";
    for (let i = 0; i < filas * columnas; i++) {
      const div = document.createElement("div");
      div.addEventListener("click", () => manejarDisparo(i));
      mapaJuego.appendChild(div);
    }
  }

  // Manejar el disparo
  function manejarDisparo(celda) {
    console.log("Disparo en la celda:", celda);
    const celdas = mapaJuego.children;
    if (Math.random() > 0.5) {
      celdas[celda].classList.add("hit");
    } else {
      celdas[celda].classList.add("miss");
    }
  }

  // Obtener datos climáticos con la API
  function obtenerClima(ciudad) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=be129bbfed895b76701dd13490560118`)
      .then(response => response.json())
      .then(data => {
        // Verificacion existencia de de data.weather 
        if (data.weather && data.weather.length > 0) {
          const clima = data.weather[0].description;
          climaElemento.textContent = `Clima: ${clima}`;
        } else {
          climaElemento.textContent = 'Clima: Información no disponible';
          console.log('Datos recibidos:', data); // Para depuración
        }
      })
      .catch(error => {
        console.error("Error al obtener clima:", error);
      });
      
  }

  // Al finalizar la partida
  disparoBtn.addEventListener("click", () => {
    juegoPantalla.classList.remove("active");
    finalPantalla.classList.add("active");
  });

  // Función para ver el ranking
  verRankingBtn.addEventListener("click", () => {
    alert("Aquí mostraríamos el ranking");
  });

})


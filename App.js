document.addEventListener("DOMContentLoaded", () => {
  const iniciarJuegoBtn = document.getElementById("iniciarJuego");
  const disparoBtn = document.getElementById("disparo");
  const verRankingBtn = document.getElementById("verRanking");
  const climaElemento = document.getElementById("clima");
  const mapaJuego = document.getElementById("mapaJuego"); // Elemento DOM
  let mapaJuegoData = []; // Datos del Juego (modelo)

  const inicioPantalla = document.getElementById("inicio");
  const juegoPantalla = document.getElementById("juego");
  const finalPantalla = document.getElementById("final");
  const paisSelect = document.getElementById("pais");
  //const flagContainer = document.getElementById("flag-container");
  //const selectedFlag = document.getElementById("selected-flag");

  //Declaracion de filas y columnas globalmente 
  let filas, columnas;

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

  // Inicialización del mapa
  function inicializarMapa() {
    mapaJuegoData = []; // Reiniciar el array
    for (let i = 0; i < filas; i++) {
      mapaJuegoData[i] = [];
      for (let j = 0; j < columnas; j++) {
        mapaJuegoData[i][j] = "agua";
      }
    }
  }
  //inicializarMapa();  // Llamamos a la función para inicializar el mapa

  // Colocar los barcos de manera aleatoria (IA)
  function colocarBarcosIA() {
    let barcos = 5;  // Número de barcos de la IA
    while (barcos > 0) {
      let fila = Math.floor(Math.random() * filas);
      let columna = Math.floor(Math.random() * columnas);

      if (mapaJuegoData[fila][columna] === "agua") {
        mapaJuegoData[fila][columna] = "barco";  // Coloca el barco
        barcos--;
      }
    }
  }

  // Colocar los barcos del jugador (también aleatorio por ahora)
  function colocarBarcosJugador() {
    let barcos = 5;  // Número de barcos del jugador
    while (barcos > 0) {
      let fila = Math.floor(Math.random() * filas);
      let columna = Math.floor(Math.random() * columnas);

      if (mapaJuegoData[fila][columna] === "agua") {
        mapaJuegoData[fila][columna] = "barco";  // Coloca el barco
        barcos--;
      }
    }
  }

  // Función para realizar disparos
  function disparar(fila, columna, esIA) {
    if (mapaJuego[fila][columna] === "barco") {
      console.log(esIA ? "La IA ha acertado!" : "¡El jugador ha acertado!");
      mapaJuegoData[fila][columna] = "golpe"; // Marcamos el barco como golpeado
      // Actualiza la vista
      actualizarVistaMapa(fila, columna, "hit");
    } else {
      console.log(esIA ? "La IA ha fallado." : "¡El jugador ha fallado!");
      mapaJuegoData[fila][columna] = "agua"; // Marcamos el disparo como fallido
      // Actualiza la vista
      actualizarVistaMapa(fila, columna, "miss");
    }
  }

  let disparosHechos = [];  // Para registrar las celdas que la IA ya ha disparado

  function actualizarVistaMapa(fila, columna, estado) {
    const indice = fila * columnas + columna;
    const celdas = mapaJuego.children;
    celdas[indice].classList.add(estado); // "hit" o "miss"
  }

  // Función para que la IA haga jugadas inteligentes
  function hacerJugadaMaquina() {
    let celda = elegirCelda();
    
    // Marcar la celda como disparada
    disparosHechos.push(celda);
    
    // Convertir el número de la celda a fila y columna
    let fila = Math.floor(celda / columnas);
    let columna = celda % columnas;
    
    // Realizar el disparo
    disparar(fila, columna, true);  // true porque es la IA
    
    // Si la IA acierta, buscar celdas cercanas
    if (mapaJuegoData[fila][columna] === "golpe") {
      buscarCercanias(celda);
    }
  }

  // Elegir una celda aleatoria que no haya sido disparada
  function elegirCelda() {
    let celda;
    do {
      celda = Math.floor(Math.random() * (filas * columnas));  // Elegir celda aleatoria
    } while (disparosHechos.includes(celda));  // Evitar disparar en celdas ya disparadas
    return celda;
  }

  // Buscar celdas cercanas después de un acierto
  function buscarCercanias(celda) {
    let celdasAdyacentes = [
      celda - 1, celda + 1, celda - columnas, celda + columnas
    ];

    celdasAdyacentes = celdasAdyacentes.filter(celda => 
      !disparosHechos.includes(celda) && celda >= 0 && celda < filas * columnas);
    
    if (celdasAdyacentes.length > 0) {
      let celdaCercana = celdasAdyacentes[Math.floor(Math.random() * celdasAdyacentes.length)];
      disparosHechos.push(celdaCercana);
      let fila = Math.floor(celdaCercana / columnas);
      let columna = celdaCercana % columnas;
      console.log(`La IA disparó a la celda cercana: ${fila}, ${columna}`);
      disparar(fila, columna, true);
    }
  }

  // Función para iniciar el juego
  iniciarJuegoBtn.addEventListener("click", () => {
    const nickname = document.getElementById("nickname").value;
    const pais = document.getElementById("pais").value;
    const ubicacion = document.getElementById("ubicacion").value;

    // Obtener las filas y columnas desde los inputs
     filas = parseInt(document.getElementById("rows").value);
     columnas = parseInt(document.getElementById("cols").value);

    if (nickname && pais && ubicacion) {
      // Mostrar pantalla de juego
      inicioPantalla.classList.remove("active");
      juegoPantalla.classList.add("active");

      // Inicializar mapa y colocar los barcos
      inicializarMapa();
      crearMapa(filas, columnas); // Crear la representación visual
      colocarBarcosJugador(filas, columnas);  // Coloca los barcos del jugador
      colocarBarcosIA(filas, columnas);       // Coloca los barcos de la IA

      // Cargar clima y empezar el juego
      obtenerClima(ubicacion);
    } else {
      alert("Por favor, ingresa tu nombre, país y ubicación.");
    }
  });

  // Crear un mapa de juego dinámico (10x10)
  function crearMapa(filas, columnas) {
    mapaJuego.innerHTML = ""; // Limpiar el mapa antes de crear uno nuevo
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
    hacerJugadaMaquina();  // La IA hace su jugada después del jugador
  }

  // Obtener datos climáticos con la API
  function obtenerClima(ciudad) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=be129bbfed895b76701dd13490560118`)
      .then(response => response.json())
      .then(data => {
        // Verificación de existencia de data.weather
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

});

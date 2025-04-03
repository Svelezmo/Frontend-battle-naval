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
  let disparosHechos = [];  // Para registrar las celdas que la IA ya ha disparado
  let barcosJugador = 5;    // Número de barcos del jugador
  let barcosIA = 5;         // Número de barcos de la IA

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
    // Reiniciar variables de juego
    disparosHechos = [];
    barcosJugador = 5;
    barcosIA = 5;
  }

  // Colocar los barcos de manera aleatoria (IA)
  function colocarBarcosIA() {
    let barcos = 5;  // Número de barcos de la IA
    while (barcos > 0) {
      let fila = Math.floor(Math.random() * filas);
      let columna = Math.floor(Math.random() * columnas);

      if (mapaJuegoData[fila][columna] === "agua") {
        mapaJuegoData[fila][columna] = "barcoIA";  // Coloca el barco de la IA
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
        mapaJuegoData[fila][columna] = "barcoJugador";  // Coloca el barco del jugador
        barcos--;
      }
    }
  }

  // Función para realizar disparos
  function disparar(fila, columna, esIA) {
    if (esIA) {
      // IA dispara a barcos del jugador
      if (mapaJuegoData[fila][columna] === "barcoJugador") {
        console.log("La IA ha acertado!");
        mapaJuegoData[fila][columna] = "golpeJugador"; // Marcamos el barco del jugador como golpeado
        actualizarVistaMapa(fila, columna, "hitIA");
        barcosJugador--;
        if (barcosJugador <= 0) {
          finalizarJuego(false); // El jugador pierde
        }
      } else if (mapaJuegoData[fila][columna] !== "golpeJugador" && mapaJuegoData[fila][columna] !== "agua_disparada") {
        console.log("La IA ha fallado.");
        mapaJuegoData[fila][columna] = "agua_disparada";
        actualizarVistaMapa(fila, columna, "missIA");
      }
    } else {
      // Jugador dispara a barcos de la IA
      if (mapaJuegoData[fila][columna] === "barcoIA") {
        console.log("¡El jugador ha acertado!");
        mapaJuegoData[fila][columna] = "golpeIA"; // Marcamos el barco de la IA como golpeado
        actualizarVistaMapa(fila, columna, "hit");
        barcosIA--;
        if (barcosIA <= 0) {
          finalizarJuego(true); // El jugador gana
        }
      } else if (mapaJuegoData[fila][columna] !== "golpeIA" && mapaJuegoData[fila][columna] !== "agua_disparada") {
        console.log("¡El jugador ha fallado!");
        mapaJuegoData[fila][columna] = "agua_disparada";
        actualizarVistaMapa(fila, columna, "miss");
      }
    }
  }

  function finalizarJuego(jugadorGana) {
    juegoPantalla.classList.remove("active");
    finalPantalla.classList.add("active");
    
    const mensajeResultado = document.getElementById("mensajeResultado");
    if (mensajeResultado) {
      mensajeResultado.textContent = jugadorGana ? "¡Has ganado!" : "Has perdido";
    }
  }

  function actualizarVistaMapa(fila, columna, estado) {
    const indice = fila * columnas + columna;
    const celdas = mapaJuego.children;
    if (indice >= 0 && indice < celdas.length) {
      celdas[indice].classList.add(estado); // "hit", "miss", "hitIA", "missIA"
    }
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
    if (mapaJuegoData[fila][columna] === "golpeJugador") {
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
    filas = parseInt(document.getElementById("rows").value) || 10;
    columnas = parseInt(document.getElementById("cols").value) || 10;

    if (nickname && pais && ubicacion) {
      // Mostrar pantalla de juego
      inicioPantalla.classList.remove("active");
      juegoPantalla.classList.add("active");

      // Inicializar mapa y colocar los barcos
      inicializarMapa();
      crearMapa(filas, columnas); // Crear la representación visual
      colocarBarcosJugador();  // Coloca los barcos del jugador
      colocarBarcosIA();       // Coloca los barcos de la IA

      // Depuración: mostrar barcos en consola
      console.log("Mapa inicializado:", mapaJuegoData);

      // Cargar clima y empezar el juego
      obtenerClima(ubicacion);
    } else {
      alert("Por favor, ingresa tu nombre, país y ubicación.");
    }
  });

  // Crear un mapa de juego dinámico
  function crearMapa(filas, columnas) {
    mapaJuego.innerHTML = ""; // Limpiar el mapa antes de crear uno nuevo
    mapaJuego.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
    mapaJuego.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
    
    for (let i = 0; i < filas * columnas; i++) {
      const div = document.createElement("div");
      div.className = "celda";
      div.dataset.index = i;
      div.addEventListener("click", () => manejarDisparo(i));
      mapaJuego.appendChild(div);
    }
  }

  // Manejar el disparo del jugador
  function manejarDisparo(celda) {
    console.log("Disparo en la celda:", celda);
    const fila = Math.floor(celda / columnas);
    const columna = celda % columnas;
    
    // Verificar si la celda ya ha sido disparada
    if (mapaJuegoData[fila][columna] === "golpeIA" || 
        mapaJuegoData[fila][columna] === "agua_disparada") {
      console.log("Esta celda ya ha sido disparada");
      return;
    }
    
    // Realizar el disparo
    disparar(fila, columna, false); // false porque es el jugador
    
    // Solo hacemos jugada de la máquina si el juego no ha terminado
    if (barcosIA > 0 && barcosJugador > 0) {
      setTimeout(() => {
        hacerJugadaMaquina();
      }, 500); // Pequeño delay para mejor experiencia de usuario
    }
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
        climaElemento.textContent = 'Clima: Error al cargar datos';
      });
  }

  // Al finalizar la partida manualmente
  disparoBtn.addEventListener("click", () => {
    finalizarJuego(false);
  });

  // Función para ver el ranking
  verRankingBtn.addEventListener("click", () => {
    alert("Aquí mostraríamos el ranking");
  });
});
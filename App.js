document.addEventListener("DOMContentLoaded", () => {
  // Elementos principales de navegación
  const iniciarJuegoBtn = document.getElementById("iniciarJuego");
  const disparoBtn = document.getElementById("disparo");
  const verRankingBtn = document.getElementById("verRanking");
  const jugarDeNuevoBtn = document.getElementById("jugar-de-nuevo");
  const reiniciarColocacionBtn = document.getElementById("reiniciarColocacion");
  const confirmarColocacionBtn = document.getElementById("confirmarColocacion");
  
  // Elementos informativos
  const climaElemento = document.getElementById("clima");
  const barcosRestantesElemento = document.getElementById("barcos-restantes");
  const barcosPorColocarElemento = document.getElementById("barcos-por-colocar");
  const barcosDestruidosElemento = document.getElementById("barcos-destruidos");
  const disparosTotalesElemento = document.getElementById("disparos-totales");
  
  // Elementos del tablero
  const mapaJuego = document.getElementById("mapaJuego");
  const mapaColocacion = document.getElementById("mapaColocacion");
  let mapaJuegoData = []; // Datos del Juego (modelo)

  // Pantallas del juego
  const inicioPantalla = document.getElementById("inicio");
  const colocarBarcosPantalla = document.getElementById("colocarBarcos");
  const juegoPantalla = document.getElementById("juego");
  const finalPantalla = document.getElementById("final");
  
  // Elementos del formulario
  const paisSelect = document.getElementById("pais");
  const flagContainer = document.getElementById("flag-container");
  const selectedFlag = document.getElementById("selected-flag");

  // Configuración de barcos
  const tiposBarcos = [
    { tipo: "portaaviones", tamaño: 6, cantidad: 1 },
    { tipo: "submarino", tamaño: 2, cantidad: 1 },
    { tipo: "acorazado", tamaño: 2, cantidad: 1 },
    { tipo: "destructor", tamaño: 4, cantidad: 1 },
    { tipo: "crucero", tamaño: 3, cantidad: 1 },
    { tipo: "buque", tamaño: 3, cantidad: 1 }
  ];

   // Variables del juego
   let filas, columnas;
   let disparosHechos = [];  // Para registrar las celdas que la IA ya ha disparado
   let barcosJugador = 0;    // Se calculará en función de los barcos colocados
   let barcosIA = 0;         // Se calculará en función de los barcos colocados
   let disparosTotales = 0;  // Contador de disparos del jugador
   let barcosDestruidos = 0; // Contador de barcos destruidos
   let barcoSeleccionado = null;
   let orientacionSeleccionada = "horizontal";
   let barcosPorColocar = [...tiposBarcos]; // Copia de los barcos para colocar
   let barcosColocados = []; // Para almacenar la posición de los barcos colocados

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
      
      // Actualizar la bandera al cargar
      actualizarBandera(paisSelect.value);
    })
    .catch(error => {
      console.error("Error al cargar países:", error);
      // Añadir algunos países por defecto en caso de error
      const paisesPorDefecto = [
        { "CO": "Colombia" },
        { "US": "Estados Unidos" },
        { "ES": "España" },
        { "MX": "México" }
      ];
      
      paisesPorDefecto.forEach(pais => {
        const option = document.createElement("option");
        option.value = Object.keys(pais)[0];
        option.textContent = pais[option.value];
        paisSelect.appendChild(option);
      });
    });
    
  // Evento para actualizar la bandera cuando cambia el país seleccionado
  paisSelect.addEventListener("change", () => {
    actualizarBandera(paisSelect.value);
  });
  
  // Función para actualizar la bandera según el país seleccionado
  function actualizarBandera(codigoPais) {
    if (selectedFlag) {
      selectedFlag.src = `https://flagsapi.com/${codigoPais}/flat/64.png`;
      selectedFlag.alt = `Bandera de ${paisSelect.options[paisSelect.selectedIndex].textContent}`;
    }
  }

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
    disparosTotales = 0;
    barcosDestruidos = 0;
    
    // Actualizar los contadores en pantalla
    if (barcosRestantesElemento) {
      barcosRestantesElemento.textContent = barcosIA;
    }
  }

  // Colocar los barcos de manera aleatoria (IA)
  function colocarBarcosIA() {
    barcosIA = 0; // Reiniciamos el contador
    
    // Para cada tipo de barco en la configuración
    for (const barco of tiposBarcos) {
      for (let i = 0; i < barco.cantidad; i++) {
        let colocado = false;
        while (!colocado) {
          const orientacion = Math.random() < 0.5 ? "horizontal" : "vertical";
          const fila = Math.floor(Math.random() * filas);
          const columna = Math.floor(Math.random() * columnas);
          
          // Comprobar si el barco cabe en el tablero
          if (orientacion === "horizontal" && columna + barco.tamaño > columnas) {
            continue;
          }
          if (orientacion === "vertical" && fila + barco.tamaño > filas) {
            continue;
          }
          
          // Comprobar si las celdas están libres
          let libre = true;
          if (orientacion === "horizontal") {
            for (let j = 0; j < barco.tamaño; j++) {
              if (mapaJuegoData[fila][columna + j] !== "agua") {
                libre = false;
                break;
              }
            }
          } else { // vertical
            for (let j = 0; j < barco.tamaño; j++) {
              if (mapaJuegoData[fila + j][columna] !== "agua") {
                libre = false;
                break;
              }
            }
          }
          
          // Si las celdas están libres, colocar el barco
          if (libre) {
            if (orientacion === "horizontal") {
              for (let j = 0; j < barco.tamaño; j++) {
                mapaJuegoData[fila][columna + j] = "barcoIA";
              }
            } else { // vertical
              for (let j = 0; j < barco.tamaño; j++) {
                mapaJuegoData[fila + j][columna] = "barcoIA";
              }
            }
            barcosIA += barco.tamaño; // Incrementamos el contador de celdas con barcos
            colocado = true;
          }
        }
      }
    }
  }

  // Colocar los barcos del jugador de manera automática
  function colocarBarcosJugadorAuto() {
    barcosJugador = 0; // Reiniciamos el contador
    
    // Para cada tipo de barco en la configuración
    for (const barco of tiposBarcos) {
      for (let i = 0; i < barco.cantidad; i++) {
        let colocado = false;
        while (!colocado) {
          const orientacion = Math.random() < 0.5 ? "horizontal" : "vertical";
          const fila = Math.floor(Math.random() * filas);
          const columna = Math.floor(Math.random() * columnas);
          
          // Comprobar si el barco cabe en el tablero
          if (orientacion === "horizontal" && columna + barco.tamaño > columnas) {
            continue;
          }
          if (orientacion === "vertical" && fila + barco.tamaño > filas) {
            continue;
          }
          
          // Comprobar si las celdas están libres
          let libre = true;
          if (orientacion === "horizontal") {
            for (let j = 0; j < barco.tamaño; j++) {
              if (mapaJuegoData[fila][columna + j] !== "agua") {
                libre = false;
                break;
              }
            }
          } else { // vertical
            for (let j = 0; j < barco.tamaño; j++) {
              if (mapaJuegoData[fila + j][columna] !== "agua") {
                libre = false;
                break;
              }
            }
          }
          
          // Si las celdas están libres, colocar el barco
          if (libre) {
            if (orientacion === "horizontal") {
              for (let j = 0; j < barco.tamaño; j++) {
                mapaJuegoData[fila][columna + j] = "barcoJugador";
              }
            } else { // vertical
              for (let j = 0; j < barco.tamaño; j++) {
                mapaJuegoData[fila + j][columna] = "barcoJugador";
              }
            }
            barcosJugador += barco.tamaño; // Incrementamos el contador de celdas con barcos
            colocado = true;
          }
        }
      }
    }
  }

  // Función para transferir los barcos colocados manualmente al mapa del juego
  function transferirBarcosColocados() {
    barcosJugador = 0;
    
    for (const barco of barcosColocados) {
      const { fila, columna, tamaño, orientacion } = barco;
      
      if (orientacion === "horizontal") {
        for (let j = 0; j < tamaño; j++) {
          mapaJuegoData[fila][columna + j] = "barcoJugador";
        }
      } else { // vertical
        for (let j = 0; j < tamaño; j++) {
          mapaJuegoData[fila + j][columna] = "barcoJugador";
        }
      }
      
      barcosJugador += tamaño;
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
      disparosTotales++;
      
      if (mapaJuegoData[fila][columna] === "barcoIA") {
        console.log("¡El jugador ha acertado!");
        mapaJuegoData[fila][columna] = "golpeIA"; // Marcamos el barco de la IA como golpeado
        actualizarVistaMapa(fila, columna, "hit");
        barcosIA--;
        barcosDestruidos++;
        
        // Actualizar el contador de barcos restantes
        if (barcosRestantesElemento) {
          barcosRestantesElemento.textContent = barcosIA;
        }
        
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
    ocultarTodasPantallas();
    finalPantalla.classList.add("active");
    
    const mensajeResultado = document.getElementById("mensajeResultado");
    if (mensajeResultado) {
      mensajeResultado.textContent = jugadorGana ? "¡Has ganado!" : "Has perdido";
    }
    
    // Actualizar estadísticas del juego
    if (barcosDestruidosElemento) {
      barcosDestruidosElemento.textContent = barcosDestruidos;
    }
    
    if (disparosTotalesElemento) {
      disparosTotalesElemento.textContent = disparosTotales;
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
  
  // Función para ocultar todas las pantallas
  function ocultarTodasPantallas() {
    inicioPantalla.classList.remove("active");
    colocarBarcosPantalla.classList.remove("active");
    juegoPantalla.classList.remove("active");
    finalPantalla.classList.remove("active");
  }

  // Función para iniciar el juego
  iniciarJuegoBtn.addEventListener("click", () => {
    const nickname = document.getElementById("nickname").value;
    const pais = document.getElementById("pais").value;
    const ubicacion = document.getElementById("ubicacion").value;
    const modoColocacion = document.querySelector('input[name="ship-placement"]:checked').value;

    // Obtener las filas y columnas desde los inputs
    filas = parseInt(document.getElementById("rows").value) || 10;
    columnas = parseInt(document.getElementById("cols").value) || 10;

    if (nickname && pais && ubicacion) {
      // Inicializar mapa
      inicializarMapa();
      
      if (modoColocacion === "auto") {
        // Modo automático: colocar barcos y empezar el juego
        ocultarTodasPantallas();
        juegoPantalla.classList.add("active");
        
        crearMapa(filas, columnas); // Crear la representación visual
        colocarBarcosJugadorAuto();  // Coloca los barcos del jugador
        colocarBarcosIA();       // Coloca los barcos de la IA
        
        // Cargar clima y empezar el juego
        obtenerClima(ubicacion);
      } else {
        // Modo manual: mostrar pantalla de colocación de barcos
        ocultarTodasPantallas();
        colocarBarcosPantalla.classList.add("active");
        
        // Reiniciar la colocación de barcos
        reiniciarColocacionBarcos();
        
        // Crear el mapa de colocación
        crearMapaColocacion(filas, columnas);
      }
      
      // Depuración: mostrar barcos en consola
      console.log("Mapa inicializado:", mapaJuegoData);
    } else {
      alert("Por favor, ingresa tu nombre, país y ubicación.");
    }
  });

  // Función para reiniciar la colocación de barcos
  function reiniciarColocacionBarcos() {
    barcoSeleccionado = null;
    barcosColocados = [];
    barcosPorColocar = [...tiposBarcos];
    
    // Actualizar la UI
    actualizarBarcosPorColocar();
    actualizarBarcosSeleccionables();
    
    // Desactivar el botón de confirmar
    confirmarColocacionBtn.disabled = true;
  }

   // Función para actualizar el contador de barcos por colocar
   function actualizarBarcosPorColocar() {
    if (barcosPorColocarElemento) {
      const totalBarcos = barcosPorColocar.reduce((sum, barco) => sum + barco.cantidad, 0);
      barcosPorColocarElemento.textContent = totalBarcos;
    }
  }

   // Función para actualizar los barcos seleccionables en la UI
   function actualizarBarcosSeleccionables() {
    const barcosUI = document.querySelectorAll(".barco-seleccion");
    
    barcosUI.forEach(barcoUI => {
      const tipo = barcoUI.dataset.tipo;
      const barcoInfo = barcosPorColocar.find(b => b.tipo === tipo);
      
      // Resetear clases
      barcoUI.classList.remove("selected", "placed");
      
      if (!barcoInfo || barcoInfo.cantidad === 0) {
        // Este barco ya se ha colocado completamente
        barcoUI.classList.add("placed");
      } else if (barcoSeleccionado && barcoSeleccionado.tipo === tipo) {
        // Este es el barco seleccionado actualmente
        barcoUI.classList.add("selected");
      }
    });
  }

  // Crear un mapa de colocación de barcos
  function crearMapaColocacion(filas, columnas) {
    mapaColocacion.innerHTML = ""; // Limpiar el mapa antes de crear uno nuevo
    mapaColocacion.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
    mapaColocacion.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
    
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const div = document.createElement("div");
        div.className = "celda";
        div.dataset.fila = i;
        div.dataset.columna = j;
        
        // Eventos para previsualizar la colocación
        div.addEventListener("mouseover", () => previsualizarColocacion(i, j));
        div.addEventListener("mouseout", limpiarPrevisualizacion);
        div.addEventListener("click", () => colocarBarco(i, j));
        
        mapaColocacion.appendChild(div);
      }
    }
  } 

   // Función para previsualizar la colocación de un barco
function previsualizarColocacion(fila, columna) {
  if (!barcoSeleccionado) return;
  
  // Limpiar previsualizaciones anteriores
  limpiarPrevisualizacion();
  
  const celdas = document.querySelectorAll("#mapaColocacion .celda");
  const valido = validarColocacion(fila, columna, barcoSeleccionado.tamaño, orientacionSeleccionada);
  
  // Marcar las celdas para la previsualización
  if (orientacionSeleccionada === "horizontal") {
    for (let j = 0; j < barcoSeleccionado.tamaño; j++) {
      if (columna + j < columnas) {
        const indice = fila * columnas + (columna + j);
        if (indice < celdas.length) {
          celdas[indice].classList.add(valido ? "preview-valid" : "preview-invalid");
        }
      }
    }
  } else { // vertical
    for (let i = 0; i < barcoSeleccionado.tamaño; i++) {
      if (fila + i < filas) {
        const indice = (fila + i) * columnas + columna;
        if (indice < celdas.length) {
          celdas[indice].classList.add(valido ? "preview-valid" : "preview-invalid");
        }
      }
    }
  }
}

// Función para limpiar la previsualización
function limpiarPrevisualizacion() {
  const celdas = document.querySelectorAll("#mapaColocacion .celda");
  celdas.forEach(celda => {
    celda.classList.remove("preview-valid", "preview-invalid");
  });
}

// Función para validar si un barco puede ser colocado en una posición
function validarColocacion(fila, columna, tamaño, orientacion) {
  // Verificar si el barco cabe en el tablero
  if (orientacion === "horizontal" && columna + tamaño > columnas) {
    return false;
  }
  if (orientacion === "vertical" && fila + tamaño > filas) {
    return false;
  }
  
  // Verificar si hay barcos ya colocados en esas posiciones
  for (const barcoColocado of barcosColocados) {
    const { fila: filaBarco, columna: columnaBarco, tamaño: tamañoBarco, orientacion: orientacionBarco } = barcoColocado;
    
    // Comprobar colisión con barcos colocados
    if (orientacion === "horizontal") {
      for (let j = 0; j < tamaño; j++) {
        if (orientacionBarco === "horizontal") {
          // Colisión horizontal-horizontal
          for (let k = 0; k < tamañoBarco; k++) {
            if (fila === filaBarco && columna + j === columnaBarco + k) {
              return false;
            }
          }
        } else {
          // Colisión horizontal-vertical
          for (let k = 0; k < tamañoBarco; k++) {
            if (fila === filaBarco + k && columna + j === columnaBarco) {
              return false;
            }
          }
        }
      }
    } else { // vertical
      for (let i = 0; i < tamaño; i++) {
        if (orientacionBarco === "horizontal") {
          // Colisión vertical-horizontal
          for (let k = 0; k < tamañoBarco; k++) {
            if (fila + i === filaBarco && columna === columnaBarco + k) {
              return false;
            }
          }
        } else {
          // Colisión vertical-vertical
          for (let k = 0; k < tamañoBarco; k++) {
            if (fila + i === filaBarco + k && columna === columnaBarco) {
              return false;
            }
          }
        }
      }
    }
  }
  
  return true;
}

// Función para colocar un barco
function colocarBarco(fila, columna) {
  if (!barcoSeleccionado) {
    alert("Selecciona un barco primero");
    return;
  }
  
  if (!validarColocacion(fila, columna, barcoSeleccionado.tamaño, orientacionSeleccionada)) {
    alert("No se puede colocar el barco en esa posición");
    return;
  }
  
  // Añadir el barco a la lista de barcos colocados
  barcosColocados.push({
    tipo: barcoSeleccionado.tipo,
    fila,
    columna,
    tamaño: barcoSeleccionado.tamaño,
    orientacion: orientacionSeleccionada
  });
  
  // Actualizar visualmente el mapa de colocación
  const celdas = document.querySelectorAll("#mapaColocacion .celda");
  if (orientacionSeleccionada === "horizontal") {
    for (let j = 0; j < barcoSeleccionado.tamaño; j++) {
      const indice = fila * columnas + (columna + j);
      if (indice < celdas.length) {
        celdas[indice].classList.add("barco-colocado");
      }
    }
  } else { // vertical
    for (let i = 0; i < barcoSeleccionado.tamaño; i++) {
      const indice = (fila + i) * columnas + columna;
      if (indice < celdas.length) {
        celdas[indice].classList.add("barco-colocado");
      }
    }
  }
  
  // Actualizar la cantidad de barcos por colocar
  const barcoIndex = barcosPorColocar.findIndex(b => b.tipo === barcoSeleccionado.tipo);
  if (barcoIndex !== -1) {
    barcosPorColocar[barcoIndex].cantidad--;
    if (barcosPorColocar[barcoIndex].cantidad <= 0) {
      barcosPorColocar.splice(barcoIndex, 1);
    }
  }
  
  // Resetear el barco seleccionado
  barcoSeleccionado = null;
  
  // Actualizar la UI
  actualizarBarcosPorColocar();
  actualizarBarcosSeleccionables();
  
  // Habilitar el botón de confirmar si todos los barcos han sido colocados
  if (barcosPorColocar.length === 0) {
    confirmarColocacionBtn.disabled = false;
  }
}

// Añadir funcionalidad para seleccionar barcos
function inicializarSeleccionBarcos() {
  const barcosUI = document.querySelectorAll(".barco-seleccion");
  
  barcosUI.forEach(barcoUI => {
    barcoUI.addEventListener("click", () => {
      const tipo = barcoUI.dataset.tipo;
      const barcoInfo = barcosPorColocar.find(b => b.tipo === tipo);
      
      if (barcoInfo && barcoInfo.cantidad > 0) {
        barcoSeleccionado = barcoInfo;
        actualizarBarcosSeleccionables();
      }
    });
  });
}

// Funcionalidad para cambiar la orientación
function inicializarBotonesColocacion() {
  const cambiarOrientacionBtn = document.getElementById("cambiarOrientacion");
  
  if (cambiarOrientacionBtn) {
    cambiarOrientacionBtn.addEventListener("click", () => {
      orientacionSeleccionada = orientacionSeleccionada === "horizontal" ? "vertical" : "horizontal";
      cambiarOrientacionBtn.textContent = `Orientación: ${orientacionSeleccionada}`;
    });
  }
  
  // Reiniciar colocación
  reiniciarColocacionBtn.addEventListener("click", () => {
    // Limpiar el mapa de colocación
    const celdas = document.querySelectorAll("#mapaColocacion .celda");
    celdas.forEach(celda => {
      celda.classList.remove("barco-colocado");
    });
    
    reiniciarColocacionBarcos();

    // Inicializar la selección de barcos y los botones de colocación
  inicializarSeleccionBarcos();
  inicializarBotonesColocacion();
  });
  
  // Confirmar colocación
  confirmarColocacionBtn.addEventListener("click", () => {
    if (barcosPorColocar.length > 0) {
      alert("Debes colocar todos los barcos antes de continuar");
      return;
    }
    
    // Inicializar el mapa del juego
    inicializarMapa();
    
    // Transferir los barcos colocados al mapa del juego
    transferirBarcosColocados();
    
    // Colocar los barcos de la IA
    colocarBarcosIA();
    
    // Cambiar a la pantalla de juego
    ocultarTodasPantallas();
    juegoPantalla.classList.add("active");
    
    // Crear el mapa visual del juego
    crearMapa(filas, columnas);
    
    // Obtener clima para la ubicación seleccionada
    const ubicacion = document.getElementById("ubicacion").value;
    obtenerClima(ubicacion);
  });
}



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
    climaElemento.textContent = 'Cargando información del clima...';
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=be129bbfed895b76701dd13490560118`)
      .then(response => response.json())
      .then(data => {
        // Verificación de existencia de data.weather
        if (data.weather && data.weather.length > 0) {
          const clima = data.weather[0].description;
          const temperatura = Math.round(data.main.temp - 273.15); // Convertir Kelvin a Celsius
          climaElemento.textContent = `${clima} (${temperatura}°C)`;
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

  // Al rendirse (finalizar la partida manualmente)
  disparoBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas rendirte?")) {
      finalizarJuego(false);
    }
  });

  // Función para ver el ranking
  verRankingBtn.addEventListener("click", () => {
    alert("Aquí mostraríamos el ranking");
    // En un futuro, se podría implementar una petición a la API para obtener el ranking
  });
  
  // Función para jugar de nuevo
  jugarDeNuevoBtn.addEventListener("click", () => {
    ocultarTodasPantallas();
    inicioPantalla.classList.add("active");
  });
});
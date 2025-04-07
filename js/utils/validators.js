/**
 * Funciones de validación para el juego de Batalla Naval
 */

// Constantes del juego según requerimientos
const MIN_BOARD_SIZE = 10;
const MAX_BOARD_SIZE = 20;
const SHIP_TYPES = {
  CARRIER: { size: 5, count: 1 },
  BATTLESHIP: { size: 4, count: 1 },
  CRUISER: { size: 3, count: 1 },
  SUBMARINE: { size: 3, count: 1 },
  DESTROYER: { size: 2, count: 1 }
};

// Constantes para la representación en el mapa exportable
const MAP_SYMBOLS = {
  WATER: "a",
  PLAYER: "p1",
  PLAYER_HIT: "p1-h",
  MACHINE: "p2",
  MACHINE_HIT: "p2-h",
  BOMB: "b"
};

/**
 * Valida el tamaño del tablero ingresado por el usuario
 * @param {number} rows - Número de filas
 * @param {number} cols - Número de columnas
 * @returns {boolean} - Verdadero si el tamaño es válido
 */
function isValidBoardSize(rows, cols) {
  return (
    Number.isInteger(rows) && 
    Number.isInteger(cols) &&
    rows >= MIN_BOARD_SIZE && 
    rows <= MAX_BOARD_SIZE && 
    cols >= MIN_BOARD_SIZE && 
    cols <= MAX_BOARD_SIZE
  );
}


/**
 * Valida si una coordenada está dentro del tablero
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} boardSize - Tamaño del tablero
 * @returns {boolean} - Verdadero si la coordenada es válida
 */
function isValidCoordinate(x, y, boardSize) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

/**
 * Valida si una posición en el tablero está ocupada
 * @param {Array} board - Matriz que representa el tablero
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {boolean} - Verdadero si la posición está libre
 */
function isCellFree(board, x, y) {
  return board[y][x] === null || board[y][x] === MAP_SYMBOLS.WATER;
}

// Función para validar la colocación de un barco
export function validateShipPlacement(board, ship, x, y, isVertical) {
  const shipSize = ship.size;

  // Verificar si el barco está dentro de los límites del tablero
  if (isVertical) {
    if (y + shipSize > board.length) return false; // Si se sale por el borde vertical
  } else {
    if (x + shipSize > board[0].length) return false; // Si se sale por el borde horizontal
  }

  // Verificar si hay superposición con otro barco
  for (let i = 0; i < shipSize; i++) {
    const checkX = isVertical ? x : x + i;
    const checkY = isVertical ? y + i : y;
    if (board[checkY][checkX] !== 'water') {
      return false; // Si ya hay algo en esa celda
    }
  }
  return true; // Si todo es válido
}

// Validar que las coordenadas sean correctas
export function validateCoordinates(x, y, board) {
  return x >= 0 && x < board[0].length && y >= 0 && y < board.length;
}


/**
 * Valida si un barco puede ser colocado en una posición específica
 * @param {Array} board - Matriz que representa el tablero
 * @param {number} x - Coordenada X inicial
 * @param {number} y - Coordenada Y inicial
 * @param {number} size - Tamaño del barco
 * @param {boolean} isHorizontal - Orientación del barco (horizontal o vertical)
 * @returns {boolean} - Verdadero si el barco puede ser colocado
 */
function canPlaceShip(board, x, y, size, isHorizontal) {
  const boardSize = board.length;
  
  // Verificar si el barco cabe en el tablero
  if (isHorizontal) {
    if (x + size > boardSize) return false;
  } else {
    if (y + size > boardSize) return false;
  }

  // Verificar si todas las celdas necesarias están libres
  // y si no hay barcos adyacentes (regla común en Batalla Naval)
  for (let i = -1; i <= size; i++) {
    for (let j = -1; j <= 1; j++) {
      let checkX = isHorizontal ? x + i : x + j;
      let checkY = isHorizontal ? y + j : y + i;
      
      // Si está fuera del tablero, continuamos
      if (!isValidCoordinate(checkX, checkY, boardSize)) continue;
      
      // Verificamos solo las celdas que ocupará el barco
      if (i >= 0 && i < size && j === 0) {
        if (!isCellFree(board, checkX, checkY)) return false;
      } 
      // Verificamos las celdas adyacentes (opcional, según tus reglas)
      else {
        if (board[checkY][checkX] !== MAP_SYMBOLS.WATER && 
            board[checkY][checkX] !== null) return false;
      }
    }
  }
  
  return true;
}

/**
 * Valida si un ataque es válido
 * @param {Array} shotBoard - Matriz de disparos realizados
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {boolean} - Verdadero si el ataque es válido
 */
function isValidShot(shotBoard, x, y) {
  const boardSize = shotBoard.length;
  
  // Verificar si la coordenada está dentro del tablero
  if (!isValidCoordinate(x, y, boardSize)) return false;
  
  // Verificar si ya se ha disparado a esta posición
  return shotBoard[y][x] === MAP_SYMBOLS.WATER || 
         shotBoard[y][x] === MAP_SYMBOLS.PLAYER || 
         shotBoard[y][x] === MAP_SYMBOLS.MACHINE || 
         shotBoard[y][x] === null;
}

/**
 * Verifica si una celda tiene barco enemigo adyacente
 * @param {Array} board - Matriz del tablero
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {boolean} isPlayerTurn - Verdadero si es turno del jugador
 * @returns {boolean} - Verdadero si hay barco enemigo adyacente
 */
function hasAdjacentEnemyShip(board, x, y, isPlayerTurn) {
  const boardSize = board.length;
  const enemySymbol = isPlayerTurn ? MAP_SYMBOLS.MACHINE : MAP_SYMBOLS.PLAYER;
  const enemyHitSymbol = isPlayerTurn ? MAP_SYMBOLS.MACHINE_HIT : MAP_SYMBOLS.PLAYER_HIT;
  
  // Verificar las 8 celdas adyacentes
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Saltamos la celda central (la que estamos evaluando)
      if (i === 0 && j === 0) continue;
      
      const adjX = x + i;
      const adjY = y + j;
      
      // Verificar si la coordenada adyacente está dentro del tablero
      if (!isValidCoordinate(adjX, adjY, boardSize)) continue;
      
      // Verificar si hay barco enemigo
      if (board[adjY][adjX] === enemySymbol || 
          board[adjY][adjX] === enemyHitSymbol) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Valida el nickname del jugador
 * @param {string} nickname - Nickname a validar
 * @returns {boolean} - Verdadero si el nickname es válido
 */
function isValidNickname(nickname) {
  // Nickname entre 3 y 20 caracteres alfanuméricos y guiones bajos
  const pattern = /^[a-zA-Z0-9_]{3,20}$/;
  return typeof nickname === 'string' && pattern.test(nickname);
}

/**
 * Valida el código de país
 * @param {string} countryCode - Código de país a validar
 * @returns {boolean} - Verdadero si el código de país es válido
 */
function isValidCountryCode(countryCode) {
  // Código de país de 2 caracteres alfabéticos (formato ISO)
  const pattern = /^[a-zA-Z]{2}$/;
  return typeof countryCode === 'string' && pattern.test(countryCode);
}

/**
 * Valida la estructura del mapa exportable
 * @param {Array} map - Mapa a validar
 * @param {number} size - Tamaño esperado del tablero
 * @returns {boolean} - Verdadero si el mapa tiene la estructura correcta
 */
function isValidExportMap(map, size) {
  // Verificar que sea un array de tamaño correcto
  if (!Array.isArray(map) || map.length !== size) return false;
  
  // Verificar que cada fila sea un array de tamaño correcto
  for (let i = 0; i < size; i++) {
    if (!Array.isArray(map[i]) || map[i].length !== size) return false;
    
    // Verificar que cada celda tenga un valor válido
    for (let j = 0; j < size; j++) {
      const validValues = [
        MAP_SYMBOLS.WATER,
        MAP_SYMBOLS.PLAYER,
        MAP_SYMBOLS.PLAYER_HIT,
        MAP_SYMBOLS.MACHINE,
        MAP_SYMBOLS.MACHINE_HIT,
        MAP_SYMBOLS.BOMB
      ];
      
      if (!validValues.includes(map[i][j])) return false;
    }
  }
  
  return true;
}

/**
 * Valida los datos del score para enviar al backend
 * @param {Object} scoreData - Datos del score
 * @returns {boolean} - Verdadero si los datos son válidos
 */
function isValidScoreData(scoreData) {
  return (
    typeof scoreData === 'object' &&
    isValidNickname(scoreData.nick_name) &&
    typeof scoreData.score === 'number' &&
    isValidCountryCode(scoreData.country_code)
  );
}

/**
 * Valida si una ubicación geográfica es válida
 * @param {string} location - Nombre de la ubicación
 * @returns {boolean} - Verdadero si la ubicación parece válida
 */
function isValidLocation(location) {
  // Verificar que la ubicación tenga al menos 2 caracteres y no contenga caracteres especiales
  const pattern = /^[a-zA-Z\s\-áéíóúÁÉÍÓÚüÜñÑ]{2,50}$/;
  return typeof location === 'string' && pattern.test(location);
}

/**
 * Valida si un juego ha terminado (todos los barcos de un jugador han sido hundidos)
 * @param {Array} board - Tablero de juego
 * @param {boolean} checkPlayer - Verdadero para verificar barcos del jugador, falso para la máquina
 * @returns {boolean} - Verdadero si todos los barcos han sido hundidos
 */
function isGameOver(board, checkPlayer) {
  const symbol = checkPlayer ? MAP_SYMBOLS.PLAYER : MAP_SYMBOLS.MACHINE;
  
  // Buscar si queda algún barco sin hundir
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === symbol) {
        return false; // Todavía hay barcos sin hundir
      }
    }
  }
  
  return true; // Todos los barcos han sido hundidos
}

/**
 * Calcula el puntaje basado en los aciertos y errores
 * @param {Object} gameStats - Estadísticas del juego
 * @returns {number} - Puntaje final
 */
function calculateScore(gameStats) {
  let score = 0;
  
  // Por cada acierto: +10 puntos
  score += gameStats.hits * 10;
  
  // Por cada error: -1 punto
  score -= gameStats.misses;
  
  // Por cada error adyacente a un barco enemigo: -3 puntos
  score -= gameStats.adjacentMisses * 3;
  
  return score;
} 

// validators.js
export function validateLocation(location) {
  // Lógica para validar la ubicación
  if (location && location.trim() !== '') {
    return true;
  }
  return false;
}



// Exportar todas las funciones de validación
export {
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE,
  SHIP_TYPES,
  MAP_SYMBOLS,
  isValidBoardSize,
  isValidCoordinate,
  isCellFree,
  canPlaceShip,
  isValidShot,
  hasAdjacentEnemyShip,
  isValidNickname,
  isValidCountryCode,
  isValidExportMap,
  isValidScoreData,
  isValidLocation,
  isGameOver,
  calculateScore
};
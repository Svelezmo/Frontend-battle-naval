// renderShips.js - Renderiza los barcos en el tablero
function renderShip(ship, board) {
    // Obtener las celdas ocupadas por el barco
    const shipCells = getOccupiedCells(ship, board);  // Debemos implementar esta función que obtiene las celdas ocupadas por el barco
  
    // Recorrer todas las celdas ocupadas y marcar las celdas correspondientes
    shipCells.forEach(cell => {
      const cellElement = document.getElementById('mapaJuego').children[cell.row * board.cols + cell.col];
      cellElement.classList.add('ship');  // Añadir la clase 'ship' para visualizar el barco
    });
  }
  
  /**
   * Obtener las celdas ocupadas por el barco según su posición
   * @param {Object} ship - El objeto barco que contiene el nombre y el tamaño.
   * @param {Object} board - El tablero donde se colocarán las celdas.
   * @returns {Array} - Un array de objetos de celdas ocupadas con las propiedades `row` y `col`.
   */
  function getOccupiedCells(ship, board) {
    const occupiedCells = [];
    
    // Asumimos que ship.position contiene las coordenadas iniciales (row, col) y ship.isVertical indica la orientación del barco
    const { row, col } = ship.position;
    const size = ship.size;
    const isVertical = ship.isVertical;
  
    // Si el barco es vertical, colocamos las celdas en esa dirección
    if (isVertical) {
      for (let i = 0; i < size; i++) {
        occupiedCells.push({ row: row + i, col });
      }
    } else {
      // Si el barco es horizontal, colocamos las celdas en esa dirección
      for (let i = 0; i < size; i++) {
        occupiedCells.push({ row, col: col + i });
      }
    }
  
    return occupiedCells;
  }
  
  export { renderShip };
  
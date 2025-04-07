// renderBoard.js - Renderiza el tablero del juego
import { renderShip } from './renderShips.js';
import { SHIP_TYPES } from './config.js';

class RenderBoard {
  constructor(gameController) {
    this.gameController = gameController;
  }

  // Renderiza el tablero del jugador
  renderPlayerBoard(board) {
    const playerBoardElement = document.getElementById('mapaJuego');  // Asegúrate de tener un elemento con esta id en el HTML
    playerBoardElement.innerHTML = '';  // Limpiar cualquier contenido anterior

    // Crear una celda para cada casilla del tablero
    for (let row = 0; row < board.rows; row++) {
      for (let col = 0; col < board.cols; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');  // Clase CSS para las celdas del tablero

        // Verificar el estado de la celda según los valores de 'a', 'p1', 'p2', 'b', etc.
        const cellState = board.grid[row][col];
        if (cellState === 'p1') {
          cell.classList.add('ship');
        } else if (cellState === 'p2') {
          cell.classList.add('ship');
        } else if (cellState === 'p1-h') {
          cell.classList.add('hit');
        } else if (cellState === 'p2-h') {
          cell.classList.add('hit');
        } else if (cellState === 'b') {
          cell.classList.add('miss');
        }

        // Agregar evento de clic para disparar
        cell.addEventListener('click', () => this.handleCellClick(row, col));

        playerBoardElement.appendChild(cell);  // Añadir la celda al tablero
      }
    }
  }

  // Maneja el clic de una celda, realizando un disparo
  handleCellClick(row, col) {
    this.gameController.game.fireAtCell(row, col);  // Realizar el disparo
    this.renderPlayerBoard(this.gameController.game.playerBoard);  // Actualizar la vista después de disparar
  }

  // Renderizar los barcos del jugador
  renderPlayerShips(board) {
    board.ships.forEach(ship => {
      renderShip(ship, board);  // Función de renderizado de barcos que se llama desde el archivo 'renderShips.js'
    });
  }

  // Renderiza la interfaz completa del tablero (incluye barcos, disparos, etc.)
  renderCompleteBoard(board) {
    this.renderPlayerBoard(board);  // Renderiza el tablero de juego
    this.renderPlayerShips(board);  // Renderiza los barcos del jugador
  }

  // Renderiza los datos del clima en el campo de batalla
  renderBattleWeather(weatherData) {
    const weatherElement = document.getElementById('clima');
    if (weatherData) {
      weatherElement.textContent = `Clima: ${weatherData.description}`;
    } else {
      weatherElement.textContent = 'Clima: Información no disponible';
    }
  }

  // Renderiza el puntaje y estado final
  renderFinalScore(score, winner) {
    const resultElement = document.getElementById('resultado');
    resultElement.textContent = `¡El ganador es ${winner}! Puntaje final: ${score}`;
  }
}

export function renderBoard(board) {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (board[row][col] !== 'water') {
        cell.classList.add(board[row][col]); // hit, miss, ship, etc.
      }
      boardElement.appendChild(cell);
    }
  }
}


export default RenderBoard;

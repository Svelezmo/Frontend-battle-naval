// js/controllers/BoardController.js
class BoardController {
    constructor(gameController) {
      this.gameController = gameController;
      this.playerBoardElement = document.getElementById('player-board');
      this.computerBoardElement = document.getElementById('computer-board');
      this.setupBoardElement = document.getElementById('setup-board');
      this.currentShipType = null;
      this.isVertical = false;
      this.setupMode = true;
    }
    
    initialize() {
      this.renderSetupBoard();
      this.setupEventListeners();
    }
    
    // Renderizar el tablero de configuración para colocar barcos
    renderSetupBoard() {
      const { rows, cols } = this.gameController.game.boardSize;
      
      this.setupBoardElement.innerHTML = '';
      this.setupBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cell = document.createElement('div');
          cell.classList.add('cell', 'setup-cell');
          cell.dataset.row = i;
          cell.dataset.col = j;
          
          // Eventos para colocar barcos
          cell.addEventListener('mouseover', (e) => this.handleCellHover(e, i, j));
          cell.addEventListener('mouseout', (e) => this.handleCellMouseOut(e, i, j));
          cell.addEventListener('click', (e) => this.handleSetupCellClick(e, i, j));
          
          this.setupBoardElement.appendChild(cell);
        }
      }
    }
    
    // Renderizar tableros de juego (jugador y computadora)
    renderGameBoards() {
      this.renderPlayerBoard();
      this.renderComputerBoard();
    }
    
    // Renderizar tablero del jugador
    renderPlayerBoard() {
      const { rows, cols } = this.gameController.game.boardSize;
      const board = this.gameController.game.playerBoard;
      
      this.playerBoardElement.innerHTML = '';
      this.playerBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cell = document.createElement('div');
          cell.classList.add('cell', 'player-cell');
          
          const cellData = board.grid[i][j];
          
          if (cellData.hasShip) {
            cell.classList.add('ship-cell');
            
            // Si el barco ha sido golpeado
            if (cellData.isHit) {
              cell.classList.add('hit');
            }
          } else if (cellData.isHit) {
            cell.classList.add('miss');
          }
          
          this.playerBoardElement.appendChild(cell);
        }
      }
    }
    
    // Renderizar tablero de la computadora
    renderComputerBoard() {
      const { rows, cols } = this.gameController.game.boardSize;
      const board = this.gameController.game.computerBoard;
      
      this.computerBoardElement.innerHTML = '';
      this.computerBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cell = document.createElement('div');
          cell.classList.add('cell', 'computer-cell');
          cell.dataset.row = i;
          cell.dataset.col = j;
          
          const cellData = board.grid[i][j];
          
          // Solo mostrar impactos y fallos, no mostrar los barcos de la computadora
          if (cellData.isHit) {
            if (cellData.hasShip) {
              cell.classList.add('hit');
            } else {
              cell.classList.add('miss');
            }
          } else {
            // Añadir evento de clic para disparar
            cell.addEventListener('click', (e) => this.handleAttackClick(e, i, j));
          }
          
          this.computerBoardElement.appendChild(cell);
        }
      }
    }
    
    // Actualizar tableros después de cada acción
    updateBoards() {
      this.renderPlayerBoard();
      this.renderComputerBoard();
    }
    
    // Manejar evento hover en celdas durante la configuración
    handleCellHover(event, row, col) {
      if (!this.currentShipType) return;
      
      const shipSize = this.currentShipType.size;
      const position = { row, col };
      const cells = this.getShipCells(position, shipSize, this.isVertical);
      
      // Verificar si se puede colocar el barco
      const canPlace = this.gameController.game.playerBoard.canPlaceShip(
        new Ship(this.currentShipType.name, this.currentShipType.size),
        position,
        this.isVertical
      );
      
      // Aplicar clases visuales apropiadas
      cells.forEach(cell => {
        if (cell) {
          cell.classList.add(canPlace ? 'valid-placement' : 'invalid-placement');
        }
      });
    }
    
    // Manejar evento mouseout en celdas durante la configuración
    handleCellMouseOut(event, row, col) {
      if (!this.currentShipType) return;
      
      const shipSize = this.currentShipType.size;
      const position = { row, col };
      const cells = this.getShipCells(position, shipSize, this.isVertical);
      
      // Quitar clases visuales
      cells.forEach(cell => {
        if (cell) {
          cell.classList.remove('valid-placement', 'invalid-placement');
        }
      });
    }
    
    // Manejar clic para colocar un barco
    handleSetupCellClick(event, row, col) {
      if (!this.currentShipType) {
        this.gameController.uiController.showMessage('Selecciona un tipo de barco primero', 'warning');
        return;
      }
      
      const ship = new Ship(this.currentShipType.name, this.currentShipType.size);
      const position = { row, col };
      
      // Intentar colocar el barco
      const placed = this.gameController.game.placePlayerShip(ship, position, this.isVertical);
      
      if (placed) {
        // Actualizar vista
        this.renderSetupBoard();
        this.showPlacedShips();
        
        // Decrementar contador de barcos disponibles
        this.gameController.uiController.updateShipSelection(this.currentShipType.name);
        
        // Verificar si todos los barcos fueron colocados
        if (this.allShipsPlaced()) {
          this.gameController.uiController.enableStartGameButton();
        }
        
        this.gameController.uiController.showMessage(`${this.currentShipType.name} colocado correctamente`, 'success');
      } else {
        this.gameController.uiController.showMessage('No se puede colocar el barco en esa posición', 'error');
      }
    }
    
    // Manejar clic para atacar
    handleAttackClick(event, row, col) {
      if (this.gameController.game.currentTurn !== this.gameController.game.player) {
        this.gameController.uiController.showMessage('Espera tu turno', 'warning');
        return;
      }
      
      const result = this.gameController.playerAttack({ row, col });
      
      if (result === null) {
        this.gameController.uiController.showMessage('Posición inválida o ya atacada', 'warning');
        return;
      }
      
      this.updateBoards();
      
      if (result.hit) {
        const message = result.sunk 
          ? `¡Hundiste un ${this.gameController.game.computerBoard.ships[result.shipId].name}!` 
          : '¡Impacto!';
        this.gameController.uiController.showMessage(message, 'success');
      } else {
        this.gameController.uiController.showMessage('¡Agua!', 'info');
      }
      
      // Actualizar puntuación
      this.gameController.uiController.updateScore(this.gameController.game.score);
    }
    
    // Obtener celdas para visualización de colocación de barcos
    getShipCells(position, size, isVertical) {
      const cells = [];
      const { row, col } = position;
      
      for (let i = 0; i < size; i++) {
        const cellRow = isVertical ? row + i : row;
        const cellCol = isVertical ? col : col + i;
        
        // Verificar que esté dentro de los límites
        if (cellRow >= 0 && cellRow < this.gameController.game.boardSize.rows &&
            cellCol >= 0 && cellCol < this.gameController.game.boardSize.cols) {
          const cellSelector = `.setup-cell[data-row="${cellRow}"][data-col="${cellCol}"]`;
          const cell = document.querySelector(cellSelector);
          cells.push(cell);
        } else {
          cells.push(null); // Fuera de límites
        }
      }
      
      return cells;
    }
    
    // Mostrar barcos ya colocados durante la configuración
    showPlacedShips() {
      const board = this.gameController.game.playerBoard;
      
      for (let i = 0; i < board.rows; i++) {
        for (let j = 0; j < board.cols; j++) {
          if (board.grid[i][j].hasShip) {
            const cellSelector = `.setup-cell[data-row="${i}"][data-col="${j}"]`;
            const cell = document.querySelector(cellSelector);
            if (cell) {
              cell.classList.add('ship-placed');
            }
          }
        }
      }
    }
    
    // Cambiar orientación de barcos
    toggleShipOrientation() {
      this.isVertical = !this.isVertical;
      return this.isVertical;
    }
    
    // Seleccionar tipo de barco para colocar
    selectShipType(shipType) {
      this.currentShipType = shipType;
    }
    
    // Verificar si todos los barcos fueron colocados
    allShipsPlaced() {
      return this.gameController.game.playerBoard.hasAllShipsPlaced(
        this.gameController.game.shipTypes
      );
    }
    
    // Configurar listeners de eventos
    setupEventListeners() {
      // Botón para cambiar orientación
      const rotateBtn = document.getElementById('rotate-ship');
      if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
          const isVertical = this.toggleShipOrientation();
          rotateBtn.textContent = isVertical ? 'Horizontal' : 'Vertical';
        });
      }
      
      // Selector de barcos
      const shipSelectors = document.querySelectorAll('.ship-selector');
      shipSelectors.forEach(selector => {
        selector.addEventListener('click', (e) => {
          const shipName = e.currentTarget.dataset.ship;
          const shipType = this.gameController.game.shipTypes.find(ship => ship.name === shipName);
          
          if (shipType) {
            this.selectShipType(shipType);
            
            // Actualizar UI para mostrar selección
            shipSelectors.forEach(s => s.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
          }
        });
      });
    }
  }
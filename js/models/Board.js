// models/Board.js
class Board {
    constructor(rows, cols) {
      this.rows = rows;
      this.cols = cols;
      this.grid = this._createGrid(rows, cols);
      this.ships = [];
      this.shots = [];
    }
    
    // Crear grid vacío
    _createGrid(rows, cols) {
      const grid = [];
      for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
          grid[i][j] = {
            hasShip: false,
            isHit: false,
            shipId: null
          };
        }
      }
      return grid;
    }
    
    // Verificar si se puede colocar un barco
    canPlaceShip(ship, position, isVertical) {
      const { row, col } = position;
      
      // Verificar si está dentro de los límites
      if (isVertical) {
        if (row + ship.size > this.rows) return false;
      } else {
        if (col + ship.size > this.cols) return false;
      }
      
      // Verificar si hay espacio (no hay otros barcos)
      for (let i = 0; i < ship.size; i++) {
        const checkRow = isVertical ? row + i : row;
        const checkCol = isVertical ? col : col + i;
        
        // Verificar la casilla actual
        if (this.grid[checkRow][checkCol].hasShip) return false;
        
        // Verificar casillas adyacentes (opcional, para mayor separación)
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            const adjRow = checkRow + r;
            const adjCol = checkCol + c;
            
            if (
              adjRow >= 0 && adjRow < this.rows &&
              adjCol >= 0 && adjCol < this.cols &&
              this.grid[adjRow][adjCol].hasShip
            ) {
              // Descomentar la siguiente línea si quieres que los barcos no puedan estar adyacentes
              // return false;
            }
          }
        }
      }
      
      return true;
    }
    
    // Colocar un barco en el tablero
    placeShip(ship, position, isVertical) {
      if (!this.canPlaceShip(ship, position, isVertical)) {
        return false;
      }
      
      const { row, col } = position;
      const shipId = this.ships.length;
      this.ships.push({
        ...ship,
        position,
        isVertical,
        hits: 0
      });
      
      // Marcar las casillas con el barco
      for (let i = 0; i < ship.size; i++) {
        const shipRow = isVertical ? row + i : row;
        const shipCol = isVertical ? col : col + i;
        
        this.grid[shipRow][shipCol] = {
          hasShip: true,
          isHit: false,
          shipId
        };
      }
      
      return true;
    }
    
    // Recibir un ataque
    receiveAttack(position) {
      const { row, col } = position;
      
      // Verificar si está dentro de los límites
      if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
        return null;
      }
      
      // Verificar si ya dispararon aquí
      const cell = this.grid[row][col];
      if (cell.isHit) {
        return null;
      }
      
      // Marcar como impactado
      cell.isHit = true;
      this.shots.push({ row, col, hit: cell.hasShip });
      
      // Si hay un barco, actualizar sus hits
      if (cell.hasShip) {
        const ship = this.ships[cell.shipId];
        ship.hits++;
        
        // Verificar si el barco se hundió
        const isSunk = ship.hits === ship.size;
        
        return {
          hit: true,
          sunk: isSunk,
          shipId: cell.shipId
        };
      }
      
      return { hit: false };
    }
    
    // Verificar si hay un barco cerca
    hasNearbyShip(position) {
      const { row, col } = position;
      
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          if (r === 0 && c === 0) continue; // Saltar la posición actual
          
          const checkRow = row + r;
          const checkCol = col + c;
          
          if (
            checkRow >= 0 && checkRow < this.rows &&
            checkCol >= 0 && checkCol < this.cols &&
            this.grid[checkRow][checkCol].hasShip
          ) {
            return true;
          }
        }
      }
      
      return false;
    }
    
    // Verificar si todos los barcos están hundidos
    allShipsSunk() {
      return this.ships.every(ship => ship.hits === ship.size);
    }
    
    // Verificar si se han colocado todos los barcos necesarios
    hasAllShipsPlaced(requiredShips) {
      const placedTypes = {};
      
      this.ships.forEach(ship => {
        if (!placedTypes[ship.name]) {
          placedTypes[ship.name] = 0;
        }
        placedTypes[ship.name]++;
      });
      
      return requiredShips.every(required => {
        const placed = placedTypes[required.name] || 0;
        return placed >= required.count;
      });
    }
    
    // Exportar tablero en formato JSON según requisitos
    exportToJSON() {
      const exportGrid = [];
      
      for (let i = 0; i < this.rows; i++) {
        exportGrid[i] = [];
        for (let j = 0; j < this.cols; j++) {
          const cell = this.grid[i][j];
          
          if (!cell.hasShip) {
            // Agua o bombas (disparos fallidos)
            exportGrid[i][j] = cell.isHit ? "b" : "a";
          } else {
            // Barcos (jugador o máquina, heridos o no)
            const isPlayer = true; // Cambiar según corresponda
            if (isPlayer) {
              exportGrid[i][j] = cell.isHit ? "p1-h" : "p1";
            } else {
              exportGrid[i][j] = cell.isHit ? "p2-h" : "p2";
            }
          }
        }
      }
      
      return exportGrid;
    }
  }
// models/Game.js
class Game {
    constructor(config) {
      this.playerName = config.playerName;
      this.countryCode = config.countryCode;
      this.location = config.location;
      this.boardSize = config.boardSize || { rows: 10, cols: 10 };
      this.weather = null;
      
      // Crear tableros para jugador y máquina
      this.playerBoard = new Board(this.boardSize.rows, this.boardSize.cols);
      this.computerBoard = new Board(this.boardSize.rows, this.boardSize.cols);
      
      // Crear jugadores
      this.player = new Player(this.playerName, this.countryCode, true);
      this.computer = new Player("Computer", "bot", false);
      
      this.currentTurn = this.player; // El jugador inicia
      this.gameOver = false;
      this.score = new Score();
      
      // Estados del juego
      this.state = {
        SETUP: 'setup',      // Configuración inicial
        PLAYING: 'playing',  // Jugando
        FINISHED: 'finished' // Juego terminado
      };
      
      this.currentState = this.state.SETUP;
      
      // Barcos
      this.shipTypes = [
        { name: 'Portaaviones', size: 5, count: 1 },
        { name: 'Buque', size: 4, count: 1 },
        { name: 'Submarino', size: 3, count: 1 },
        { name: 'Crucero', size: 3, count: 1 },
        { name: 'Lancha', size: 2, count: 1 }
      ];
    }
    
    // Iniciar configuración del juego
    startSetup() {
      // Generar barcos aleatorios para la computadora
      this._generateComputerShips();
      return this;
    }
    
    // Colocar barco del jugador
    placePlayerShip(ship, position, isVertical) {
      const valid = this.playerBoard.canPlaceShip(ship, position, isVertical);
      if (valid) {
        this.playerBoard.placeShip(ship, position, isVertical);
        return true;
      }
      return false;
    }
    
    // Generar barcos para la computadora de manera aleatoria
    _generateComputerShips() {
      this.shipTypes.forEach(shipType => {
        for (let i = 0; i < shipType.count; i++) {
          let placed = false;
          const ship = new Ship(shipType.name, shipType.size);
          
          while (!placed) {
            const row = Math.floor(Math.random() * this.boardSize.rows);
            const col = Math.floor(Math.random() * this.boardSize.cols);
            const isVertical = Math.random() > 0.5;
            
            if (this.computerBoard.canPlaceShip(ship, {row, col}, isVertical)) {
              this.computerBoard.placeShip(ship, {row, col}, isVertical);
              placed = true;
            }
          }
        }
      });
    }
    
    // Iniciar el juego
    startGame() {
      if (this.playerBoard.hasAllShipsPlaced(this.shipTypes)) {
        this.currentState = this.state.PLAYING;
        return true;
      }
      return false;
    }
    
    // Turno del jugador
    playerShoot(position) {
      if (this.currentState !== this.state.PLAYING || this.currentTurn !== this.player) {
        return null;
      }
      
      const result = this.computerBoard.receiveAttack(position);
      
      // Calcular puntuación
      if (result.hit) {
        this.score += 10; // 10 puntos por acierto
      } else {
        // Verificar si está cerca de un barco para penalizar
        const nearbyShip = this.computerBoard.hasNearbyShip(position);
        if (nearbyShip) {
          this.score -= 3; // -3 puntos por estar cerca pero fallar
        } else {
          this.score -= 1; // -1 punto por fallar lejos
        }
      }
      
      // Cambiar de turno si no acertó
      if (!result.hit) {
        this.currentTurn = this.computer;
        setTimeout(() => this.computerShoot(), 1000); // Turno de la computadora
      }
      
      // Verificar si el juego ha terminado
      this._checkGameOver();
      
      return result;
    }
    
    // Turno de la computadora
    computerShoot() {
      if (this.currentState !== this.state.PLAYING || this.currentTurn !== this.computer) {
        return null;
      }
      
      // Implementación simple: disparo aleatorio
      let position, result;
      do {
        const row = Math.floor(Math.random() * this.boardSize.rows);
        const col = Math.floor(Math.random() * this.boardSize.cols);
        position = { row, col };
        result = this.playerBoard.receiveAttack(position);
      } while (result === null); // Repetir si ya había disparado allí
      
      // Cambiar de turno si no acertó
      if (!result.hit) {
        this.currentTurn = this.player;
      } else {
        // Si acierta, dispara de nuevo
        setTimeout(() => this.computerShoot(), 1000);
      }
      
      // Verificar si el juego ha terminado
      this._checkGameOver();
      
      return { position, result };
    }
    
    // Verificar si el juego ha terminado
    _checkGameOver() {
      if (this.computerBoard.allShipsSunk()) {
        this.currentState = this.state.FINISHED;
        this.gameOver = true;
        return { winner: this.player };
      }
      
      if (this.playerBoard.allShipsSunk()) {
        this.currentState = this.state.FINISHED;
        this.gameOver = true;
        return { winner: this.computer };
      }
      
      return false;
    }
    
    // Exportar mapas en formato JSON
    exportMaps() {
      return {
        playerMap: this.playerBoard.exportToJSON(),
        computerMap: this.computerBoard.exportToJSON()
      };
    }
    
    // Obtener información del clima
    async getWeather() {
      try {
        const weather = await fetchWeather(this.location);
        this.weather = weather;
        return weather;
      } catch (error) {
        console.error("Error al obtener el clima:", error);
        return null;
      }
    }
    
    // Enviar puntuación al finalizar
    async sendScore() {
      if (this.currentState !== this.state.FINISHED) {
        return false;
      }
      
      try {
        await sendScoreToServer({
          nick_name: this.playerName,
          score: this.score,
          country_code: this.countryCode
        });
        return true;
      } catch (error) {
        console.error("Error al enviar puntuación:", error);
        return false;
      }
    }
  }
// js/controllers/GameController.js
class GameController {
    constructor() {
      this.game = null;
      this.boardController = null;
      this.uiController = null;
      this.gameConfig = {
        playerName: '',
        countryCode: '',
        location: '',
        boardSize: { rows: 10, cols: 10 }
      };
    }
    
    async initialize() {
      // Inicializar controladores
      this.boardController = new BoardController(this);
      this.uiController = new UIController(this);
      
      // Cargar países para el formulario inicial
      await this.loadCountries();
      
      // Configurar eventos de inicio
      this.setupInitialEvents();
    }
    
    // Cargar lista de países desde el backend
    async loadCountries() {
      try {
        const countries = await fetchCountries();
        this.uiController.populateCountrySelector(countries);
      } catch (error) {
        console.error('Error al cargar países:', error);
        this.uiController.showMessage('Error al cargar países. Intenta recargar la página.', 'error');
      }
    }
    
    // Crear un nuevo juego con la configuración proporcionada
    createGame(config) {
      this.gameConfig = { ...this.gameConfig, ...config };
      this.game = new Game(this.gameConfig);
      
      // Iniciar configuración del juego
      this.game.startSetup();
      
      // Obtener información del clima
      this.getWeatherInfo();
      
      // Mostrar pantalla de configuración de barcos
      this.uiController.showSetupScreen();
      this.boardController.initialize();
      
      return this.game;
    }
    
    // Obtener información del clima para la ubicación del jugador
    async getWeatherInfo() {
      try {
        const weather = await this.game.getWeather();
        if (weather) {
          this.uiController.updateWeatherInfo(weather);
        }
      } catch (error) {
        console.error('Error al obtener información del clima:', error);
      }
    }
    
    // Iniciar el juego después de la configuración
    startGame() {
      const started = this.game.startGame();
      
      if (started) {
        this.uiController.showGameScreen();
        this.boardController.renderGameBoards();
        this.uiController.updateScore(this.game.score);
        this.uiController.showMessage('¡Empieza el juego! Tu turno.', 'info');
      } else {
        this.uiController.showMessage('Debes colocar todos los barcos antes de empezar', 'warning');
      }
      
      return started;
    }
    
    // Jugador realiza un ataque
    playerAttack(position) {
      if (this.game.currentState !== this.game.state.PLAYING) {
        return null;
      }
      
      const result = this.game.playerShoot(position);
      
      // Verificar fin del juego después del ataque
      this.checkGameStatus();
      
      return result;
    }
    
    // La computadora realiza un ataque (se llama desde el modelo)
    computerAttack() {
      // El manejo del ataque de la computadora ya está en el modelo Game.js
      // Solo necesitamos actualizar la UI después
      setTimeout(() => {
        this.boardController.updateBoards();
        this.checkGameStatus();
      }, 1000);
    }
    
    // Verificar estado del juego
    checkGameStatus() {
      if (this.game.gameOver) {
        const winner = this.game.playerBoard.allShipsSunk() ? 'Computadora' : this.game.playerName;
        
        // Mostrar mensaje de fin de juego
        this.uiController.showGameOver(winner, this.game.score);
        
        // Enviar puntuación al servidor
        this.sendFinalScore();
      }
    }
    
    // Enviar puntuación final al servidor
    async sendFinalScore() {
      try {
        const result = await this.game.sendScore();
        if (result) {
          console.log('Puntuación enviada correctamente');
        }
      } catch (error) {
        console.error('Error al enviar puntuación:', error);
      }
    }
    
    // Cargar ranking de jugadores
    async loadRanking() {
      try {
        const ranking = await fetchRanking();
        this.uiController.showRanking(ranking);
      } catch (error) {
        console.error('Error al cargar ranking:', error);
      }
    }
    
    // Reiniciar juego
    restartGame() {
      // Volver a la pantalla inicial
      this.uiController.showInitialScreen();
    }
    
    // Configurar eventos iniciales
    setupInitialEvents() {
      // Formulario de inicio
      const startForm = document.getElementById('start-form');
      if (startForm) {
        startForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const playerName = document.getElementById('player-name').value;
          const countryCode = document.getElementById('country-selector').value;
          const location = document.getElementById('player-location').value;
          
          if (!playerName || !countryCode || !location) {
            this.uiController.showMessage('Por favor completa todos los campos', 'warning');
            return;
          }
          
          this.createGame({ playerName, countryCode, location });
        });
      }
      
      // Botón iniciar juego
      const startGameBtn = document.getElementById('start-game-btn');
      if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
          this.startGame();
        });
      }
      
      // Botón para reiniciar juego
      const restartBtn = document.getElementById('restart-game-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.restartGame();
        });
      }
      
      // Botón para ver ranking
      const rankingBtn = document.getElementById('show-ranking-btn');
      if (rankingBtn) {
        rankingBtn.addEventListener('click', () => {
          this.loadRanking();
        });
      }
    }
  }
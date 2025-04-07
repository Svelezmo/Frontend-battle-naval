// js/controllers/UIController.js
export class UIController {
    constructor(gameController) {
      this.gameController = gameController;
      this.screens = {
        initial: document.getElementById('initial-screen'),
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-screen'),
        gameOver: document.getElementById('game-over-screen'),
        ranking: document.getElementById('ranking-screen')
      };
      this.startScreen = document.getElementById('start-screen');
      this.gameScreen = document.getElementById('game-screen');
      this.finalScreen = document.getElementById('final-screen');
      this.messageContainer = document.getElementById('message-container');
      this.scoreDisplay = document.getElementById('score-display');
      this.weatherDisplay = document.getElementById('weather-display');
      this.shipSelectors = {};
    }
    
    // Mostrar pantalla inicial
    showInitialScreen() {
      this.hideAllScreens();
      if (this.screens.initial) {
        this.screens.initial.classList.remove('hidden');
      }
    }

    showStartScreen() {
      this.startScreen.style.display = 'block';
      this.gameScreen.style.display = 'none';
      this.finalScreen.style.display = 'none';
    }

    // Mostrar la pantalla del juego
  showGameScreen() {
    this.startScreen.style.display = 'none';
    this.gameScreen.style.display = 'block';
    this.finalScreen.style.display = 'none';
  }

  // Mostrar la pantalla final
  showFinalScreen(winner) {
    this.startScreen.style.display = 'none';
    this.gameScreen.style.display = 'none';
    this.finalScreen.style.display = 'block';
    document.getElementById('winner').innerText = winner;
  }
    
    // Mostrar pantalla de configuración de barcos
    showSetupScreen() {
      this.hideAllScreens();
      if (this.screens.setup) {
        this.screens.setup.classList.remove('hidden');
        this.initializeShipSelectors();
      }
    }
    
    // Mostrar pantalla de juego
    showGameScreen() {
      this.hideAllScreens();
      if (this.screens.game) {
        this.screens.game.classList.remove('hidden');
      }
    }
    
    // Mostrar pantalla de fin de juego
    showGameOver(winner, finalScore) {
      this.hideAllScreens();
      if (this.screens.gameOver) {
        this.screens.gameOver.classList.remove('hidden');
        
        // Actualizar contenido de fin de juego
        const winnerElement = document.getElementById('winner-name');
        const finalScoreElement = document.getElementById('final-score');
        
        if (winnerElement) {
          winnerElement.textContent = winner;
        }
        
        if (finalScoreElement) {
          finalScoreElement.textContent = finalScore;
        }
      }
    }
    
    // Mostrar pantalla de ranking
    showRanking(rankingData) {
      this.hideAllScreens();
      if (this.screens.ranking) {
        this.screens.ranking.classList.remove('hidden');
        
        const rankingTable = document.getElementById('ranking-table');
        if (rankingTable) {
          // Crear tabla de ranking
          let tableHtml = `
            <tr>
              <th>Posición</th>
              <th>Jugador</th>
              <th>País</th>
              <th>Puntuación</th>
            </tr>
          `;
          
          rankingData.forEach((player, index) => {
            tableHtml += `
              <tr>
                <td>${index + 1}</td>
                <td>${player.nick_name}</td>
                <td>${player.country_code}</td>
                <td>${player.score}</td>
              </tr>
            `;
          });
          
          rankingTable.innerHTML = tableHtml;
        }
        
        // Botón para volver
        const backButton = document.getElementById('back-from-ranking-btn');
        if (backButton) {
          backButton.addEventListener('click', () => {
            // Volver a la pantalla anterior
            if (this.gameController.game && this.gameController.game.gameOver) {
              this.showGameOver(
                this.gameController.game.playerBoard.allShipsSunk() ? 'Computadora' : this.gameController.game.playerName,
                this.gameController.game.score
              );
            } else {
              this.showInitialScreen();
            }
          });
        }
      }
    }
    
    // Ocultar todas las pantallas
    hideAllScreens() {
      Object.values(this.screens).forEach(screen => {
        if (screen) screen.classList.add('hidden');
      });
    }
    
    // Mostrar mensaje al usuario
    showMessage(message, type = 'info') {
      if (!this.messageContainer) return;
      
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', `message-${type}`);
      messageElement.textContent = message;
      
      this.messageContainer.innerHTML = '';
      this.messageContainer.appendChild(messageElement);
      
      // Auto-ocultar después de unos segundos
      setTimeout(() => {
        messageElement.classList.add('fading');
        setTimeout(() => {
          if (this.messageContainer.contains(messageElement)) {
            this.messageContainer.removeChild(messageElement);
          }
        }, 500);
      }, 3000);
    }
    
    // Actualizar información del clima
    updateWeatherInfo(weather) {
      if (!this.weatherDisplay) return;
      
      const weatherHtml = `
        <div class="weather-info">
          <img src="http://openweathermap.org/img/wn/${weather.icon}.png" alt="Weather icon">
          <div class="weather-details">
            <p>${weather.description}</p>
            <p>Temperatura: ${weather.temperature}°C</p>
            <p>Humedad: ${weather.humidity}%</p>
            <p>Viento: ${weather.windSpeed} m/s</p>
          </div>
        </div>
      `;
      
      this.weatherDisplay.innerHTML = weatherHtml;
    }
    
    // Actualizar puntuación en pantalla
    updateScore(score) {
      if (this.scoreDisplay) {
        this.scoreDisplay.textContent = `Puntuación: ${score}`;
      }
    }
    
    // Inicializar selectores de barcos en pantalla de configuración
    initializeShipSelectors() {
      const shipTypesContainer = document.getElementById('ship-types');
      if (!shipTypesContainer) return;
      
      shipTypesContainer.innerHTML = '';
      
      // Resetear contadores de barcos
      this.shipSelectors = {};
      
      // Crear un selector para cada tipo de barco
      this.gameController.game.shipTypes.forEach(ship => {
        const shipSelector = document.createElement('div');
        shipSelector.classList.add('ship-selector');
        shipSelector.dataset.ship = ship.name;
        
        // Guardar referencia para actualizar después
        this.shipSelectors[ship.name] = {
          element: shipSelector,
          remaining: ship.count
        };
        
        // Estructura del selector
        shipSelector.innerHTML = `
          <span class="ship-name">${ship.name}</span>
          <div class="ship-preview">
            ${Array(ship.size).fill('<div class="ship-unit"></div>').join('')}
          </div>
          <span class="ship-count">Disponibles: ${ship.count}</span>
        `;
        
        shipTypesContainer.appendChild(shipSelector);
      });
    }
    
    // Actualizar selector de barco cuando se coloca uno
    updateShipSelection(shipName) {
      const shipInfo = this.shipSelectors[shipName];
      
      if (shipInfo && shipInfo.remaining > 0) {
        shipInfo.remaining--;
        
        // Actualizar contador en la UI
        const countElement = shipInfo.element.querySelector('.ship-count');
        if (countElement) {
          countElement.textContent = `Disponibles: ${shipInfo.remaining}`;
        }
        
        // Deshabilitar selector si no quedan barcos
        if (shipInfo.remaining === 0) {
          shipInfo.element.classList.add('disabled');
          
          // Seleccionar automáticamente el siguiente tipo de barco disponible
          const nextAvailableShip = Object.values(this.shipSelectors).find(
            s => s.remaining > 0
          );
          
          if (nextAvailableShip) {
            nextAvailableShip.element.click();
          }
        }
      }
    }
    
    // Activar botón para iniciar juego
    enableStartGameButton() {
      const startButton = document.getElementById('start-game-btn');
      if (startButton) {
        startButton.disabled = false;
        startButton.classList.add('active');
      }
    }
    
    // Poblar selector de países
    populateCountrySelector(countries) {
      const selector = document.getElementById('country-selector');
      if (!selector) return;
      
      // Vaciar selector
      selector.innerHTML = '<option value="">Selecciona un país</option>';
      
      // Añadir opciones por cada país
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        selector.appendChild(option);
      });
    }
  }
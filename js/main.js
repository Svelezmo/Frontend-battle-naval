/**
 * main.js - Punto de entrada principal del juego de Batalla Naval
 */

// Importaciones de módulos necesarios
import { GameController } from './controllers/GameController.js';
import { BoardController } from './controllers/BoardController.js';
import { UIController } from './controllers/UIController.js';
import { Game } from './models/Game.js';
import { Player } from './models/Player.js';
import { Board } from './models/Board.js';
import { Ship } from './models/Ship.js';
import { SHIP_TYPES, MIN_BOARD_SIZE, MAX_BOARD_SIZE } from './utils/validators.js';
import * as config from './config.js';

// Función que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar controladores
    const gameController = new GameController();
    const boardController = new BoardController();
    const uiController = new UIController();
    
    // Pantalla inicial - Formulario de datos del jugador
    setupInitialScreen();
    
    // Configurar eventos para el formulario inicial
    function setupInitialScreen() {
        const playerForm = document.getElementById('player-form');
        if (playerForm) {
            playerForm.addEventListener('submit', handlePlayerFormSubmit);
            
            // Cargar lista de países desde la API
            loadCountriesList();
        }
        
        // Ocultar pantallas de juego y ranking
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('ranking-screen').style.display = 'none';
    }
    
    // Cargar la lista de países desde la API
    async function loadCountriesList() {
        try {
            const response = await fetch('http://127.0.0.1:5000/countries');
            const countries = await response.json();
            
            const countrySelect = document.getElementById('country-select');
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar la lista de países:', error);
            uiController.showErrorMessage('No se pudo cargar la lista de países. Intente de nuevo más tarde.');
        }
    }
    
    // Manejar el envío del formulario de datos del jugador
    async function handlePlayerFormSubmit(event) {
        event.preventDefault();
        
        const nickname = document.getElementById('nickname').value;
        const countryCode = document.getElementById('country-select').value;
        const location = document.getElementById('location').value;
        const rows = parseInt(document.getElementById('board-rows').value);
        const cols = parseInt(document.getElementById('board-cols').value);
        
        // Validar datos del formulario
        if (!gameController.validatePlayerData(nickname, countryCode, location, rows, cols)) {
            return;
        }
        
        // Inicializar el juego con los datos del jugador
        try {
            // Obtener datos del clima para la ubicación seleccionada
            const weatherData = await fetchWeatherData(location);
            
            // Crear jugador y juego
            const player = new Player(nickname, countryCode);
            const game = new Game(player, rows, cols, weatherData);
            
            // Guardar el juego en el controlador
            gameController.setGame(game);
            
            // Cambiar a la pantalla de colocación de barcos
            showShipPlacementScreen(rows, cols);
        } catch (error) {
            console.error('Error al inicializar el juego:', error);
            uiController.showErrorMessage('No se pudo inicializar el juego. Intente de nuevo más tarde.');
        }
    }
    
    // Obtener datos del clima para la ubicación seleccionada
    async function fetchWeatherData(location) {
        try {
            // Utilizar la API de OpenWeatherMap
            const apiKey = config.WEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.cod === 200) {
                return {
                    temperature: data.main.temp,
                    weather: data.weather[0].main,
                    description: data.weather[0].description,
                    windSpeed: data.wind.speed,
                    humidity: data.main.humidity,
                    pressure: data.main.pressure,
                    visibility: data.visibility,
                    location: data.name,
                    country: data.sys.country
                };
            } else {
                throw new Error(`Error al obtener datos del clima: ${data.message}`);
            }
        } catch (error) {
            console.error('Error al obtener datos del clima:', error);
            uiController.showErrorMessage('No se pudieron obtener los datos del clima. Se utilizarán valores predeterminados.');
            
            // Retornar datos del clima predeterminados en caso de error
            return {
                temperature: 20,
                weather: 'Clear',
                description: 'clear sky',
                windSpeed: 5,
                humidity: 60,
                pressure: 1013,
                visibility: 10000,
                location: location,
                country: 'Unknown'
            };
        }
    }
    
    // Mostrar la pantalla de colocación de barcos
    function showShipPlacementScreen(rows, cols) {
        // Ocultar pantalla inicial
        document.getElementById('player-form').style.display = 'none';
        
        // Mostrar pantalla de juego
        const gameScreen = document.getElementById('game-screen');
        gameScreen.style.display = 'block';
        
        // Inicializar el tablero para la colocación de barcos
        boardController.initPlacementBoard(rows, cols);
        
        // Mostrar los barcos disponibles para colocar
        uiController.showShipsForPlacement(Object.values(SHIP_TYPES));
        
        // Configurar evento para el botón de iniciar juego
        document.getElementById('start-game-btn').addEventListener('click', startGame);
        
        // Configurar evento para el botón de distribución aleatoria
        document.getElementById('random-placement-btn').addEventListener('click', () => {
            boardController.placeShipsRandomly(rows, cols);
        });
    }
    
    // Iniciar el juego después de colocar los barcos
    function startGame() {
        // Verificar que todos los barcos estén colocados
        if (!boardController.areAllShipsPlaced()) {
            uiController.showErrorMessage('Debe colocar todos los barcos antes de iniciar el juego.');
            return;
        }
        
        // Inicializar el tablero del oponente (máquina)
        const game = gameController.getGame();
        const rows = game.getBoardSize().rows;
        const cols = game.getBoardSize().cols;
        
        boardController.initOpponentBoard(rows, cols);
        
        // Colocar barcos de la máquina aleatoriamente
        gameController.placeComputerShips();
        
        // Actualizar la interfaz para mostrar ambos tableros
        uiController.showGameBoards();
        
        // Mostrar datos del clima
        uiController.displayWeatherInfo(game.getWeatherData());
        
        // Configurar eventos para los disparos del jugador
        setupPlayerShotEvents();
        
        // Indicar que es el turno del jugador (siempre empieza el usuario)
        uiController.setTurnIndicator(true);
    }
    
    // Configurar eventos para los disparos del jugador
    function setupPlayerShotEvents() {
        const opponentCells = document.querySelectorAll('#opponent-board .board-cell');
        
        opponentCells.forEach(cell => {
            cell.addEventListener('click', handlePlayerShot);
        });
    }
    
    // Manejar el disparo del jugador
    function handlePlayerShot(event) {
        // Verificar si es el turno del jugador
        if (!gameController.isPlayerTurn()) {
            return;
        }
        
        const cell = event.target;
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        // Realizar el disparo
        const result = gameController.playerShot(x, y);
        
        if (result === null) {
            // Disparo inválido
            return;
        }
        
        // Actualizar la interfaz según el resultado del disparo
        uiController.updateCellAfterShot(cell, result.hit);
        
        // Verificar si el juego ha terminado
        if (gameController.checkGameOver()) {
            endGame();
            return;
        }
        
        // Si no acertó, cambiar al turno de la máquina
        if (!result.hit) {
            gameController.setPlayerTurn(false);
            uiController.setTurnIndicator(false);
            
            // Programar el disparo de la máquina después de un breve retraso
            setTimeout(computerTurn, 1000);
        }
    }
    
    // Turno de la máquina
    function computerTurn() {
        const result = gameController.computerShot();
        
        // Actualizar la interfaz para mostrar el disparo de la máquina
        const cell = document.querySelector(`#player-board [data-x="${result.x}"][data-y="${result.y}"]`);
        uiController.updateCellAfterShot(cell, result.hit);
        
        // Verificar si el juego ha terminado
        if (gameController.checkGameOver()) {
            endGame();
            return;
        }
        
        // Si no acertó, cambiar al turno del jugador
        if (!result.hit) {
            gameController.setPlayerTurn(true);
            uiController.setTurnIndicator(true);
        } else {
            // Si acertó, la máquina dispara de nuevo después de un breve retraso
            setTimeout(computerTurn, 1000);
        }
    }
    
    // Finalizar el juego
    function endGame() {
        const playerWon = gameController.hasPlayerWon();
        const finalScore = gameController.calculateFinalScore();
        
        // Mostrar mensaje de fin de juego
        uiController.showGameOverMessage(playerWon, finalScore);
        
        // Guardar la puntuación en el backend
        saveScore(finalScore);
        
        // Mostrar botones para exportar mapas y ver ranking
        document.getElementById('export-maps-btn').style.display = 'block';
        document.getElementById('view-ranking-btn').style.display = 'block';
        
        // Configurar eventos para los botones
        document.getElementById('export-maps-btn').addEventListener('click', exportMaps);
        document.getElementById('view-ranking-btn').addEventListener('click', showRanking);
        document.getElementById('new-game-btn').addEventListener('click', resetGame);
    }
    
    // Guardar la puntuación en el backend
    async function saveScore(score) {
        try {
            const game = gameController.getGame();
            const player = game.getPlayer();
            
            const scoreData = {
                nick_name: player.getNickname(),
                score: score,
                country_code: player.getCountryCode()
            };
            
            const response = await fetch('http://127.0.0.1:5000/score-recorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scoreData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar la puntuación');
            }
            
            console.log('Puntuación guardada correctamente:', data);
        } catch (error) {
            console.error('Error al guardar la puntuación:', error);
            uiController.showErrorMessage('No se pudo guardar la puntuación. Intente de nuevo más tarde.');
        }
    }
    
    // Exportar mapas del juego
    function exportMaps() {
        const maps = gameController.generateExportMaps();
        
        // Crear y descargar archivos JSON
        downloadJSON(maps.playerMap, 'player_map.json');
        downloadJSON(maps.opponentMap, 'opponent_map.json');
    }
    
    // Función para descargar un archivo JSON
    function downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Mostrar ranking de jugadores
    async function showRanking() {
        try {
            // Ocultar pantalla de juego
            document.getElementById('game-screen').style.display = 'none';
            
            // Mostrar pantalla de ranking
            const rankingScreen = document.getElementById('ranking-screen');
            rankingScreen.style.display = 'block';
            
            // Limpiar tabla de ranking
            const rankingTable = document.getElementById('ranking-table');
            rankingTable.innerHTML = `
                <tr>
                    <th>Posición</th>
                    <th>Jugador</th>
                    <th>País</th>
                    <th>Puntuación</th>
                </tr>
            `;
            
            // Obtener datos del ranking del backend
            const response = await fetch('http://127.0.0.1:5000/ranking');
            const ranking = await response.json();
            
            // Mostrar datos en la tabla
            ranking.forEach((player, index) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.nick_name}</td>
                    <td>
                        <img src="https://flagsapi.com/${player.country_code}/flat/24.png" alt="${player.country_code}">
                    </td>
                    <td>${player.score}</td>
                `;
                
                rankingTable.appendChild(row);
            });
            
            // Configurar evento para volver al inicio
            document.getElementById('back-to-start-btn').addEventListener('click', resetGame);
        } catch (error) {
            console.error('Error al obtener el ranking:', error);
            uiController.showErrorMessage('No se pudo obtener el ranking. Intente de nuevo más tarde.');
        }
    }
    
    // Reiniciar el juego
    function resetGame() {
        location.reload();
    }
});
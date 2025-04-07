// config.js

// Configuración del tablero de juego
export const MIN_BOARD_SIZE = 10;  // Tamaño mínimo del tablero (10x10)
export const MAX_BOARD_SIZE = 20;  // Tamaño máximo del tablero (20x20)

// Tipos de barcos y su tamaño
export const SHIP_TYPES = [
  { name: 'Acorazado', size: 5 },
  { name: 'Crucero', size: 4 },
  { name: 'Destructor', size: 3 },
  { name: 'Submarino', size: 3 },
  { name: 'Patrullero', size: 2 }
];

// Direcciones de colocación de los barcos
export const ORIENTATIONS = ['vertical', 'horizontal']; // Dirección de colocación (vertical o horizontal)

// Configuración del clima
export const WEATHER_API_KEY = 'be129bbfed895b76701dd13490560118'; // Clave de API para obtener el clima de OpenWeather
export const DEFAULT_CITY = 'New York';  // Ciudad por defecto para el clima

// Configuración del puntaje
export const MAX_SCORE = 100;  // Puntaje máximo
export const HIT_SCORE = 10;   // Puntaje por cada acierto
export const MISS_PENALTY = -5; // Penalización por cada fallo

// Mensajes del juego
export const GAME_MESSAGES = {
  START_GAME: '¡Que comience la batalla naval!',
  GAME_OVER: '¡El juego ha terminado!',
  WIN: '¡Felicidades, has ganado!',
  LOSS: '¡Has perdido! Intenta de nuevo.',
  SHIP_PLACEMENT_ERROR: 'Posición inválida para colocar el barco.',
  HIT: '¡Tocado!',
  MISS: '¡Agua!',
};

// Configuración de la IA
export const AI_DIFFICULTY = 'medium'; // Puede ser 'easy', 'medium', 'hard'

// Otros valores globales
export const DEFAULT_SHIP_PLACEMENT = 'random'; // Opción para colocar los barcos automáticamente (por defecto es aleatorio)

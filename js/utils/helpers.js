// utils/helpers.js

/**
 * Funciones de ayuda para el juego de Batalla Naval
 */

// Convertir coordenadas de notación A1 a índices [fila, columna]
function parseCoordinate(coord) {
    if (!coord || typeof coord !== 'string' || coord.length < 2) {
      return null;
    }
    
    const column = coord.charAt(0).toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
    const row = parseInt(coord.substring(1), 10) - 1; // 1=0, 2=1, etc.
    
    if (isNaN(row) || column < 0) {
      return null;
    }
    
    return { row, col: column };
  }
  
  // Convertir índices [fila, columna] a notación A1
  function formatCoordinate(row, col) {
    const column = String.fromCharCode(65 + col); // 0=A, 1=B, etc.
    const rowNum = row + 1; // 0=1, 1=2, etc.
    return `${column}${rowNum}`;
  }
  
  // Generar un ID único
  function generateUniqueId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Formatear tiempo en formato MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Mezclar un array (algoritmo Fisher-Yates)
  function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // Obtener el código emoji de la bandera a partir del código de país
  function getFlagEmoji(countryCode) {
    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
      return '🏴';
    }
    
    // Convertir código ISO a emoji de bandera (cada letra mayúscula a un char regional)
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  }
  
  // Calcular el color apropiado para el texto según el color de fondo
  function getContrastColor(hexColor) {
    // Eliminar # si está presente
    const hex = hexColor.replace('#', '');
    
    // Convertir a RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminosidad (fórmula YIQ)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Texto oscuro para fondos claros y viceversa
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }
  
  // Retornar un valor aleatorio dentro de un rango
  function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Generar una posición aleatoria válida para el tablero
  function getRandomBoardPosition(rows, cols) {
    return {
      row: getRandomInRange(0, rows - 1),
      col: getRandomInRange(0, cols - 1)
    };
  }
  
  // Mostrar un mensaje de toast/notificación
  function showToast(message, type = 'info', duration = 3000) {
    // Crear elemento para el toast si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }
    
    // Crear el toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.padding = '10px 20px';
    toast.style.marginTop = '10px';
    toast.style.backgroundColor = type === 'error' ? '#f44336' : 
                                 type === 'success' ? '#4CAF50' : 
                                 type === 'warning' ? '#ff9800' : '#2196F3';
    toast.style.color = 'white';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    
    // Añadir a container
    toastContainer.appendChild(toast);
    
    // Eliminar después de duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      
      // Eliminar el elemento después de la transición
      setTimeout(() => {
        toastContainer.removeChild(toast);
        
        // Eliminar el container si está vacío
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      }, 500);
    }, duration);
    
    return toast;
  }
  
  // Función para debounce (limitar llamadas repetitivas)
  function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Exportar todas las funciones
  export {
    parseCoordinate,
    formatCoordinate,
    generateUniqueId,
    formatTime,
    shuffleArray,
    getFlagEmoji,
    getContrastColor,
    getRandomInRange,
    getRandomBoardPosition,
    showToast,
    debounce
  };
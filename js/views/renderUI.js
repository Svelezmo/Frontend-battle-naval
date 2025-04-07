// renderUI.js - Gestiona la interfaz de usuario del juego
class RenderUI {
    constructor(gameController) {
      this.gameController = gameController;
    }
  
    // Mostrar la pantalla inicial
    showStartScreen() {
      document.getElementById('inicio').classList.add('active');
      document.getElementById('juego').classList.remove('active');
      document.getElementById('final').classList.remove('active');
    }
  
    // Mostrar la pantalla de juego
    showGameScreen() {
      document.getElementById('inicio').classList.remove('active');
      document.getElementById('juego').classList.add('active');
      document.getElementById('final').classList.remove('active');
    }
  
    // Mostrar la pantalla final
    showFinalScreen(winner) {
      document.getElementById('inicio').classList.remove('active');
      document.getElementById('juego').classList.remove('active');
      document.getElementById('final').classList.add('active');
      
      const resultMessage = document.getElementById('resultado');
      resultMessage.textContent = `¡El ganador es ${winner}!`;
    }
  
    // Mostrar un mensaje al usuario
    showMessage(message, type) {
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      messageElement.classList.add('message', type);
      
      const messageContainer = document.getElementById('message-container');
      messageContainer.appendChild(messageElement);
  
      // Eliminar el mensaje después de 3 segundos
      setTimeout(() => {
        messageElement.remove();
      }, 3000);
    }
  
    // Actualizar el puntaje
    updateScore(playerScore, aiScore) {
      const scoreElement = document.getElementById('score');
      scoreElement.textContent = `Jugador: ${playerScore} - IA: ${aiScore}`;
    }
  
    // Activar o desactivar el botón de disparo
    toggleFireButton(isEnabled) {
      const fireButton = document.getElementById('disparo');
      if (isEnabled) {
        fireButton.classList.remove('hidden');
        fireButton.disabled = false;
      } else {
        fireButton.classList.add('hidden');
        fireButton.disabled = true;
      }
    }
  
    // Activar o desactivar el botón de inicio del juego
    toggleStartButton(isEnabled) {
      const startButton = document.getElementById('iniciarJuego');
      if (isEnabled) {
        startButton.disabled = false;
      } else {
        startButton.disabled = true;
      }
    }
  }
  
  export default RenderUI;
  
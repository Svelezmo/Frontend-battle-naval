// models/Score.js
class Score {
    constructor(initialScore = 0) {
      this.value = initialScore;
      this.history = [];
      this.lastUpdate = null;
    }
    
    // Añadir puntos con registro de la acción
    add(points, reason) {
      this.value += points;
      this._recordAction('add', points, reason);
      return this.value;
    }
    
    // Restar puntos con registro de la acción
    subtract(points, reason) {
      this.value -= points;
      this._recordAction('subtract', points, reason);
      return this.value;
    }
    
    // Registrar una acción que modifica la puntuación
    _recordAction(action, points, reason) {
      const timestamp = new Date();
      this.history.push({
        action,
        points,
        reason,
        timestamp,
        newTotal: this.value
      });
      this.lastUpdate = timestamp;
    }
    
    // Obtener historial de puntuaciones
    getHistory() {
      return this.history;
    }
    
    // Obtener la puntuación actual
    getValue() {
      return this.value;
    }
    
    // Reiniciar la puntuación
    reset() {
      const oldValue = this.value;
      this.value = 0;
      this._recordAction('reset', oldValue, 'game_restart');
      return 0;
    }
    
    // Convertir a formato para enviar al servidor
    toJSON() {
      return {
        score: this.value,
        actions: this.history.length,
        last_update: this.lastUpdate
      };
    }
    
    // Calcular bonificación basada en tiempo
    calculateTimeBonus(startTime, endTime) {
      const gameTimeMs = endTime - startTime;
      const gameTimeMinutes = gameTimeMs / (1000 * 60);
      
      // Menos tiempo = mayor bonificación
      let bonus = 0;
      if (gameTimeMinutes < 2) {
        bonus = 100; // Bonificación máxima
      } else if (gameTimeMinutes < 3) {
        bonus = 75;
      } else if (gameTimeMinutes < 4) {
        bonus = 50;
      } else if (gameTimeMinutes < 5) {
        bonus = 25;
      }
      
      if (bonus > 0) {
        this.add(bonus, 'time_bonus');
      }
      return bonus;
    }
    
    // Calcular bonificación por precisión
    calculateAccuracyBonus(hits, totalShots) {
      if (totalShots === 0) return 0;
      
      const accuracy = hits / totalShots;
      let bonus = 0;
      
      if (accuracy >= 0.9) {
        bonus = 150;
      } else if (accuracy >= 0.8) {
        bonus = 100;
      } else if (accuracy >= 0.7) {
        bonus = 75;
      } else if (accuracy >= 0.6) {
        bonus = 50;
      } else if (accuracy >= 0.5) {
        bonus = 25;
      }
      
      if (bonus > 0) {
        this.add(bonus, 'accuracy_bonus');
      }
      return bonus;
    }
    
    // Calcular bonificación basada en condiciones climáticas
    calculateWeatherBonus(weather) {
      let bonus = 0;
      
      // Condiciones difíciles dan más puntos
      if (weather && weather.description) {
        const description = weather.description.toLowerCase();
        
        if (description.includes('rain') || description.includes('lluvia')) {
          bonus = 25; // Lluvia: visibilidad reducida
        } else if (description.includes('fog') || description.includes('niebla')) {
          bonus = 40; // Niebla: muy difícil ver
        } else if (description.includes('storm') || description.includes('tormenta')) {
          bonus = 50; // Tormenta: condiciones extremas
        }
        
        if (bonus > 0) {
          this.add(bonus, 'weather_bonus');
        }
      }
      
      return bonus;
    }
  }
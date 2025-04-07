// Obtener países desde el backend
async function fetchCountries() {
  try {
    const response = await fetch("http://127.0.0.1:5000/countries");
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al cargar países:", error);
    throw error;
  }
} 

// Obtener información del clima
export async function fetchWeather(city) {
  try {
    const apiKey = "be129bbfed895b76701dd13490560118"; // Tu API key
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      description: data.weather[0].description,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error("Error al obtener clima:", error);
    throw error;
  }
}

// Enviar puntuación al backend
async function sendScoreToServer(scoreData) {
  try {
    const response = await fetch("http://127.0.0.1:5000/score-recorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scoreData)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al enviar puntuación:", error);
    throw error;
  }
}

// Obtener ranking de jugadores
async function fetchRanking() {
  try {
    const response = await fetch("http://127.0.0.1:5000/ranking");
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    throw error;
  }
}

// Exportar las demás funciones
export {
  fetchCountries,
  sendScoreToServer,
  fetchRanking
};
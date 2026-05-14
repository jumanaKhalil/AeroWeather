import { useState } from "react";
import "./App.css";
const weatherCodeDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  95: "Thunderstorm",
};
function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getWeather() {
    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const response = await fetch(
        `http://127.0.0.1:8000/weather?city=${encodeURIComponent(trimmedCity)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      getWeather();
    }
  }

  return (
    <main className="page">
      <section className="hero-card">
        <p className="tag">Cloud-Based Weather App</p>

        <h1>AeroWeather</h1>

        <p className="subtitle">
          Search for any city and get real-time weather data powered by a
          FastAPI backend.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name, e.g. Riyadh"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={getWeather} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {weather && (
          <section className="result-card">
            <div className="result-header">
              <div>
                <h2>
                  {weather.city}, {weather.country}
                </h2>
                <p>{weather.timezone}</p>
              </div>

              <span className="weather-badge">
                {weatherCodeDescriptions[weather.current.weather_code] || "Unknown weather"}
              </span>
            </div>

            <div className="temperature-box">
              <p className="temperature">
                {weather.current.temperature}
                <span>{weather.units.temperature_2m}</span>
              </p>
              <p className="updated-time">
                Updated at {weather.current.time}
              </p>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span>Humidity</span>
                <strong>
                  {weather.current.humidity}{" "}
                  {weather.units.relative_humidity_2m}
                </strong>
              </div>

              <div className="detail-item">
                <span>Wind Speed</span>
                <strong>
                  {weather.current.wind_speed} {weather.units.wind_speed_10m}
                </strong>
              </div>

              <div className="detail-item">
                <span>Latitude</span>
                <strong>{weather.latitude}</strong>
              </div>

              <div className="detail-item">
                <span>Longitude</span>
                <strong>{weather.longitude}</strong>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
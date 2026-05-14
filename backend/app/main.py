from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI(
    title="AeroWeather API",
    description="Backend API for the AeroWeather cloud-based weather application.",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "AeroWeather API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/weather")
async def get_weather(city: str):
    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"

    async with httpx.AsyncClient() as client:
        geocoding_response = await client.get(
            geocoding_url,
            params={
                "name": city,
                "count": 1,
                "language": "en",
                "format": "json"
            }
        )

    if geocoding_response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Failed to contact geocoding service"
        )

    geocoding_data = geocoding_response.json()
    locations = geocoding_data.get("results")

    if not locations:
        raise HTTPException(
            status_code=404,
            detail=f"City '{city}' was not found"
        )

    location = locations[0]
    latitude = location["latitude"]
    longitude = location["longitude"]

    forecast_url = "https://api.open-meteo.com/v1/forecast"

    async with httpx.AsyncClient() as client:
        weather_response = await client.get(
            forecast_url,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
                "timezone": "auto"
            }
        )

    if weather_response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Failed to contact weather service"
        )

    weather_data = weather_response.json()
    current_weather = weather_data.get("current", {})

    return {
        "city": location.get("name"),
        "country": location.get("country"),
        "latitude": latitude,
        "longitude": longitude,
        "timezone": weather_data.get("timezone"),
        "current": {
            "temperature": current_weather.get("temperature_2m"),
            "humidity": current_weather.get("relative_humidity_2m"),
            "wind_speed": current_weather.get("wind_speed_10m"),
            "weather_code": current_weather.get("weather_code"),
            "time": current_weather.get("time")
        },
        "units": weather_data.get("current_units")
    }
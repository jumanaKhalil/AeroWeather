from fastapi import FastAPI

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
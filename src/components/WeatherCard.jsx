import React from 'react';


const WeatherCard = ({ data }) => {
    const { name, main, weather, wind, sys, dt } = data;
    const date = new Date(dt * 1000).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const weatherIconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

    return (
        <div className="weather-card">
            <div className="weather-header">
                <h2 className="city-name">{name}, {sys.country}</h2>
                <p className="date-time">{date}</p>
            </div>

            <div className="weather-main">
                <img src={weatherIconUrl} alt={weather[0].description} className="weather-icon" />
                <div className="weather-info">
                    <h1 className="temperature">{Math.round(main.temp)}°C</h1>
                    <p className="condition">{weather[0].description}</p>
                </div>
            </div>

            <div className="weather-details">
                <div className="detail-item">
                    <span className="label">Humidity</span>
                    <span className="value">{main.humidity}%</span>
                </div>
                <div className="detail-item">
                    <span className="label">Wind</span>
                    <span className="value">{wind.speed} m/s</span>
                </div>
                <div className="detail-item">
                    <span className="label">Pressure</span>
                    <span className="value">{main.pressure} hPa</span>
                </div>
                <div className="detail-item">
                    <span className="label">Feels Like</span>
                    <span className="value">{Math.round(main.feels_like)}°C</span>
                </div>
                {main.aqi !== undefined && (
                    <div className="detail-item">
                        <span className="label">Air Quality (AQI)</span>
                        <span className="value" style={{
                            color: main.aqi <= 50 ? '#4ade80' : main.aqi <= 100 ? '#facc15' : '#f87171',
                            fontWeight: 'bold'
                        }}>
                            {Math.round(main.aqi)} {main.aqi <= 50 ? '🌿' : main.aqi <= 100 ? '⚠️' : '☠️'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherCard;

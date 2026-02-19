import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import './App.css';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import Forecast from './components/Forecast';
import Clock from './components/Clock';
import Footer from './components/Footer';
import TrafficStats from './components/TrafficStats';
import TemperatureChart from './components/TemperatureChart';
import { fetchWeather, fetchForecast, fetchWeatherByCoords, fetchForecastByCoords, fetchHistory } from './services/weatherService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function App() {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSignUp, setShowSignUp] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Toggle Body class for theme
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }, [isDarkMode]);


    // Initial load - try to get user location, else default to London
    useEffect(() => {
        const loadDefaultWeather = async () => {
            setLoading(true);
            setError(null);
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                                const weather = await fetchWeatherByCoords(latitude, longitude);
                                const forecast = await fetchForecastByCoords(latitude, longitude);

                                let history = null;
                                try {
                                    history = await fetchHistory(latitude, longitude);
                                } catch (e) {
                                    console.warn("History failed:", e);
                                }

                                setWeatherData(weather);
                                setForecastData(forecast);
                                setHistoryData(history);
                                setCity(weather.name);
                                setLoading(false);
                            } catch (err) {
                                // specific error handling if location fails
                                await loadCityWeather('London'); // Fallback
                            }
                        },
                        async (error) => {
                            // Permission denied or other error
                            await loadCityWeather('London');
                        }
                    );
                } else {
                    await loadCityWeather('London');
                }
            } catch (err) {
                setError('Failed to fetch weather data.');
                setLoading(false);
            }
        };

        loadDefaultWeather();
    }, []);

    const loadCityWeather = async (cityName) => {
        setLoading(true);
        setError(null);
        try {
            // First find coordinates
            const results = await import('./services/weatherService').then(m => m.searchCities(cityName));

            let weather, forecast, history;
            if (results && results.length > 0) {
                const { latitude, longitude, name, country } = results[0];
                weather = await fetchWeatherByCoords(latitude, longitude, name, country);
                forecast = await fetchForecastByCoords(latitude, longitude);
                try {
                    history = await fetchHistory(latitude, longitude);
                } catch (e) {
                    console.warn("History failed:", e);
                }
            } else {
                throw { response: { status: 404 } }; // Mimic not found
            }

            setWeatherData(weather);
            setForecastData(forecast);
            setHistoryData(history);
            setCity(weather.name);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('City not found. Please try again.');
            } else {
                setError('Failed to fetch weather data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchCity) => {
        loadCityWeather(searchCity);
    };



    // Dynamic Background based on weather condition
    const getBackgroundClass = () => {
        if (!weatherData) return 'app-default';
        const main = weatherData.weather[0].main.toLowerCase();
        if (main.includes('cloud')) return 'app-cloudy';
        if (main.includes('rain') || main.includes('drizzle')) return 'app-rainy';
        if (main.includes('thunderstorm')) return 'app-stormy';
        if (main.includes('snow')) return 'app-snowy';
        if (main.includes('clear')) return 'app-sunny';
        if (main.includes('mist') || main.includes('fog')) return 'app-foggy';
        return 'app-default';
    };

    const handleUseLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const weather = await fetchWeatherByCoords(latitude, longitude);
                        const forecast = await fetchForecastByCoords(latitude, longitude);
                        setWeatherData(weather);
                        setForecastData(forecast);
                        setCity(weather.name);
                        setLoading(false);
                    } catch (err) {
                        setError('Failed to fetch weather data.');
                        setLoading(false);
                    }
                },
                () => {
                    setError('Location permission denied.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setLoading(false);
        }
    };

    return (
        <div className={`app ${getBackgroundClass()} ${!isDarkMode ? 'light-mode' : ''}`}>
            <button
                className="dark-mode-toggle corner-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDarkMode ? (
                    <svg className="dark-mode-icon" viewBox="0 0 24 24">
                        <path d="M12 7c-2.76 0-5 2.24-5 5 0 .65.13 1.26.36 1.83 2.98-.21 5.43-2.67 5.21-5.63.58.23 1.18.36 1.83.36 2.76 0 5-2.24 5-5s-2.24-5-5-5c-2.76 0-5 2.24-5 5zm1.5 5.5l-1 1 .5 1.5 1.5.5-1.5.5-.5 1.5 1-1 1.5.5-.5-1.5 1.5-.5-1.5-.5.5-1.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        <circle cx="12" cy="12" r="5" fill="currentColor" />
                        <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2" />
                        <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" />
                        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
                        <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="2" />
                        <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" strokeWidth="2" />
                        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
                    </svg>
                ) : (
                    <svg className="dark-mode-icon" viewBox="0 0 24 24">
                        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                    </svg>
                )}
            </button>

            <div className="overlay">
                <div className="container">
                    <header className="app-header">
                        <h1>Weather App</h1>
                        <Clock />
                        <div className="header-actions">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                    </header>

                    <main className="app-content">
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        )}

                        {loading && (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading weather data...</p>
                            </div>
                        )}

                        {!loading && !error && weatherData && (
                            <>
                                <section className="weather-section">
                                    <WeatherCard data={weatherData} />
                                </section>

                                {forecastData && (
                                    <>
                                        <section className="chart-section" style={{ width: '100%', marginBottom: '2rem' }}>
                                            <TemperatureChart
                                                data={forecastData}
                                                history={historyData}
                                                isDarkMode={isDarkMode}
                                            />
                                        </section>
                                        <section className="forecast-section">
                                            <Forecast data={forecastData} />
                                        </section>
                                    </>
                                )}
                            </>
                        )}
                    </main>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <TrafficStats />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default App;

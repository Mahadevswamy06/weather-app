import axios from 'axios';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const HISTORY_URL = 'https://archive-api.open-meteo.com/v1/archive';

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OWM_GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

export const fetchHistory = async (lat, lon) => {
    // Keep using Open-Meteo for history as OWM history is paid
    const end = new Date();
    end.setDate(end.getDate() - 1); // Yesterday
    const start = new Date();
    start.setDate(start.getDate() - 8); // 7 days ago

    try {
        const response = await axios.get(HISTORY_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                start_date: formatDate(start),
                end_date: formatDate(end),
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum',
                timeformat: 'unixtime',
                timezone: 'auto'
            }
        });

        const daily = response.data.daily;
        const list = [];

        for (let i = 0; i < daily.time.length; i++) {
            const weatherInfo = mapWeatherCode(daily.weather_code[i], 1);
            list.push({
                dt: daily.time[i],
                main: {
                    temp_max: daily.temperature_2m_max[i],
                    temp_min: daily.temperature_2m_min[i],
                    wind_speed: daily.wind_speed_10m_max[i],
                    precip: daily.precipitation_sum[i]
                },
                weather: [{
                    main: weatherInfo.main,
                    description: weatherInfo.description,
                    icon: weatherInfo.icon
                }],
                dt_txt: new Date(daily.time[i] * 1000).toISOString()
            });
        }

        return { list };
    } catch (error) {
        console.warn('History Fetch failed', error);
        return null;
    }
};

// Helper to map WMO codes to OWM-like structure (For Open-Meteo fallback)
const mapWeatherCode = (code, isDay = 1) => {
    const codes = {
        0: { description: 'Clear sky', icon: isDay ? '01d' : '01n', main: 'Clear' },
        1: { description: 'Mainly clear', icon: isDay ? '02d' : '02n', main: 'Clouds' },
        2: { description: 'Partly cloudy', icon: isDay ? '03d' : '03n', main: 'Clouds' },
        3: { description: 'Overcast', icon: isDay ? '04d' : '04n', main: 'Clouds' },
        45: { description: 'Fog', icon: '50d', main: 'Fog' },
        48: { description: 'Depositing rime fog', icon: '50d', main: 'Fog' },
        51: { description: 'Light drizzle', icon: '09d', main: 'Drizzle' },
        53: { description: 'Moderate drizzle', icon: '09d', main: 'Drizzle' },
        55: { description: 'Dense drizzle', icon: '09d', main: 'Drizzle' },
        61: { description: 'Slight rain', icon: '10d', main: 'Rain' },
        63: { description: 'Moderate rain', icon: '10d', main: 'Rain' },
        65: { description: 'Heavy rain', icon: '10d', main: 'Rain' },
        71: { description: 'Slight snow', icon: '13d', main: 'Snow' },
        73: { description: 'Moderate snow', icon: '13d', main: 'Snow' },
        75: { description: 'Heavy snow', icon: '13d', main: 'Snow' },
        80: { description: 'Slight rain showers', icon: '09d', main: 'Rain' },
        81: { description: 'Moderate rain showers', icon: '09d', main: 'Rain' },
        82: { description: 'Violent rain showers', icon: '09d', main: 'Rain' },
        95: { description: 'Thunderstorm', icon: '11d', main: 'Thunderstorm' },
        96: { description: 'Thunderstorm with slight hail', icon: '11d', main: 'Thunderstorm' },
        99: { description: 'Thunderstorm with heavy hail', icon: '11d', main: 'Thunderstorm' },
    };
    return codes[code] || { description: 'Unknown', icon: '50d', main: 'Unknown' };
};

const getLatLon = async (city) => {
    if (API_KEY) {
        try {
            const response = await axios.get(OWM_GEO_URL, {
                params: { q: city, limit: 1, appid: API_KEY }
            });
            if (!response.data || response.data.length === 0) {
                throw { response: { status: 404 } };
            }
            return {
                latitude: response.data[0].lat,
                longitude: response.data[0].lon,
                name: response.data[0].name,
                country: response.data[0].country
            };
        } catch (e) {
            // Fallback to Open-Meteo if OWM fails or key invalid
            console.warn("OWM Geocoding failed, falling back to Open-Meteo", e);
            return getLatLonOpenMeteo(city);
        }
    } else {
        return getLatLonOpenMeteo(city);
    }
};

const getLatLonOpenMeteo = async (city) => {
    const response = await axios.get(GEOCODING_URL, {
        params: { name: city, count: 1, language: 'en', format: 'json' }
    });
    if (!response.data.results || response.data.results.length === 0) {
        throw { response: { status: 404 } };
    }
    return response.data.results[0];
};

export const searchCities = async (query) => {
    if (!query || query.length < 2) return [];
    try {
        if (API_KEY) {
            const response = await axios.get(OWM_GEO_URL, {
                params: { q: query, limit: 5, appid: API_KEY }
            });
            return response.data.map(item => ({
                latitude: item.lat,
                longitude: item.lon,
                name: item.name,
                country: item.country,
                state: item.state
            }));
        } else {
            const response = await axios.get(GEOCODING_URL, {
                params: { name: query, count: 5, language: 'en', format: 'json' }
            });
            return response.data.results || [];
        }
    } catch (error) {
        console.warn("City search failed", error);
        return [];
    }
};

export const setApiKey = (key) => {
    console.log("API Key configured via environment variables.");
};

export const fetchWeather = async (city) => {
    const location = await getLatLon(city);
    return fetchWeatherByCoords(location.latitude, location.longitude, location.name, location.country);
};

export const fetchForecast = async (city) => {
    const location = await getLatLon(city);
    return fetchForecastByCoords(location.latitude, location.longitude);
};

export const fetchWeatherByCoords = async (lat, lon, cityName = null, country = null) => {
    if (API_KEY) {
        try {
            // Use OWM
            const weatherReq = axios.get(`${OWM_BASE_URL}/weather`, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: API_KEY,
                    units: 'metric'
                }
            });

            // Use Open-Meteo for AQI fallback since OWM Air Pollution returns distinct index
            const aqiReq = axios.get(AQI_URL, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    current: 'us_aqi'
                }
            }).catch(err => {
                console.warn('AQI Fetch failed', err);
                return null;
            });

            const [weatherRes, aqiRes] = await Promise.all([weatherReq, aqiReq]);
            const current = weatherRes.data;

            let aqi = null;
            if (aqiRes && aqiRes.data && aqiRes.data.current) {
                aqi = aqiRes.data.current.us_aqi;
            }

            return {
                name: cityName || current.name,
                sys: { country: country || (current.sys ? current.sys.country : '') },
                dt: current.dt,
                main: {
                    temp: current.main.temp,
                    feels_like: current.main.feels_like,
                    humidity: current.main.humidity,
                    pressure: current.main.pressure,
                    aqi: aqi
                },
                weather: current.weather,
                wind: {
                    speed: current.wind.speed
                }
            };
        } catch (e) {
            console.warn("OWM Weather failed, falling back to Open-Meteo", e);
            return fetchWeatherByCoordsOpenMeteo(lat, lon, cityName, country);
        }

    } else {
        return fetchWeatherByCoordsOpenMeteo(lat, lon, cityName, country);
    }
};

const fetchWeatherByCoordsOpenMeteo = async (lat, lon, cityName, country) => {
    const weatherReq = axios.get(WEATHER_URL, {
        params: {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m',
            timeformat: 'unixtime',
            timezone: 'auto'
        }
    });

    const aqiReq = axios.get(AQI_URL, {
        params: {
            latitude: lat,
            longitude: lon,
            current: 'us_aqi'
        }
    }).catch(err => {
        console.warn('AQI Fetch failed', err);
        return null;
    });

    const [weatherRes, aqiRes] = await Promise.all([weatherReq, aqiReq]);

    const current = weatherRes.data.current;
    const weatherInfo = mapWeatherCode(current.weather_code, current.is_day);

    let aqi = null;
    if (aqiRes && aqiRes.data && aqiRes.data.current) {
        aqi = aqiRes.data.current.us_aqi;
    }

    const displayCity = cityName || `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;

    return {
        name: displayCity,
        sys: { country: country || '' },
        dt: current.time,
        main: {
            temp: current.temperature_2m,
            feels_like: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            pressure: current.surface_pressure,
            aqi: aqi
        },
        weather: [{
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            main: weatherInfo.main
        }],
        wind: {
            speed: current.wind_speed_10m
        }
    };
};

export const fetchForecastByCoords = async (lat, lon) => {
    if (API_KEY) {
        try {
            // Use OWM Forecast (5 Day / 3 Hour)
            const response = await axios.get(`${OWM_BASE_URL}/forecast`, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: API_KEY,
                    units: 'metric'
                }
            });

            // Aggregate 3-hour data into daily summaries
            const dailyMap = new Map();
            const listData = response.data.list || [];

            listData.forEach(item => {
                const date = new Date(item.dt * 1000).toDateString();

                if (!dailyMap.has(date)) {
                    dailyMap.set(date, {
                        dt: item.dt,
                        dt_txt: item.dt_txt,
                        temp_max: -999,
                        temp_min: 999,
                        weather: item.weather,
                        wind_speed: 0,
                        precip: 0,
                    });
                }

                const day = dailyMap.get(date);
                day.temp_max = Math.max(day.temp_max, item.main.temp_max);
                day.temp_min = Math.min(day.temp_min, item.main.temp_min);
                day.wind_speed = Math.max(day.wind_speed, item.wind.speed);
                if (item.rain && item.rain['3h']) day.precip += item.rain['3h'];

                // Prefer noon weather icon (12:00:00)
                if (item.dt_txt && item.dt_txt.includes("12:00:00")) {
                    day.weather = item.weather;
                    day.dt = item.dt;
                }
            });

            const list = Array.from(dailyMap.values()).map(day => ({
                dt: day.dt,
                dt_txt: day.dt_txt,
                main: {
                    temp_max: day.temp_max,
                    temp_min: day.temp_min,
                    wind_speed: day.wind_speed,
                    precip: day.precip
                },
                weather: day.weather
            }));

            // Return up to 5 days
            return { list: list.slice(0, 5) };

        } catch (e) {
            console.warn("OWM Forecast failed, falling back", e);
            return fetchForecastByCoordsOpenMeteo(lat, lon);
        }
    } else {
        return fetchForecastByCoordsOpenMeteo(lat, lon);
    }
};

const fetchForecastByCoordsOpenMeteo = async (lat, lon) => {
    const weatherReq = axios.get(WEATHER_URL, {
        params: {
            latitude: lat,
            longitude: lon,
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum,precipitation_probability_max',
            timeformat: 'unixtime',
            timezone: 'auto'
        }
    });

    const aqiReq = axios.get(AQI_URL, {
        params: {
            latitude: lat,
            longitude: lon,
            daily: 'us_aqi',
            timeformat: 'unixtime',
            timezone: 'auto'
        }
    }).catch(err => {
        console.warn('Forecast AQI Fetch failed', err);
        return null;
    });

    const [weatherRes, aqiRes] = await Promise.all([weatherReq, aqiReq]);

    const daily = weatherRes.data.daily;
    const dailyAqi = (aqiRes && aqiRes.data && aqiRes.data.daily) ? aqiRes.data.daily : {};

    const list = [];
    const count = daily.time ? daily.time.length : 0;

    for (let i = 0; i < count; i++) {
        const weatherInfo = mapWeatherCode(daily.weather_code[i], 1);
        const aqiVal = dailyAqi.us_aqi && dailyAqi.us_aqi[i] !== undefined ? dailyAqi.us_aqi[i] : null;

        list.push({
            dt: daily.time[i],
            main: {
                temp_max: daily.temperature_2m_max[i],
                temp_min: daily.temperature_2m_min[i],
                wind_speed: daily.wind_speed_10m_max[i],
                precip: daily.precipitation_sum[i],
                precip_prob: daily.precipitation_probability_max[i],
                aqi: aqiVal
            },
            weather: [{
                main: weatherInfo.main,
                description: weatherInfo.description,
                icon: weatherInfo.icon
            }],
            dt_txt: new Date(daily.time[i] * 1000).toISOString()
        });
    }

    return { list };
};

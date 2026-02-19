import React, { useMemo } from 'react';


const Forecast = ({ data }) => {
    // Extract daily forecasts (at 12:00:00)
    const dailyForecasts = useMemo(() => {
        if (!data || !data.list) return [];

        // Group by date, get the entry closest to noon
        const grouped = {};
        data.list.forEach((item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!grouped[date]) {
                grouped[date] = item;
            } else {
                // Maybe pick the one closer to noon if needed, but first one is usually fine if chronological
                // Just picking 12:00 if available
                if (item.dt_txt.includes("12:00:00")) {
                    grouped[date] = item;
                }
            }
        });

        return Object.values(grouped).slice(0, 5); // Just in case
    }, [data]);

    if (!dailyForecasts.length) return null;

    return (
        <div className="forecast-container">
            <h3 className="forecast-title">5-Day Forecast</h3>
            <div className="forecast-list">
                {dailyForecasts.map((item) => {
                    const date = new Date(item.dt * 1000);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

                    return (
                        <div key={item.dt} className="forecast-item">
                            <span className="forecast-day">{dayName}</span>
                            <img src={iconUrl} alt={item.weather[0].description} className="forecast-icon" />
                            <div className="forecast-temp">
                                <span className="max">{Math.round(item.main.temp_max)}°</span>
                                <span className="min">{Math.round(item.main.temp_min)}°</span>
                            </div>
                            <span className="forecast-desc">{item.weather[0].main}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Forecast;

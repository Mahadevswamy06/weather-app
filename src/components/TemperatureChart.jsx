import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './TemperatureChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TemperatureChart = ({ data, history, isDarkMode }) => {
    const [metric, setMetric] = useState('temp'); // temp, wind, precip, aqi
    const [timeRange, setTimeRange] = useState('forecast'); // forecast, history

    // Process forecast data
    const chartData = useMemo(() => {
        let sourceData;
        if (timeRange === 'history') {
            sourceData = history;
        } else {
            sourceData = data;
        }

        if (!sourceData || !sourceData.list) return null;

        const labels = [];
        const values = [];

        sourceData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

            if (metric === 'temp') {
                values.push(Math.round(item.main.temp_max));
            } else if (metric === 'wind') {
                values.push(item.main.wind_speed);
            } else if (metric === 'precip') {
                values.push(item.main.precip || 0);
            } else if (metric === 'aqi') {
                values.push(item.main.aqi || 0);
            }
        });

        let label = 'Max Temp (°C)';
        let color = isDarkMode ? '#60a5fa' : '#3b82f6';
        let bg = isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)';

        if (metric === 'wind') {
            label = 'Wind Speed (km/h)';
            color = '#34d399'; // Green/Teal
            bg = 'rgba(52, 211, 153, 0.2)';
        } else if (metric === 'precip') {
            label = 'Precipitation (mm)';
            color = '#a78bfa'; // Purple
            bg = 'rgba(167, 139, 250, 0.2)';
        } else if (metric === 'aqi') {
            label = 'Air Quality Index';
            color = '#fbbf24'; // Amber
            bg = 'rgba(251, 191, 36, 0.2)';
        }

        return {
            labels,
            datasets: [
                {
                    label: label,
                    data: values,
                    borderColor: color,
                    backgroundColor: bg,
                    tension: 0.4,
                    pointBackgroundColor: isDarkMode ? '#ffffff' : '#1e293b',
                    pointBorderColor: color,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: {
                        target: 'origin',
                        above: bg,
                    },
                    // Bar specific
                    borderWidth: 2,
                    borderRadius: 4,
                },
            ],
        };
    }, [data, history, isDarkMode, metric, timeRange]);

    const options = {
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
            y: {
                type: 'number',
                duration: 1000
            }
        },
        transitions: {
            active: {
                animation: {
                    duration: 400
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDarkMode ? '#fff' : '#1e293b',
                bodyColor: isDarkMode ? '#fff' : '#1e293b',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        let unit = '°C';
                        if (metric === 'wind') unit = ' km/h';
                        if (metric === 'precip') unit = ' mm';
                        if (metric === 'aqi') unit = ''; // AQI is unitless
                        return `${context.parsed.y}${unit}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
                    font: { family: 'Poppins' }
                }
            },
            y: {
                grid: {
                    color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
                    font: { family: 'Poppins' }
                },
                beginAtZero: metric === 'precip' || metric === 'aqi',
            }
        }
    };

    if (!chartData) return null;

    return (
        <div className="chart-container">
            <div className="chart-header-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 className="chart-title" style={{ marginRight: '10px' }}>Analysis</h3>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '25px', display: 'flex' }}>
                        <button
                            className={`metric-btn ${timeRange === 'history' ? 'active' : ''}`}
                            onClick={() => setTimeRange('history')}
                            style={{ margin: 0, fontSize: '0.8rem', padding: '4px 10px' }}
                        >Past 7d</button>
                        <button
                            className={`metric-btn ${timeRange === 'forecast' ? 'active' : ''}`}
                            onClick={() => setTimeRange('forecast')}
                            style={{ margin: 0, fontSize: '0.8rem', padding: '4px 10px' }}
                        >Next 7d</button>
                    </div>
                </div>

                <div className="metric-toggle">
                    <button
                        className={`metric-btn ${metric === 'temp' ? 'active' : ''}`}
                        onClick={() => setMetric('temp')}
                    >Temp</button>
                    <button
                        className={`metric-btn ${metric === 'wind' ? 'active' : ''}`}
                        onClick={() => setMetric('wind')}
                    >Wind</button>
                    <button
                        className={`metric-btn ${metric === 'precip' ? 'active' : ''}`}
                        onClick={() => setMetric('precip')}
                    >Rain</button>
                    <button
                        className={`metric-btn ${metric === 'aqi' ? 'active' : ''}`}
                        onClick={() => setMetric('aqi')}
                    >AQI</button>
                </div>
            </div>

            <div className="chart-wrapper">
                {metric === 'precip' ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <Line data={chartData} options={options} />
                )}
            </div>
        </div>
    );
};

export default TemperatureChart;

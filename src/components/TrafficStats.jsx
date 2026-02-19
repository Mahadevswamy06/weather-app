import React, { useState, useEffect } from 'react';
import './TrafficStats.css';

const TrafficStats = () => {
    const [visits, setVisits] = useState(0);
    const [liveUsers, setLiveUsers] = useState(1);

    useEffect(() => {
        // 1. Get total visits from local storage (Simple "Hit Counter")
        // In a real app, this would come from a database (Firebase/API)
        let storedVisits = localStorage.getItem('weatherApp_visits');
        if (!storedVisits) {
            storedVisits = 1200; // Start with a fake "base" number so it looks popular!
        } else {
            storedVisits = parseInt(storedVisits) + 1;
        }

        localStorage.setItem('weatherApp_visits', storedVisits);
        setVisits(storedVisits);

        // 2. Simulate "Live Users" (Random fluctuation)
        // This updates every 3 seconds to make it look "live"
        const interval = setInterval(() => {
            // Random number between 2 and 15
            const randomUsers = Math.floor(Math.random() * 13) + 2;
            setLiveUsers(randomUsers);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Format numbers (e.g. 1200 -> 1.2k)
    const formatCount = (n) => {
        if (n >= 1000) {
            return (n / 1000).toFixed(1) + 'k';
        }
        return n;
    };

    return (
        <div className="traffic-stats">
            <div className="stat-item" title="Total Page Views">
                <span className="stat-icon">👁️</span>
                <span className="stat-value">{formatCount(visits)}</span>
            </div>

            <div className="stat-divider">|</div>

            <div className="stat-item live" title="Current Active Users">
                <span className="stat-indicator"></span>
                <span className="stat-value">{liveUsers} Online</span>
            </div>
        </div>
    );
};

export default TrafficStats;

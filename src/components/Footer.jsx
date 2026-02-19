import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
    const [isAnimating, setIsAnimating] = useState(false);
    const text = "Mahadev Swamy";

    const triggerAnimation = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            // Reset after animation (approx duration + max delay)
            setTimeout(() => setIsAnimating(false), 2000);
        }
    };

    return (
        <footer className="app-footer">
            <p className="footer-credit">
                Made by{' '}
                <span className="author-name-container" onMouseEnter={triggerAnimation}>
                    {text.split('').map((char, index) => (
                        <span
                            key={index}
                            className={`letter ${isAnimating ? 'active' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </span>
            </p>

        </footer>
    );
};

export default Footer;

import React, { useState } from 'react';
import './SignUpModal.css';

const SignUpModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        setTimeout(() => {
            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1000);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>

                {submitted ? (
                    <div className="success-message">
                        <div className="checkmark">✓</div>
                        <h2>Welcome Aboard!</h2>
                        <p>Your account has been successfully created.</p>
                    </div>
                ) : (
                    <>
                        <h2>Create Account</h2>
                        <p className="subtitle">Join us for personalized weather alerts</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hello@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button type="submit" className="signup-submit-btn">
                                Sign Up
                            </button>
                        </form>

                        <p className="footer-text">
                            Already have an account? <a href="#">Log In</a>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default SignUpModal;

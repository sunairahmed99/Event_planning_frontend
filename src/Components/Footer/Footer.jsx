import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Explore</h3>
                    <ul>
                        <li><Link to="/events">Events</Link></li>
                        <li><Link to="/events?category=wedding">Weddings</Link></li>
                        <li><Link to="/events?category=corporate">Corporate</Link></li>
                        <li><Link to="/reviews">Reviews</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Company</h3>
                    <ul>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/auth">Login / Signup</Link></li>
                        <li><Link to="/">Home</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Resources</h3>
                    <ul>
                        <li><Link to="/contact">Support Center</Link></li>
                        <li><Link to="/about">Terms of Service</Link></li>
                        <li><Link to="/about">Privacy Policy</Link></li>
                        <li><Link to="/reviews">Community</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Stay Connected</h3>
                    <p>Subscribe to our newsletter for updates.</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Your email" />
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {(new Date().getFullYear())} Your Brand. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

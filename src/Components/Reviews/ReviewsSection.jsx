import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews } from '../../Features/ReviewSlice';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import './ReviewsSection.css';

const ReviewsSection = () => {
    const dispatch = useDispatch();
    const { reviews, loading } = useSelector((state) => state.reviews);

    useEffect(() => {
        dispatch(fetchReviews());
    }, [dispatch]);

    // Get only first 5 for marquee on home
    const displayReviews = reviews.slice(0, 5);

    if (loading && displayReviews.length === 0) return null;

    return (
        <section className="reviews-section">
            <div className="container">
                <div className="section-header">
                    <h2>What Our <span className="gradient-text">Clients Say</span></h2>
                    <p>Real stories from wonderful couples we've had the pleasure to work with.</p>
                </div>

                <div className="marquee-container">
                    <motion.div 
                        className="marquee-content"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ 
                            duration: 25, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                    >
                        {[...displayReviews, ...displayReviews].map((review, idx) => (
                            <div key={`${review._id}-${idx}`} className="review-card glass-card marquee-item">
                                <div className="quote-icon"><Quote size={36} /></div>
                                <div className="rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={14} 
                                            fill={i < review.rating ? "#B76E79" : "none"} 
                                            stroke={i < review.rating ? "#B76E79" : "#cbd5e1"} 
                                        />
                                    ))}
                                </div>
                                <p className="review-comment">"{review.comment}"</p>
                                <div className="review-user">
                                    {review.userImage ? (
                                        <img src={review.userImage} alt={review.userName} className="user-avatar" />
                                    ) : (
                                        <div className="user-avatar placeholder">
                                            {review.userName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div className="user-info">
                                        <h4>{review.userName}</h4>
                                        <span>Verified Client</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="view-all-reviews">
                    <button onClick={() => window.location.href = '/reviews'} className="btn-secondary">
                        View All Stories <Star size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;


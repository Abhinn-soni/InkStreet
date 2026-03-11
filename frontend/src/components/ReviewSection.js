import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiStar, FiThumbsUp, FiThumbsDown, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';
import { CyberButton } from './CyberButton';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StarRating = ({ rating, size = 'sm', interactive = false, onRate }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <FiStar
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-cyber-cyan text-cyber-cyan' : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewItem = ({ review, onHelpful }) => {
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = async (isHelpful) => {
    if (hasVoted) {
      toast.info('You have already voted on this review');
      return;
    }
    setHasVoted(true);
    await onHelpful(review.id, isHelpful);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-void-card border border-white/5 p-6"
      data-testid={`review-${review.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="font-syne font-bold">{review.user_name}</p>
            {review.is_verified_buyer && (
              <span className="flex items-center gap-1 bg-cyber-cyan/20 text-cyber-cyan px-2 py-0.5 text-xs font-mono uppercase tracking-wider border border-cyber-cyan/30">
                <FiCheck size={12} /> Verified Buyer
              </span>
            )}
            {review.is_seed_review && (
              <span className="bg-zinc-700 text-zinc-300 px-2 py-0.5 text-xs font-mono uppercase tracking-wider">
                Early Customer Feedback
              </span>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-zinc-300 mb-4 leading-relaxed">{review.comment}</p>

      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt="Review"
              className="w-20 h-20 object-cover border border-white/10"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <button
          onClick={() => handleHelpful(true)}
          data-testid={`helpful-${review.id}`}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-cyber-cyan transition-colors"
        >
          <FiThumbsUp size={14} />
          <span>Helpful ({review.helpful_count})</span>
        </button>
        <button
          onClick={() => handleHelpful(false)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          <FiThumbsDown size={14} />
          <span>({review.not_helpful_count})</span>
        </button>
      </div>
    </motion.div>
  );
};

const WriteReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/reviews`,
        {
          product_id: productId,
          rating,
          comment,
          photos: []
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted successfully!');
      onSubmit();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-void-card border border-cyber-cyan/30 p-6 mb-6"
      data-testid="write-review-form"
    >
      <h3 className="font-syne text-xl font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
            Your Rating *
          </label>
          <StarRating rating={rating} size="lg" interactive onRate={setRating} />
        </div>

        <div>
          <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            data-testid="review-comment-input"
            placeholder="Share your experience with this product..."
            rows="4"
            className="w-full bg-transparent border border-white/20 p-4 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-inter"
            required
          />
        </div>

        <div className="flex gap-3">
          <CyberButton type="submit" disabled={loading} data-testid="submit-review-button">
            {loading ? 'Submitting...' : 'Submit Review'}
          </CyberButton>
          <CyberButton variant="secondary" onClick={onCancel}>
            Cancel
          </CyberButton>
        </div>
      </form>
    </motion.div>
  );
};

export const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    loadStats();
    checkCanReview();
  }, [productId, sortBy]);

  const loadReviews = async () => {
    try {
      const res = await axios.get(`${API}/products/${productId}/reviews?sort_by=${sortBy}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API}/products/${productId}/review-stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const checkCanReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCanReview({ can_review: false, has_purchased: false });
      return;
    }

    try {
      const res = await axios.get(`${API}/reviews/user/can-review/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(res.data);
    } catch (err) {
      setCanReview({ can_review: false });
    }
  };

  const handleHelpful = async (reviewId, isHelpful) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to vote');
      return;
    }

    try {
      await axios.post(
        `${API}/reviews/${reviewId}/helpful`,
        { review_id: reviewId, is_helpful: isHelpful },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Thank you for your feedback!');
      loadReviews();
    } catch (err) {
      toast.error('Failed to record vote');
    }
  };

  const handleReviewSubmitted = () => {
    setShowWriteReview(false);
    loadReviews();
    loadStats();
    checkCanReview();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-zinc-400 animate-pulse">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="mt-12" data-testid="review-section">
      {/* Stats Header */}
      {stats && (
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-syne text-5xl font-bold text-cyber-cyan">
                  {stats.average_rating.toFixed(1)}
                </span>
                <span className="text-zinc-400">/ 5</span>
              </div>
              <StarRating rating={Math.round(stats.average_rating)} size="md" />
              <p className="font-mono text-sm text-zinc-500 mt-2">
                Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.rating_distribution[rating.toString()];
              const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-white/5">
                    <div
                      className="h-full bg-cyber-cyan"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-zinc-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canReview && !showWriteReview && (
        <div className="mb-6">
          {canReview.can_review ? (
            <CyberButton onClick={() => setShowWriteReview(true)} data-testid="write-review-button">
              Write a Review
            </CyberButton>
          ) : canReview.already_reviewed ? (
            <p className="font-mono text-sm text-zinc-500">You have already reviewed this product</p>
          ) : canReview.has_purchased === false ? (
            <p className="font-mono text-sm text-zinc-500">Purchase this product to write a review</p>
          ) : null}
        </div>
      )}

      {/* Write Review Form */}
      {showWriteReview && (
        <WriteReviewForm
          productId={productId}
          onSubmit={handleReviewSubmitted}
          onCancel={() => setShowWriteReview(false)}
        />
      )}

      {/* Sort Options */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Sort by:</span>
        {['recent', 'highest', 'lowest'].map(option => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            data-testid={`sort-${option}`}
            className={`px-4 py-2 border font-mono text-xs uppercase tracking-widest transition-colors ${
              sortBy === option
                ? 'bg-cyber-cyan text-black border-cyber-cyan'
                : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
            }`}
          >
            {option === 'recent' ? 'Most Recent' : option === 'highest' ? 'Highest Rating' : 'Lowest Rating'}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-zinc-400 py-12">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <ReviewItem key={review.id} review={review} onHelpful={handleHelpful} />
          ))
        )}
      </div>
    </div>
  );
};

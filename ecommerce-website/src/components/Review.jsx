import React, { useState } from 'react';
import axios from 'axios';

const Review = ({ buyerId, productId }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/reviews/leave', { buyer_id: buyerId, product_id: productId, rating, comment })
      .then(response => console.log('Review left:', response.data))
      .catch(error => console.error('Error leaving review:', error));
  };

  return (
    <div className="review">
      <h2>Leave a Review</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Rating:
          <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} required />
        </label>
        <label>
          Comment:
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Review;
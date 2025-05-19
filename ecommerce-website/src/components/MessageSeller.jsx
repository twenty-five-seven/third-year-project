import React, { useState } from 'react';
import axios from 'axios';

const MessageSeller = ({ buyerId, sellerId }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/inquiries/message', { buyer_id: buyerId, seller_id: sellerId, message })
      .then(response => console.log('Message sent:', response.data))
      .catch(error => console.error('Error sending message:', error));
  };

  return (
    <div className="message-seller">
      <h2>Message Seller</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Message:
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default MessageSeller;
// src/components/OrderConfirmation.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await cartService.getOrder(orderId);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load order details');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
        <button className="submit-order" onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    );
  }

  if (!order || !order.items) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <h2>No order details available</h2>
        <button className="submit-order" onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirmation" style={{ padding: '2em', textAlign: 'center' }}>
      <h2>Order Confirmed!</h2>

      <p>Your order number is:</p>
      <strong>{orderId}</strong>

      <h3 style={{ marginTop: '1.5em' }}>Items in Your Order:</h3>
      <ul style={{ listStyle: 'disc', textAlign: 'left', display: 'inline-block' }}>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} — EGP {item.price.toFixed(2)}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '1em' }}>
        <p><strong>Subtotal:</strong> EGP {order.subtotal.toFixed(2)}</p>
        <p><strong>Tax (14%):</strong> EGP {order.tax.toFixed(2)}</p>
        <p><strong>Total:</strong> EGP {order.total.toFixed(2)}</p>
      </div>

      <div style={{ marginTop: '1em' }}>
        <p><strong>Payment Method:</strong>{' '}
          {order.paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : 'Credit Card'}
        </p>
        {order.paymentMethod === 'card' && order.paymentDetails && (
          <div style={{ marginTop: '0.5em' }}>
            <p><strong>Card:</strong> {order.paymentDetails.cardNumber}</p>
            <p><strong>Expiry:</strong> {order.paymentDetails.expiry}</p>
          </div>
        )}
      </div>

      <button className="submit-order" onClick={() => navigate('/')} style={{ marginTop: '1em' }}>
        Place Another Order
      </button>
    </div>
  );
};

export default OrderConfirmation;

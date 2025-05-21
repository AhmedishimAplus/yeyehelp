// src/components/OrderConfirmation.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = state?.orderId;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          setError('No order ID found');
          setLoading(false);
          return;
        }

        const response = await cartService.getOrder(orderId);
        setOrderDetails(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <h2>{error || 'No order data found.'}</h2>
        <button className="submit-order" onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    );
  }

  const { items: cartItems, paymentMethod, paymentDetails: cardInfo, total, subtotal, tax, orderNumber } = orderDetails;

  // mask card number
  const maskedCard = cardInfo?.cardNumber
    ? '**** **** **** ' + cardInfo.cardNumber.slice(-4)
    : '';

  return (
    <div className="order-confirmation" style={{ padding: '2em', textAlign: 'center' }}>
      <h2>Order Confirmed!</h2>

      <p>Your order number is:</p>
      <strong>{orderNumber}</strong>

      <h3 style={{ marginTop: '1.5em' }}>Items in Your Order:</h3>
      <ul style={{ listStyle: 'disc', textAlign: 'left', display: 'inline-block' }}>
        {cartItems.map((item, idx) => (
          <li key={idx}>
            {item.name} — EGP {item.price.toFixed(2)}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '1em' }}>
        <p><strong>Subtotal:</strong> EGP {subtotal.toFixed(2)}</p>
        <p><strong>Tax (14%):</strong> EGP {tax.toFixed(2)}</p>
        <p><strong>Total:</strong> EGP {total.toFixed(2)}</p>
      </div>

      <div style={{ marginTop: '1em' }}>
        <p><strong>Payment Method:</strong>{' '}
          {paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : 'Credit Card'}
        </p>
        {paymentMethod === 'card' && cardInfo && (
          <div style={{ marginTop: '0.5em' }}>
            <p><strong>Card:</strong> {maskedCard}</p>
            <p><strong>Expiry:</strong> {cardInfo.expiry}</p>
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

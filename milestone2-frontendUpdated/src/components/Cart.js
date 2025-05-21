// src/components/Cart.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import { cartService } from '../services/cartService';
import { validateCardNumber, validateCCV, validateExpiry, formatCardNumber } from '../utils/validations';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    orderInfo, 
    clearCart, 
    subtotal, 
    tax, 
    total 
  } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [ccv, setCcv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validatePaymentDetails = () => {
    if (paymentMethod !== 'card') return true;

    const errors = {};
    
    if (!validateCardNumber(cardNumber)) {
      errors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!validateCCV(ccv)) {
      errors.ccv = 'Please enter a valid CCV (3-4 digits)';
    }
    
    if (!validateExpiry(expiry)) {
      errors.expiry = 'Please enter a valid expiry date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setValidationErrors(prev => ({ ...prev, cardNumber: null }));
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setValidationErrors({});

      if (!orderInfo) {
        setError('Please provide delivery information first');
        navigate('/order');
        return;
      }

      if (cartItems.length === 0) {
        setError('Please add items to your cart before checking out.');
        return;
      }

      if (!validatePaymentDetails()) {
        return;
      }

      // Create order data with all necessary information
      const orderData = {
        items: cartItems.map(item => ({
          chefId: item.chefId,
          kitchenId: item.kitchenId || item.chefId,
          dishName: item.dishName,
          quantity: Math.max(1, parseInt(item.quantity) || 1)
        })),
        paymentMethod,
        customerInfo: {
          ...orderInfo,
          paymentMethod,
          cardInfo: paymentMethod === 'card' ? {
            cardNumber,
            ccv,
            expiry
          } : undefined
        }
      };

      console.log('Sending order data:', orderData); // Debug log

      // Send order to backend
      const response = await cartService.createOrder(orderData);
      console.log('Order response:', response); // Debug log
      
      if (response.data && response.data.purchase) {
        // Clear the cart after successful order
        await clearCart();
        
        // Redirect to order confirmation
        navigate('/order-confirmation', {
          state: { 
            orderId: response.data.purchase._id,
            paymentMethod,
            customerInfo: orderInfo
          }
        });
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      console.error('Order error:', err); // Debug log
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while processing your order.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="cart-container">
      <h3>Your Cart</h3>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1em' }}>
          {error}
        </div>
      )}

      {orderInfo && (
        <div className="delivery-info" style={{ marginBottom: '1em' }}>
          <h4>Delivery Information</h4>
          <p>Name: {orderInfo.name}</p>
          <p>Location: {orderInfo.location}</p>
          {orderInfo.phone && <p>Phone: {orderInfo.phone}</p>}
        </div>
      )}

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (
              <li key={`${item.chefId || 'unknown'}-${item.dishName}-${index}`}>
                {item.dishName} ({item.quantity || 1}x) — EGP {item.price ? (item.price * (item.quantity || 1)).toFixed(2) : '0.00'}
              </li>
            ))}
          </ul>

          <div className="cart-totals">
            <p><strong>Subtotal:</strong> EGP {subtotal ? subtotal.toFixed(2) : '0.00'}</p>
            <p><strong>Tax (14%):</strong> EGP {tax ? tax.toFixed(2) : '0.00'}</p>
            <p><strong>Total:</strong> EGP {total ? total.toFixed(2) : '0.00'}</p>
          </div>

          <div className="payment-methods" style={{ marginTop: '1em' }}>
            <p><strong>Select Payment Method:</strong></p>
            <label>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => {
                  setPaymentMethod('cod');
                  setValidationErrors({});
                }}
              />{' '}
              Cash on Delivery
            </label>
            <label style={{ marginLeft: '1em' }}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />{' '}
              Credit Card
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="card-details" style={{ marginTop: '1em', textAlign: 'left' }}>
              <div>
                <label>Card Number:</label><br/>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
                {validationErrors.cardNumber && (
                  <div className="error-message" style={{ color: 'red', fontSize: '0.8em' }}>
                    {validationErrors.cardNumber}
                  </div>
                )}
              </div>
              <div>
                <label>CCV:</label><br/>
                <input
                  type="text"
                  value={ccv}
                  onChange={e => {
                    setCcv(e.target.value);
                    setValidationErrors(prev => ({ ...prev, ccv: null }));
                  }}
                  placeholder="123"
                  maxLength="4"
                  style={{ width: '80px' }}
                />
                {validationErrors.ccv && (
                  <div className="error-message" style={{ color: 'red', fontSize: '0.8em' }}>
                    {validationErrors.ccv}
                  </div>
                )}
              </div>
              <div>
                <label>Expiry Date:</label><br/>
                <input
                  type="month"
                  value={expiry}
                  onChange={e => {
                    setExpiry(e.target.value);
                    setValidationErrors(prev => ({ ...prev, expiry: null }));
                  }}
                />
                {validationErrors.expiry && (
                  <div className="error-message" style={{ color: 'red', fontSize: '0.8em' }}>
                    {validationErrors.expiry}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!orderInfo && cartItems.length > 0 && (
        <div style={{ marginTop: '1em' }}>
          <button 
            className="order-submit"
            onClick={() => navigate('/order')}
          >
            Add Delivery Information
          </button>
        </div>
      )}

      <button
        className="submit-order"
        onClick={handleSubmit}
        disabled={isProcessing || cartItems.length === 0 || !orderInfo}
        style={{ marginTop: '1em' }}
      >
        {isProcessing ? 'Processing...' : cartItems.length === 0 ? 'Cart Empty' : !orderInfo ? 'Add Delivery Info' : 'Checkout'}
      </button>
    </div>
  );
}

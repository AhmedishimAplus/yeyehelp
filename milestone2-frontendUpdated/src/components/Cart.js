// src/components/Cart.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import { cartService } from '../services/cartService';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    location: '',
    phone: ''
  });

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(item, newQuantity);
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await removeFromCart(item);
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      if (cartItems.length === 0) {
        setError('Please add items to your cart before checking out.');
        return;
      }

      // Validate delivery information
      if (!deliveryInfo.name || !deliveryInfo.location || !deliveryInfo.phone) {
        setError('Please fill in all delivery information fields.');
        return;
      }

      // Send order to backend
      const response = await cartService.completePurchase({
        paymentMethod,
        items: cartItems,
        deliveryInfo
      });

      if (response && response.purchase) {
        // Clear the cart after successful order
        await clearCart();
        setError(null);
        alert('Purchase completed successfully!');
        // Reset delivery info
        setDeliveryInfo({
          name: '',
          location: '',
          phone: ''
        });
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      console.error('Order error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while processing your order.';
      setError(errorMessage);
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

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={`${item.kitchenId}-${item.dishName}-${index}`} className="cart-item">
                <div className="item-details">
                  <h4>{item.dishName}</h4>
                  <p>Price: EGP {item.price.toFixed(2)}</p>
                </div>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  <p>Total: EGP {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  className="remove-button"
                  onClick={() => handleRemoveItem(item)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-totals">
            <p><strong>Subtotal:</strong> EGP {subtotal.toFixed(2)}</p>
            <p><strong>Tax (14%):</strong> EGP {tax.toFixed(2)}</p>
            <p><strong>Total:</strong> EGP {total.toFixed(2)}</p>
          </div>

          <div className="delivery-info">
            <h4>Delivery Information</h4>
            <input
              type="text"
              placeholder="Your Name"
              value={deliveryInfo.name}
              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Your Location"
              value={deliveryInfo.location}
              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, location: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={deliveryInfo.phone}
              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
            />
          </div>

          <div className="payment-methods">
            <p><strong>Select Payment Method:</strong></p>
            <label>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
              />{' '}
              Cash on Delivery
            </label>
            <label style={{ marginLeft: '1em' }}>
              <input
                type="radio"
                name="payment"
                value="visa"
                checked={paymentMethod === 'visa'}
                onChange={() => setPaymentMethod('visa')}
              />{' '}
              Visa Card
            </label>
          </div>

          <button
            className="checkout-button"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Purchase'}
          </button>
        </>
      )}
    </div>
  );
}

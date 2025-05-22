import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartProvider';
import Cart from '../components/Cart';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const handleCheckout = (paymentMethod, orderId) => {
    // navigate('/order-confirmation', {
    //   state: { orderId, paymentMethod }
    // });
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    console.log('Updating quantity:', { item, newQuantity }); // Debug log
    const success = await updateQuantity(
      {
        kitchenId: item.kitchenId || item.chefId,
        chefId: item.chefId || item.kitchenId,
        dishName: item.dishName || item.name
      },
      newQuantity
    );
    if (!success) {
      console.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (item) => {
    console.log('Removing item:', item); // Debug log

    // Ensure we have the required fields
    if (!item.dishName) {
      console.error('Cannot remove item: missing dishName');
      return;
    }

    // Get the kitchenId from either chefId or kitchenId field
    const kitchenId = item.kitchenId || item.chefId;
    if (!kitchenId) {
      console.error('Cannot remove item: missing kitchenId/chefId');
      return;
    }

    // Format the item data for removal
    const itemToRemove = {
      kitchenId: kitchenId,
      chefId: kitchenId,
      dishName: item.dishName,
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0
    };

    console.log('Removing item with data:', itemToRemove);
    const success = await removeFromCart(itemToRemove);

    if (!success) {
      console.error('Failed to remove item');
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div key={`${item.chefId || 'unknown'}-${item.dishName}-${index}`} className="cart-item">
            {item.image && (
              <img
                src={item.image}
                alt={item.dishName}
                className="cart-item-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                }}
              />
            )}
            <div className="cart-item-details">
              <h3>{item.dishName}</h3>
              <p>{item.description}</p>
              <p className="price">EGP {item.price ? item.price.toFixed(2) : '0.00'}</p>
            </div>
            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button
                  onClick={() => handleUpdateQuantity(item, (item.quantity || 1) - 1)}
                  disabled={(item.quantity || 1) <= 1}
                >
                  -
                </button>
                <span>{item.quantity || 1}</span>
                <button
                  onClick={() => handleUpdateQuantity(item, (item.quantity || 1) + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="remove-item"
                onClick={() => handleRemoveItem(item)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <Cart onCheckout={handleCheckout} />
      <button
        className="continue-shopping"
        onClick={() => navigate(-1)}
      >
        Continue Shopping
      </button>
    </div>
  );
}
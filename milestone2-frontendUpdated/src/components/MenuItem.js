// src/components/MenuItem.js
import React from 'react';

export default function MenuItem({ item, onAddToCart, onUpdateQuantity, quantity = 0 }) {
  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      dishName: item.dishName || item.name,
      chefId: item.chefId,
      kitchenId: item.kitchenId || item.chefId
    });
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity >= 0) {
      onUpdateQuantity({
        chefId: item.chefId,
        kitchenId: item.kitchenId || item.chefId,
        dishName: item.dishName || item.name
      }, newQuantity);
    }
  };

  return (
    <div className="menu-item-card">
      <img 
        src={item.image} 
        alt={item.name} 
        className="menu-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/images/no-image.png';
        }}
      />

      <div className="menu-item-details">
        <h4 className="menu-item-name">{item.name}</h4>
        <p className="menu-item-desc">{item.description}</p>
        <p className="menu-item-price">
          EGP {item.price ? item.price.toFixed(2) : '0.00'}
        </p>
        {quantity > 0 && (
          <div className="quantity-controls">
            <button onClick={() => handleUpdateQuantity(quantity - 1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => handleUpdateQuantity(quantity + 1)}>+</button>
          </div>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        className="order-submit"
      >
        {quantity > 0 ? 'Add Another' : 'Add to Cart'}
      </button>
    </div>
  );
}

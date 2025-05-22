import React, { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function PurchaseHistory() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setLoading(true);
                const response = await cartService.getPurchaseHistory();
                if (response.success) {
                    setPurchases(response.purchases);
                } else {
                    setError(response.message || 'Failed to load purchase history');
                }
            } catch (err) {
                setError('Failed to load purchase history');
                console.error('Error loading purchases:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);    if (loading) return (
        <div className="purchase-history">
            <div className="loading-spinner">
                <h3>Loading purchase history...</h3>
            </div>
        </div>
    );

    if (error) return (
        <div className="purchase-history">
            <div className="no-purchases">
                <h3 style={{ color: '#dc3545' }}>{error}</h3>
            </div>
        </div>
    );

    return (
        <div className="purchase-history">
            <h2>Purchase History</h2>
            {purchases.length === 0 ? (
                <div className="no-purchases">
                    <h3>No Orders Yet</h3>
                    <p>Your completed orders will appear here</p>
                </div>
            ) : (
                <div className="purchases-list">
                    {purchases.map((purchase, index) => (
                        <div key={index} className="purchase-card">
                            <div className="purchase-header">
                                <div className="purchase-date">
                                    {formatDate(purchase.purchasedAt)}
                                </div>
                                <span className={`purchase-status status-${purchase.status.toLowerCase()}`}>
                                    {purchase.status}
                                </span>
                            </div>
                            <div className="purchase-items">
                                <h4>Order Items</h4>
                                <div className="item-list">
                                    {purchase.items.map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            <span className="item-name">{item.dishName}</span>
                                            <span className="item-details">
                                                {item.quantity}x · EGP {item.price.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="purchase-total">
                                <div className="payment-method">
                                    {purchase.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Paid by Card'}
                                </div>
                                <div className="total-price">
                                    EGP {purchase.totalPrice.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
        </div>
    );
}
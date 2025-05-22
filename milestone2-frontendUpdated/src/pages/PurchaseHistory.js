import React, { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

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
    }, []);

    if (loading) return <div>Loading purchase history...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="purchase-history">
            <h2>Purchase History</h2>
            {purchases.length === 0 ? (
                <p>No purchase history available.</p>
            ) : (
                <div className="purchases-list">
                    {purchases.map((purchase, index) => (
                        <div key={index} className="purchase-card">
                            <div className="purchase-header">
                                <p><strong>Date:</strong> {new Date(purchase.purchasedAt).toLocaleDateString()}</p>
                                <p><strong>Payment Method:</strong> {purchase.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Visa Card'}</p>
                                <p><strong>Status:</strong> {purchase.status}</p>
                            </div>
                            <div className="purchase-items">
                                <h4>Items:</h4>
                                <ul>
                                    {purchase.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.dishName} - Quantity: {item.quantity} - EGP {item.price.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="purchase-total">
                                <p><strong>Total Price:</strong> EGP {purchase.totalPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';

interface AddTransactionProps {
    onAdd: (amount: number, description: string) => Promise<void>;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onAdd }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        setLoading(true);
        try {
            await onAdd(Number(amount), description || 'Manual Entry');
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error("Failed to add transaction", error);
            alert("Failed to save transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Log Spending</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Lunch, Drinks, etc."
                    />
                </div>
                <button type="submit" className="btn btn-outline" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Transaction'}
                </button>
            </form>
        </div>
    );
};

export default AddTransaction;

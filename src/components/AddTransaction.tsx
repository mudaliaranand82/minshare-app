import React, { useState } from 'react';

interface AddTransactionProps {
    onAdd: (amount: number, description: string) => Promise<void>;
    transactionCount: number;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onAdd, transactionCount }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form when transaction count changes (successful add)
    React.useEffect(() => {
        if (loading) {
            setLoading(false);
            setAmount('');
            setDescription('');
        }
    }, [transactionCount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        setLoading(true);
        // We don't await here anymore because we rely on the effect to clear loading
        // But we catch errors just in case
        onAdd(Number(amount), description || 'Manual Entry').catch(err => {
            console.error("Error adding:", err);
            setLoading(false);
            alert("Failed to add transaction");
        });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Log Transaction</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ flex: 1 }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-3 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        style={{ fontSize: '1rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Description (optional)</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Lunch, Drinks, etc."
                        className="w-full p-3 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        style={{ fontSize: '1rem' }}
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary w-full flex items-center justify-center"
                    disabled={loading}
                    style={{
                        height: '3rem',
                        borderRadius: '1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        marginTop: '0.75rem'
                    }}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span> Adding...
                        </span>
                    ) : '+ Add Transaction'}
                </button>
            </form>
        </div>
    );
};

export default AddTransaction;

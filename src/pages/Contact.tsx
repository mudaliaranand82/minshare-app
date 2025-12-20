import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Save to Firestore
            await addDoc(collection(db, 'contact_requests'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'new'
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Error saving contact request:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div className="glass-card" style={{
                    maxWidth: '450px',
                    width: '100%',
                    padding: '2.5rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(61, 103, 53, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2rem'
                    }}>
                        ✅
                    </div>
                    <h2 style={{
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)',
                        marginBottom: '1rem'
                    }}>
                        Message Sent!
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        Thanks for reaching out! The admin will get back to you soon.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '2.5rem'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)',
                        marginBottom: '0.5rem'
                    }}>
                        Contact Admin
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                        Interested in joining MinShare? Send us a message.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Your Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Smith"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                background: 'white',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                background: 'white',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(555) 123-4567"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                background: 'white',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Message *
                        </label>
                        <textarea
                            name="message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="I'm a member at [Club Name] and would like to use MinShare..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                background: 'white',
                                fontSize: '1rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            justifyContent: 'center'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>

                    {error && (
                        <p style={{
                            color: 'var(--color-danger)',
                            textAlign: 'center',
                            marginTop: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </p>
                    )}
                </form>

                {/* Back link */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Contact;

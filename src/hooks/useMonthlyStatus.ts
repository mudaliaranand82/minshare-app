import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string; // ISO string
}

interface MonthlyStatus {
    plannedUsage: number; // Deprecated but keeping for compatibility if needed, or can remove
    actualUsage: number;
    donatedAmount: number;
    isFullUsage: boolean;
    transactions: Transaction[];
}

export const useMonthlyStatus = () => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState<MonthlyStatus>({
        plannedUsage: 75,
        actualUsage: 0,
        donatedAmount: 0,
        isFullUsage: false,
        transactions: []
    });
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    useEffect(() => {
        if (!currentUser) return;

        const docRef = doc(db, 'monthly_status', `${currentUser.uid}_${currentMonth}`);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setStatus(docSnap.data() as MonthlyStatus);
            } else {
                // Initialize if not exists
                setDoc(docRef, {
                    uid: currentUser.uid,
                    month: currentMonth,
                    plannedUsage: 75,
                    actualUsage: 0,
                    donatedAmount: 0,
                    isFullUsage: false,
                    transactions: []
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching monthly status:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser, currentMonth]);

    const updatePlannedUsage = async (amount: number) => {
        if (!currentUser) return;
        const docRef = doc(db, 'monthly_status', `${currentUser.uid}_${currentMonth}`);
        await updateDoc(docRef, {
            plannedUsage: amount,
            donatedAmount: Math.max(75 - amount, 0)
        });
    };

    const addTransaction = async (amount: number, description: string) => {
        if (!currentUser) return;
        const docRef = doc(db, 'monthly_status', `${currentUser.uid}_${currentMonth}`);

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            amount,
            description,
            date: new Date().toISOString()
        };

        try {
            await updateDoc(docRef, {
                actualUsage: increment(amount),
                transactions: arrayUnion(newTransaction)
            });
        } catch (error) {
            console.error("Error adding transaction:", error);
            throw error;
        }
    };

    const markFullUsage = async () => {
        if (!currentUser) return;
        const docRef = doc(db, 'monthly_status', `${currentUser.uid}_${currentMonth}`);
        await updateDoc(docRef, {
            actualUsage: 75,
            isFullUsage: true,
            donatedAmount: 0 // If they use all, they donate 0? Or maybe this logic is different. Assuming use all means no donation.
        });
    };

    const donateSurplus = async (target: 'staff' | 'charity') => {
        if (!currentUser) return;
        const docRef = doc(db, 'monthly_status', `${currentUser.uid}_${currentMonth}`);
        await updateDoc(docRef, {
            allocationTarget: target
        });
    };

    const resetMonth = async () => {
        if (!currentUser) return;
        const docRef = doc(db, 'monthly_status', `${currentUser.uid}_${currentMonth}`);
        await setDoc(docRef, {
            uid: currentUser.uid,
            month: currentMonth,
            plannedUsage: 75,
            actualUsage: 0,
            donatedAmount: 0,
            isFullUsage: false,
            transactions: []
        });
    };

    return { status, loading, updatePlannedUsage, addTransaction, markFullUsage, donateSurplus, resetMonth };
};

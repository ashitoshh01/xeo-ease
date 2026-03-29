import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { db, storage, auth } from './firebase';
import type { Shop, Job, CustomerFormData, ShopPricing } from '@/types';

const SHOP_ID = import.meta.env.VITE_SHOP_ID || 'demo-shop';

// ─── Shop ────────────────────────────────────────────────
export async function getShop(): Promise<Shop | null> {
    const snap = await getDoc(doc(db, 'shops', SHOP_ID));
    if (!snap.exists()) return null;
    return { shopId: snap.id, ...snap.data() } as Shop;
}

export async function updateShopSettings(data: Partial<Shop>): Promise<void> {
    await updateDoc(doc(db, 'shops', SHOP_ID), data);
}

export async function updateShopPricing(pricing: ShopPricing): Promise<void> {
    await updateDoc(doc(db, 'shops', SHOP_ID), { pricing });
}

// ─── Jobs ────────────────────────────────────────────────
export function subscribeToJobs(callback: (jobs: Job[]) => void): () => void {
    const q = query(
        collection(db, 'shops', SHOP_ID, 'jobs'),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const jobs = snapshot.docs.map((d) => ({
            jobId: d.id,
            ...d.data(),
        })) as Job[];
        callback(jobs);
    });
}

export function subscribeToPendingJobs(callback: (jobs: Job[]) => void): () => void {
    const q = query(
        collection(db, 'shops', SHOP_ID, 'jobs'),
        where('status', 'in', ['pending', 'inprogress']),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const jobs = snapshot.docs.map((d) => ({
            jobId: d.id,
            ...d.data(),
        })) as Job[];
        callback(jobs);
    });
}

export async function getTodayJobs(): Promise<Job[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, 'shops', SHOP_ID, 'jobs'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        orderBy('createdAt', 'asc')
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ jobId: d.id, ...d.data() })) as Job[];
}

export async function getJobById(jobId: string): Promise<Job | null> {
    const snap = await getDoc(doc(db, 'shops', SHOP_ID, 'jobs', jobId));
    if (!snap.exists()) return null;
    return { jobId: snap.id, ...snap.data() } as Job;
}

export async function getQueuePosition(jobId: string): Promise<number> {
    const q = query(
        collection(db, 'shops', SHOP_ID, 'jobs'),
        where('status', 'in', ['pending', 'inprogress']),
        orderBy('createdAt', 'asc')
    );

    const snap = await getDocs(q);
    const index = snap.docs.findIndex((d) => d.id === jobId);
    return index === -1 ? 0 : index + 1;
}

export async function getNextTokenNumber(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, 'shops', SHOP_ID, 'jobs'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(q);
    if (snap.empty) return 1;

    const lastJob = snap.docs[0].data() as Job;
    return (lastJob.tokenNumber || 0) + 1;
}

export async function createJob(
    formData: CustomerFormData,
    fileUrl: string,
    amountPaid: number,
    razorpayPaymentId: string
): Promise<string> {
    const tokenNumber = await getNextTokenNumber();

    const jobData = {
        tokenNumber,
        customerName: formData.customerName,
        phone: formData.phone,
        fileUrl,
        fileName: formData.fileName,
        fileType: formData.fileType,
        pageCount: formData.pageCount,
        config: formData.config,
        amountPaid,
        razorpayPaymentId,
        status: 'pending',
        createdAt: serverTimestamp(),
        printedAt: null,
    };

    const docRef = await addDoc(collection(db, 'shops', SHOP_ID, 'jobs'), jobData);
    return docRef.id;
}

export async function markJobAsPrinted(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'shops', SHOP_ID, 'jobs', jobId), {
        status: 'printed',
        printedAt: serverTimestamp(),
    });
}

export async function reopenJob(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'shops', SHOP_ID, 'jobs', jobId), {
        status: 'pending',
        printedAt: null,
    });
}

// ─── File Upload ─────────────────────────────────────────
export function uploadFile(
    file: File,
    onProgress: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const storageRef = ref(storage, `uploads/${SHOP_ID}/${timestamp}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(Math.round(progress));
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
}

// ─── Auth ────────────────────────────────────────────────
export async function adminLogin(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function adminLogout(): Promise<void> {
    await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// ─── Analytics Helpers ───────────────────────────────────
export async function getWeeklyRevenue(): Promise<{ day: string; revenue: number; date: string }[]> {
    const result: { day: string; revenue: number; date: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'shops', SHOP_ID, 'jobs'),
            where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
            where('createdAt', '<=', Timestamp.fromDate(endOfDay))
        );

        const snap = await getDocs(q);
        const revenue = snap.docs.reduce((sum, d) => {
            const data = d.data();
            return sum + (data.amountPaid || 0);
        }, 0);

        result.push({
            day: dayNames[date.getDay()],
            revenue,
            date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        });
    }

    return result;
}

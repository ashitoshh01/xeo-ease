import type { Timestamp } from 'firebase/firestore';

// ─── Enums ───────────────────────────────────────────────
export type ColorMode = 'bw' | 'color';
export type PrintSides = 'single' | 'double';
export type PageSize = 'A4' | 'A3' | 'Letter';
export type JobStatus = 'pending' | 'inprogress' | 'printed';

// ─── Print Configuration ─────────────────────────────────
export interface PrintConfig {
    colorMode: ColorMode;
    sides: PrintSides;
    pageSize: PageSize;
    copies: number;
    specialInstructions: string;
}

// ─── Pricing ─────────────────────────────────────────────
export interface ShopPricing {
    bw_single: number;
    bw_double: number;
    color_single: number;
    color_double: number;
    minimum_charge: number;
}

// ─── User Profile ────────────────────────────────────────
export interface UserProfile {
    uid: string;
    name: string;
    phone: string;
}

// ─── Shop ────────────────────────────────────────────────
export interface Shop {
    shopId: string;
    shopName: string;
    ownerName: string;
    phone: string;
    address: string;
    pricing: ShopPricing;
    createdAt: Timestamp;
}

export interface JobItem {
    fileUrl?: string; // only populated after upload or when reading from DB
    fileName: string;
    fileType: string;
    pageCount: number;
    config: PrintConfig;
}

export interface Job {
    jobId: string;
    tokenNumber: number;
    customerName: string;
    phone: string;
    items: JobItem[];
    amountPaid: number;
    razorpayPaymentId: string;
    status: JobStatus;
    createdAt: Timestamp;
    printedAt: Timestamp | null;
}

// ─── Form Data (before submission) ───────────────────────
export interface CustomerFormItem {
    id: string; // purely for local state UI tracking
    file: File | null;
    fileName: string;
    fileSize: number;
    fileType: string;
    pageCount: number;
    config: PrintConfig;
}

export interface CustomerFormData {
    customerName: string;
    phone: string;
    items: CustomerFormItem[];
}

// ─── Analytics Types ─────────────────────────────────────
export interface DailyStat {
    totalJobs: number;
    revenue: number;
    pendingJobs: number;
    avgWaitTime: number;
    colorJobs: number;
    bwJobs: number;
    busiestHour: string;
}

export interface WeeklyRevenue {
    day: string;
    revenue: number;
    date: string;
}

export interface FileTypeBreakdown {
    type: string;
    count: number;
    percentage: number;
}

// ─── Razorpay ────────────────────────────────────────────
export interface RazorpayOrder {
    orderId: string;
    amount: number;
    currency: string;
}

export interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// ─── Window augmentation for Razorpay ────────────────────
declare global {
    interface Window {
        Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
    }
}

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayInstance {
    open: () => void;
    close: () => void;
}

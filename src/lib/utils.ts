import type { PrintConfig, ShopPricing } from '@/types';

/**
 * Default pricing used when shop pricing is not yet loaded.
 * B&W single: ₹2/page, B&W double: ₹3/page, Color: ₹10/page
 */
export const DEFAULT_PRICING: ShopPricing = {
    bw_single: 2,
    bw_double: 3,
    color_single: 10,
    color_double: 20,
    minimum_charge: 0,
};

/**
 * Calculate cost based on print config
 * Formula:
 *   B&W single-sided: 2 × pages
 *   B&W double-sided: 3 × pages
 *   Color (single or double): 10 × pages
 */
export function calculateCost(
    config: PrintConfig,
    pageCount: number,
    pricing: ShopPricing = DEFAULT_PRICING
): number {
    let perPageRate: number;

    if (config.colorMode === 'color') {
        perPageRate = config.sides === 'single' ? pricing.color_single : pricing.color_double;
    } else {
        perPageRate = config.sides === 'single' ? pricing.bw_single : pricing.bw_double;
    }

    const total = perPageRate * pageCount * config.copies;
    return Math.max(total, pricing.minimum_charge);
}

/**
 * Get per-page rate label
 */
export function getPerPageRate(
    config: PrintConfig,
    pricing: ShopPricing = DEFAULT_PRICING
): number {
    if (config.colorMode === 'color') {
        return config.sides === 'single' ? pricing.color_single : pricing.color_double;
    }
    return config.sides === 'single' ? pricing.bw_single : pricing.bw_double;
}

/**
 * Format currency as INR
 */
export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format file size to KB/MB
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format time ago from a timestamp
 */
export function timeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return `${Math.floor(diffHours / 24)}d ago`;
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Validate Indian phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file type
 */
export function isValidFileType(fileName: string): boolean {
    const ext = getFileExtension(fileName);
    return ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'].includes(ext);
}

/**
 * Validate file size (max 20MB)
 */
export function isValidFileSize(size: number): boolean {
    return size <= 20 * 1024 * 1024;
}

/**
 * Format IST date/time
 */
export function formatIST(date: Date): string {
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format IST time only
 */
export function formatISTTime(date: Date): string {
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

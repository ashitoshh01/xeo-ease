import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Palette, Contrast, BookOpen, FileStack, ChevronDown, Plus, Trash2, LogOut, User as UserIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Input from '@/components/Input';
import Button from '@/components/Button';
import UploadZone from '@/components/UploadZone';
import PrintConfigToggle from '@/components/PrintConfigToggle';
import CopiesStepper from '@/components/CopiesStepper';
import { calculateCost, formatCurrency, isValidPhone, DEFAULT_PRICING } from '@/lib/utils';
import { getShop, uploadFile, createJob, subscribeToAuth, getUserProfile, adminLogout } from '@/lib/services';
import type { CustomerFormData, ShopPricing, CustomerFormItem } from '@/types';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const createEmptyItem = (): CustomerFormItem => ({
    id: Math.random().toString(36).substr(2, 9),
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    pageCount: 0,
    config: {
        colorMode: 'bw',
        sides: 'single',
        pageSize: 'A4',
        copies: 1,
        specialInstructions: '',
    },
});

export default function CustomerUpload() {
    const navigate = useNavigate();
    const [shopName, setShopName] = useState('PrintLoo');
    const [pricing, setPricing] = useState<ShopPricing>(DEFAULT_PRICING);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auth State
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState<CustomerFormData>({
        customerName: '',
        phone: '',
        items: [createEmptyItem()],
    });

    useEffect(() => {
        getShop().then((shop) => {
            if (shop) {
                setShopName(shop.shopName);
                if (shop.pricing) setPricing(shop.pricing);
            }
        });
    }, []);

    useEffect(() => {
        const unsub = subscribeToAuth(async (u) => {
            setUser(u);
            if (u) {
                const profile = await getUserProfile(u.uid);
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        customerName: profile.name || '',
                        phone: profile.phone || ''
                    }));
                }
            }
        });
        return unsub;
    }, []);

    const handleLogout = async () => {
        await adminLogout();
        setFormData(prev => ({ ...prev, customerName: '', phone: '' }));
    };

    const countPdfPages = useCallback(async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            return pdf.numPages;
        } catch {
            return 1;
        }
    }, []);

    const handleFileSelect = useCallback(
        async (file: File, itemId: string) => {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            let pageCount = 1;

            if (ext === 'pdf') {
                pageCount = await countPdfPages(file);
            }

            setFormData((prev) => ({
                ...prev,
                items: prev.items.map(item =>
                    item.id === itemId
                        ? { ...item, file, fileName: file.name, fileSize: file.size, fileType: ext, pageCount }
                        : item
                )
            }));

            setErrors((prev) => {
                const newErr = { ...prev };
                delete newErr[`file_${itemId}`];
                return newErr;
            });
        },
        [countPdfPages]
    );

    const handleFileRemove = useCallback((itemId: string) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId
                    ? { ...item, file: null, fileName: '', fileSize: 0, fileType: '', pageCount: 0 }
                    : item
            )
        }));
    }, []);

    const updateItemConfig = (itemId: string, updates: Partial<CustomerFormItem['config']>) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId
                    ? { ...item, config: { ...item.config, ...updates } }
                    : item
            )
        }));
    };

    const addNewItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, createEmptyItem()]
        }));
    };

    const removeItem = (itemId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId)
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!user && !formData.customerName.trim()) newErrors.customerName = 'Name is required';
        if (!user && !formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!user && !isValidPhone(formData.phone)) newErrors.phone = 'Enter a valid 10-digit mobile number';

        let hasFiles = false;
        formData.items.forEach((item) => {
            if (item.file) hasFiles = true;
            else if (formData.items.length === 1) newErrors[`file_${item.id}`] = 'Please upload a document';
        });

        if (!hasFiles && formData.items.length > 1) {
            newErrors.submit = 'Please upload at least one document.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Filter to only items that actually have files uploaded
    const validItems = formData.items.filter(i => i.file !== null);

    const totalCost = validItems.reduce((acc, item) => {
        return acc + calculateCost(item.config, item.pageCount, pricing);
    }, 0);

    const handleSubmit = async () => {
        if (!validate() || validItems.length === 0) return;

        setLoading(true);

        const res = await loadRazorpayScript();
        if (!res) {
            setErrors({ submit: 'Razorpay SDK failed to load. Please check your connection.' });
            setLoading(false);
            return;
        }

        const options = {
            key: 'rzp_test_SWym31WQWRb3mG',
            amount: totalCost * 100, // paise
            currency: 'INR',
            name: 'PrintLoo Queue',
            description: `Payment for ${validItems.length} document(s)`,
            handler: async function (response: any) {
                try {
                    setLoading(true);

                    // Upload all files concurrently and get their download URLs 
                    let uploadedCount = 0;
                    const finalItems = await Promise.all(validItems.map(async (item) => {
                        const url = await uploadFile(item.file!, (prog) => {
                            // Rough overall progress calculation
                            setUploadProgress(Math.round(((uploadedCount * 100) + prog) / validItems.length));
                        });
                        uploadedCount++;
                        return {
                            fileUrl: url,
                            fileName: item.fileName,
                            fileType: item.fileType,
                            pageCount: item.pageCount,
                            config: item.config
                        };
                    }));

                    const jobId = await createJob(formData, finalItems, totalCost, response.razorpay_payment_id);
                    navigate(`/confirmation?jobId=${jobId}`);
                } catch (error) {
                    console.error('Submission error:', error);
                    setErrors({ submit: 'Payment succeeded, but job creation failed. Please contact the shop.' });
                    setLoading(false);
                }
            },
            prefill: {
                name: formData.customerName,
                contact: formData.phone,
            },
            theme: { color: '#1A56DB' },
            modal: { ondismiss: function () { setLoading(false); } },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (res: any) {
            setErrors({ submit: res.error.description || 'Payment Failed' });
            setLoading(false);
        });
        rzp.open();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="PrintLoo" className="h-[40px] sm:h-[50px] w-auto object-contain cursor-pointer" />
                        <div className="hidden sm:block">
                            <p className="text-[12px] text-text-secondary leading-tight mt-1">{shopName}</p>
                        </div>
                    </div>

                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-[14px] font-medium text-text-primary hidden sm:inline-block">
                                    Hello, {formData.customerName || 'User'}
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut size={16} />}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button variant="secondary" size="sm" icon={<UserIcon size={16} />}>
                                    Login / Signup
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
                <div className="flex flex-col gap-8">

                    {/* Zone 1: Contact Info (Hidden if logged in) */}
                    {!user && (
                        <section className="animate-fade-in">
                            <h2 className="text-[17px] font-semibold text-text-primary mb-4">Your Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Your Name"
                                    placeholder="Enter your name"
                                    value={formData.customerName}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, customerName: e.target.value }));
                                        setErrors((prev) => ({ ...prev, customerName: '' }));
                                    }}
                                    error={errors.customerName}
                                />
                                <Input
                                    label="Mobile Number"
                                    placeholder="10-digit mobile number"
                                    type="tel"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData((prev) => ({ ...prev, phone: val }));
                                        setErrors((prev) => ({ ...prev, phone: '' }));
                                    }}
                                    error={errors.phone}
                                />
                            </div>
                        </section>
                    )}

                    {/* Zone 2: Documents list */}
                    <div className="flex items-center justify-between mt-2">
                        <h2 className="text-[17px] font-semibold text-text-primary">Documents</h2>
                        <Button variant="ghost" size="sm" onClick={addNewItem} icon={<Plus size={16} />}>
                            Add Another
                        </Button>
                    </div>

                    {formData.items.map((item, index) => (
                        <section key={item.id} className="animate-fade-in stagger-1 bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-sm relative">
                            {/* Remove individual document button */}
                            {formData.items.length > 1 && (
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-4 right-4 text-text-muted hover:text-error transition-colors p-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <h3 className="text-[14px] font-medium text-text-secondary uppercase tracking-wider mb-4">
                                Document {index + 1}
                            </h3>

                            <div className="mb-6">
                                <UploadZone
                                    file={item.file}
                                    pageCount={item.pageCount}
                                    uploadProgress={uploadProgress}
                                    onFile={(f) => handleFileSelect(f, item.id)}
                                    onRemove={() => handleFileRemove(item.id)}
                                />
                                {errors[`file_${item.id}`] && (
                                    <p className="text-[12px] text-error font-medium mt-2">{errors[`file_${item.id}`]}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-5 border-t border-border pt-5">
                                <PrintConfigToggle
                                    label="Colour Mode"
                                    options={[
                                        { value: 'bw', label: 'Black & White', icon: <Contrast size={20} /> },
                                        { value: 'color', label: 'Colour', icon: <Palette size={20} /> },
                                    ]}
                                    selected={item.config.colorMode}
                                    onChange={(val) => updateItemConfig(item.id, { colorMode: val as 'bw' | 'color' })}
                                />

                                <PrintConfigToggle
                                    label="Print Sides"
                                    options={[
                                        { value: 'single', label: 'Single-sided', icon: <FileStack size={20} /> },
                                        { value: 'double', label: 'Double-sided', icon: <BookOpen size={20} /> },
                                    ]}
                                    selected={item.config.sides}
                                    onChange={(val) => updateItemConfig(item.id, { sides: val as 'single' | 'double' })}
                                />

                                {/* Page Size */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Page Size</span>
                                    <div className="relative">
                                        <select
                                            value={item.config.pageSize}
                                            onChange={(e) => updateItemConfig(item.id, { pageSize: e.target.value as 'A4' | 'A3' | 'Letter' })}
                                            className="w-full h-12 px-4 pr-10 rounded-xl border border-border bg-white text-text-primary appearance-none cursor-pointer focus:border-blue-primary focus:ring-2 focus:ring-blue-primary/20 outline-none"
                                        >
                                            <option value="A4">A4</option>
                                            <option value="A3">A3</option>
                                            <option value="Letter">Letter</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                    </div>
                                </div>

                                {/* Copies */}
                                <CopiesStepper
                                    label="Number of Copies"
                                    value={item.config.copies}
                                    onChange={(val) => updateItemConfig(item.id, { copies: val })}
                                />

                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Special Instructions</span>
                                    </div>
                                    <textarea
                                        value={item.config.specialInstructions}
                                        onChange={(e) => updateItemConfig(item.id, { specialInstructions: e.target.value.substring(0, 120) })}
                                        placeholder="Any special print instructions? (optional)"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted resize-none outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-primary/20"
                                    />
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            {/* Zone 3: Cost Summary — Sticky Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-t-blue-primary z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    {validItems.length > 0 && (
                        <div className="flex justify-between items-center text-[13px] text-text-secondary mb-3">
                            <span>{validItems.length} document(s) uploaded</span>
                            <span className="font-semibold text-[17px] text-text-primary">{formatCurrency(totalCost)}</span>
                        </div>
                    )}
                    {errors.submit && (
                        <p className="text-[12px] text-error font-medium mb-2">{errors.submit}</p>
                    )}
                    <Button
                        variant="primary"
                        className="w-full"
                        loading={loading}
                        onClick={handleSubmit}
                        disabled={validItems.length === 0}
                    >
                        {totalCost > 0 ? `Pay ${formatCurrency(totalCost)} & Join Queue` : 'Upload & Join Queue'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

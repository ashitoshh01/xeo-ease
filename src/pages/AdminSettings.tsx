import { useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { getShop, updateShopSettings, updateShopPricing } from '@/lib/services';
import type { Shop, ShopPricing } from '@/types';
import { DEFAULT_PRICING } from '@/lib/utils';

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPricing, setSavingPricing] = useState(false);
    const [success, setSuccess] = useState('');

    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [pricing, setPricing] = useState<ShopPricing>(DEFAULT_PRICING);

    useEffect(() => {
        getShop().then((shop: Shop | null) => {
            if (shop) {
                setShopName(shop.shopName || '');
                setOwnerName(shop.ownerName || '');
                setPhone(shop.phone || '');
                setAddress(shop.address || '');
                if (shop.pricing) setPricing(shop.pricing);
            }
            setLoading(false);
        });
    }, []);

    const handleSaveShop = async () => {
        setSaving(true);
        setSuccess('');
        try {
            await updateShopSettings({ shopName, ownerName, phone, address } as Partial<Shop>);
            setSuccess('Shop details saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving shop:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePricing = async () => {
        setSavingPricing(true);
        setSuccess('');
        try {
            await updateShopPricing(pricing);
            setSuccess('Pricing updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving pricing:', err);
        } finally {
            setSavingPricing(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="skeleton h-80 w-full mb-6" />
                <div className="skeleton h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-[22px] font-semibold text-text-primary mb-6 animate-fade-in">
                Settings
            </h1>

            {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-[14px] text-green-800 font-medium animate-slide-up">
                    ✅ {success}
                </div>
            )}

            {/* Shop Details */}
            <Card hover={false} className="mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center">
                        <Store size={18} className="text-blue-primary" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-text-primary">Shop Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <Input
                        label="Shop Name"
                        placeholder="My Xerox Shop"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                    />
                    <Input
                        label="Owner Name"
                        placeholder="Shop owner's name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                    />
                    <Input
                        label="Phone"
                        placeholder="10-digit mobile"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        label="Address"
                        placeholder="Shop address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <Button
                    variant="primary"
                    loading={saving}
                    icon={<Save size={16} />}
                    onClick={handleSaveShop}
                >
                    Save Shop Details
                </Button>
            </Card>

            {/* Pricing */}
            <Card hover={false} className="animate-fade-in stagger-2">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center">
                        <span className="text-blue-primary font-bold text-[15px]">₹</span>
                    </div>
                    <h2 className="text-[17px] font-semibold text-text-primary">Pricing (per page)</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input
                        label="B&W Single-sided"
                        type="number"
                        min={0}
                        value={String(pricing.bw_single)}
                        onChange={(e) =>
                            setPricing((prev) => ({ ...prev, bw_single: Number(e.target.value) }))
                        }
                        helpText="₹ per page"
                    />
                    <Input
                        label="B&W Double-sided"
                        type="number"
                        min={0}
                        value={String(pricing.bw_double)}
                        onChange={(e) =>
                            setPricing((prev) => ({ ...prev, bw_double: Number(e.target.value) }))
                        }
                        helpText="₹ per page"
                    />
                    <Input
                        label="Colour Single-sided"
                        type="number"
                        min={0}
                        value={String(pricing.color_single)}
                        onChange={(e) =>
                            setPricing((prev) => ({ ...prev, color_single: Number(e.target.value) }))
                        }
                        helpText="₹ per page"
                    />
                    <Input
                        label="Colour Double-sided"
                        type="number"
                        min={0}
                        value={String(pricing.color_double)}
                        onChange={(e) =>
                            setPricing((prev) => ({ ...prev, color_double: Number(e.target.value) }))
                        }
                        helpText="₹ per page"
                    />
                </div>

                <Input
                    label="Minimum Charge"
                    type="number"
                    min={0}
                    value={String(pricing.minimum_charge)}
                    onChange={(e) =>
                        setPricing((prev) => ({ ...prev, minimum_charge: Number(e.target.value) }))
                    }
                    helpText="₹ minimum per order (0 = no minimum)"
                    className="mb-5"
                />

                {/* Pricing Preview */}
                <div className="bg-background rounded-xl p-4 mb-5 border border-border">
                    <p className="text-[13px] font-medium text-text-secondary uppercase tracking-wider mb-3">
                        Preview
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[13px]">
                        <span className="text-text-secondary">1 page B&W (single)</span>
                        <span className="text-text-primary font-medium text-right">₹{pricing.bw_single}</span>
                        <span className="text-text-secondary">1 page B&W (double)</span>
                        <span className="text-text-primary font-medium text-right">₹{pricing.bw_double}</span>
                        <span className="text-text-secondary">1 page Colour (single)</span>
                        <span className="text-text-primary font-medium text-right">₹{pricing.color_single}</span>
                        <span className="text-text-secondary">1 page Colour (double)</span>
                        <span className="text-text-primary font-medium text-right">₹{pricing.color_double}</span>
                        <span className="text-text-secondary">10 pages B&W single × 2 copies</span>
                        <span className="text-text-primary font-medium text-right">₹{pricing.bw_single * 10 * 2}</span>
                    </div>
                </div>

                <Button
                    variant="primary"
                    loading={savingPricing}
                    icon={<Save size={16} />}
                    onClick={handleSavePricing}
                >
                    Save Pricing
                </Button>
            </Card>
        </div>
    );
}

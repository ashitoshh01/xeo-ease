import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Mail, Lock, AlertCircle } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { adminLogin } from '@/lib/services';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            await adminLogin(email, password);
            navigate('/admin/queue');
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-sm animate-scale-in">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-primary flex items-center justify-center mb-4 shadow-lg shadow-blue-primary/20">
                        <Printer size={32} className="text-white" />
                    </div>
                    <h1 className="text-[22px] font-semibold text-text-primary">PrintLoo Admin</h1>
                    <p className="text-[14px] text-text-secondary mt-1">Sign in to manage your queue</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="admin@printloo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Mail size={16} className="absolute right-4 top-[42px] text-text-muted" />
                        </div>

                        <div className="relative">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Lock size={16} className="absolute right-4 top-[42px] text-text-muted" />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                                <AlertCircle size={16} className="text-error flex-shrink-0" />
                                <p className="text-[13px] text-error font-medium">{error}</p>
                            </div>
                        )}

                        <Button variant="primary" className="w-full mt-2" loading={loading} type="submit">
                            Sign In
                        </Button>
                    </form>
                </div>

                <p className="text-center text-[12px] text-text-muted mt-6">
                    PrintLoo — Smart Print Queue Management
                </p>
            </div>
        </div>
    );
}

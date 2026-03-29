import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { saveUserProfile } from '@/lib/services';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';

export default function CustomerAuth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.phone.length !== 10) {
            return setError('Please enter a valid 10-digit mobile number.');
        }

        if (!isLogin && form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        // Map phone to a dummy email for Firebase Auth
        const dummyEmail = `${form.phone}@printloo.com`;

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, dummyEmail, form.password);
                navigate(redirectTo);
            } else {
                if (!form.name || !form.phone) throw new Error("Name and Phone are required");
                const cred = await createUserWithEmailAndPassword(auth, dummyEmail, form.password);
                try {
                    await saveUserProfile(cred.user.uid, {
                        uid: cred.user.uid,
                        name: form.name,
                        phone: form.phone
                    });
                } catch (dbError: any) {
                    console.error('Failed to save profile (Firestore Rules issue):', dbError);
                    // We don't throw here, to allow the user to continue even if DB rules aren't set yet.
                }
                navigate(redirectTo);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this mobile number already exists.');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Invalid mobile number or password.');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Link to={redirectTo} className="absolute top-6 left-6 text-text-muted hover:text-text-primary transition-colors flex items-center gap-2 text-sm font-medium">
                <ArrowLeft size={16} /> Back to Upload
            </Link>

            <div className="mb-8 text-center">
                <img src="/logo.png" alt="PrintLoo" className="h-12 w-auto mx-auto mb-3" />
                <h1 className="text-2xl font-semibold text-text-primary">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-text-secondary mt-1">
                    {isLogin ? 'Sign in to access your print history and quick checkout' : 'Sign up to skip filling details every time'}
                </p>
            </div>

            <Card className="w-full max-w-md p-6 sm:p-8 animate-fade-in" hover={false}>
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-[13px] text-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    )}

                    <Input
                        type="tel"
                        label="Mobile Number"
                        placeholder="10-digit number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />

                    {!isLogin && (
                        <Input
                            type="password"
                            label="Re-enter Password"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />
                    )}

                    <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-[14px] text-text-secondary">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-blue-primary font-medium hover:underline cursor-pointer"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>

                {isLogin && (
                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <Link to="/admin/login" className="text-[13px] text-text-muted hover:text-text-primary transition-colors font-medium">
                            Store Owner? Admin Login
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    );
}

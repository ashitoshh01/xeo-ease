import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { subscribeToAuth, adminLogout, getShop } from '@/lib/services';
import PageLoader from '@/components/PageLoader';
import type { User } from 'firebase/auth';

export default function AdminLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [shopName, setShopName] = useState('PrintLoo');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const unsub = subscribeToAuth((u) => {
            setUser(u);
            setLoading(false);
            if (!u) navigate('/admin/login');
        });
        return unsub;
    }, [navigate]);

    useEffect(() => {
        getShop().then((shop) => {
            if (shop) setShopName(shop.shopName);
        });
    }, []);

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin/login');
    };

    if (loading) return <PageLoader />;
    if (!user) return null;

    const navItems = [
        { to: '/admin/queue', label: 'Queue', icon: LayoutDashboard },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar z-40 flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Sidebar Header */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
                    <img src="/logo.png" alt="PrintLoo" className="h-[32px] w-auto object-contain" />
                    <div className="flex-1">
                        <p className="text-[11px] text-text-muted leading-tight mt-1">{shopName}</p>
                    </div>
                    <button
                        className="lg:hidden w-8 h-8 flex items-center justify-center text-text-muted hover:text-white cursor-pointer"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="px-3 pb-4">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-left hover:text-red-400 cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar (mobile) */}
                <header className="bg-white border-b border-border h-16 flex items-center px-4 lg:px-8 sticky top-0 z-20">
                    <button
                        className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-background mr-3 cursor-pointer"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} className="text-text-primary" />
                    </button>
                    <h2 className="text-[17px] font-semibold text-text-primary flex-1">{shopName}</h2>
                    <div className="text-[13px] text-text-secondary">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Asia/Kolkata',
                        })}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Briefcase, IndianRupee, Clock, TrendingUp, FileText, Image as ImageIcon, File } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import { getTodayJobs, getWeeklyRevenue } from '@/lib/services';
import { formatCurrency } from '@/lib/utils';
import type { Job } from '@/types';

const PIE_COLORS = ['#1A56DB', '#E8F0FE'];

export default function AdminAnalytics() {
    const [todayJobs, setTodayJobs] = useState<Job[]>([]);
    const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; revenue: number; date: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobs, weekly] = await Promise.all([getTodayJobs(), getWeeklyRevenue()]);
                setTodayJobs(jobs);
                setWeeklyRevenue(weekly);
            } catch (err) {
                console.error('Analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate stats
    const totalJobs = todayJobs.length;
    const revenue = todayJobs.reduce((sum, j) => sum + (j.amountPaid || 0), 0);
    const pendingJobs = todayJobs.filter((j) => j.status === 'pending' || j.status === 'inprogress').length;

    const printedJobs = todayJobs.filter((j) => j.status === 'printed');
    const avgWaitTime =
        printedJobs.length > 0
            ? Math.round(
                printedJobs.reduce((sum, j) => {
                    const created = j.createdAt?.toDate ? j.createdAt.toDate().getTime() : 0;
                    const printed = j.printedAt?.toDate ? j.printedAt.toDate().getTime() : 0;
                    return sum + (printed - created) / 60000;
                }, 0) / printedJobs.length
            )
            : 0;

    const colorJobs = todayJobs.reduce((sum, j) => sum + (j.items?.filter(i => i.config.colorMode === 'color').length || 0), 0);
    const bwJobs = todayJobs.reduce((sum, j) => sum + (j.items?.filter(i => i.config.colorMode === 'bw').length || 0), 0);

    const pieData = [
        { name: 'B&W', value: bwJobs || 1 },
        { name: 'Colour', value: colorJobs || 0 },
    ];

    // File type breakdown
    const fileTypeCounts: Record<string, number> = {};
    todayJobs.forEach((j) => {
        j.items?.forEach(item => {
            const ext = (item.fileType || 'unknown').toUpperCase();
            fileTypeCounts[ext] = (fileTypeCounts[ext] || 0) + 1;
        });
    });
    const fileTypes = Object.entries(fileTypeCounts)
        .map(([type, count]) => ({
            type,
            count,
            percentage: totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

    function getFileTypeIcon(type: string) {
        if (type === 'PDF') return <FileText size={16} className="text-blue-primary" />;
        if (['JPG', 'JPEG', 'PNG'].includes(type)) return <ImageIcon size={16} className="text-blue-primary" />;
        return <File size={16} className="text-blue-primary" />;
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-28 w-full" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="skeleton h-72 w-full" />
                    <div className="skeleton h-72 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-[22px] font-semibold text-text-primary mb-6 animate-fade-in">
                Analytics
            </h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Jobs"
                    value={totalJobs}
                    subtitle="today"
                    icon={<Briefcase size={18} className="text-blue-primary" />}
                    accent
                />
                <StatCard
                    title="Revenue"
                    value={formatCurrency(revenue)}
                    subtitle="today"
                    icon={<IndianRupee size={18} className="text-blue-primary" />}
                    accent
                />
                <StatCard
                    title="Pending"
                    value={pendingJobs}
                    subtitle="in queue"
                    icon={<Clock size={18} className="text-blue-primary" />}
                    accent
                />
                <StatCard
                    title="Avg Wait"
                    value={`${avgWaitTime} min`}
                    subtitle="per job"
                    icon={<TrendingUp size={18} className="text-blue-primary" />}
                    accent
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Revenue Chart */}
                <Card hover={false} className="animate-fade-in stagger-2">
                    <h3 className="text-[15px] font-semibold text-text-primary mb-4">Weekly Revenue</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyRevenue} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12, fill: '#64748B' }}
                                    axisLine={{ stroke: '#E2E8F0' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748B' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val: number) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        fontSize: '13px',
                                    }}
                                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                                    labelFormatter={(label) => `Day: ${String(label)}`}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#1A56DB"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={48}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* B&W vs Colour Pie */}
                <Card hover={false} className="animate-fade-in stagger-3">
                    <h3 className="text-[15px] font-semibold text-text-primary mb-4">B&W vs Colour</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                    }}
                                    formatter={(value, name) => [value, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-primary" />
                            <span className="text-[13px] text-text-secondary">B&W ({bwJobs})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-light" />
                            <span className="text-[13px] text-text-secondary">Colour ({colorJobs})</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* File Types Breakdown */}
            <Card hover={false} className="animate-fade-in stagger-4">
                <h3 className="text-[15px] font-semibold text-text-primary mb-4">Document Types</h3>
                {fileTypes.length === 0 ? (
                    <p className="text-[14px] text-text-muted py-4 text-center">No data available yet</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {fileTypes.map((ft) => (
                            <div key={ft.type} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-light flex items-center justify-center flex-shrink-0">
                                    {getFileTypeIcon(ft.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[14px] font-medium text-text-primary">{ft.type}</span>
                                        <span className="text-[13px] text-text-secondary">
                                            {ft.count} ({ft.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                                        <div
                                            className="h-2 bg-blue-primary rounded-full transition-all duration-500"
                                            style={{ width: `${ft.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

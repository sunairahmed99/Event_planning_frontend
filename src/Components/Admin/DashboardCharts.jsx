import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../Features/DashboardSlice';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Layers, Activity, MessageSquare, Star } from 'lucide-react';

const DashboardCharts = () => {
    const dispatch = useDispatch();
    const { stats, monthlyData, loading, error } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-blue-500">
                <Activity className="animate-spin mr-2" /> Loading stats...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-xl">
                Error: {error}
            </div>
        );
    }

    const statsCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={24} />, color: '#3b82f6' },
        { label: 'Total Events', value: stats?.totalEvents || 0, icon: <Calendar size={24} />, color: '#10b981' },
        { label: 'Categories', value: stats?.totalCategories || 0, icon: <Layers size={24} />, color: '#f59e0b' },
        { label: 'Active Chats', value: stats?.activeChatsCount || 0, icon: <MessageSquare size={24} />, color: '#8b5cf6' },
        { label: 'Total Reviews', value: stats?.totalReviews || 0, icon: <Star size={24} />, color: '#ec4899' },
        { label: 'Consultations', value: stats?.totalConsultations || 0, icon: <Activity size={24} />, color: '#06b6d4' },
    ];

    return (
        <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="stat-header">
                            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="stat-info">
                            <span className="value">{stat.value}</span>
                            <span className="label">{stat.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="chart-grid">
                {/* Growth Chart */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>Growth Analytics (Last 7 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Comparison Chart */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>User vs Event Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                            <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="events" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardCharts;

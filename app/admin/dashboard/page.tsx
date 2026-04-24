'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
    totalUsers: number;
    totalSellers: number;
    totalBuyers: number;
    totalTransactions: number;
    envImpact: {
        waterSaved: number; // in liters
        co2Reduced: number; // in kg
        wasteDiverted: number; // in kg
    }
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalSellers: 0,
        totalBuyers: 0,
        totalTransactions: 0,
        envImpact: {
            waterSaved: 0,
            co2Reduced: 0,
            wasteDiverted: 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Users
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const users = usersSnapshot.docs.map(doc => doc.data());

                const sellers = users.filter(u => u.role === 'seller').length;
                const buyers = users.filter(u => u.role === 'buyer').length;

                // Fetch Transactions (Mocked if collection doesn't exist yet, or simple count)
                // Assuming 'orders' collection exists for transactions
                // Fetch Transactions
                let transactionsCount = 0;
                let totalItemsSold = 0;
                try {
                    const ordersSnapshot = await getDocs(collection(db, 'orders'));
                    transactionsCount = ordersSnapshot.size;

                    // Calculate totals from orders
                    ordersSnapshot.forEach(doc => {
                        const orderData = doc.data();
                        if (orderData.items && Array.isArray(orderData.items)) {
                            orderData.items.forEach((item: any) => {
                                totalItemsSold += (item.quantity || 1);
                            });
                        }
                    });
                } catch (e) {
                    console.log('Orders collection not found or empty, using 0');
                }

                // Calculate Environmental Impact based on ACTUAL items sold
                // Estimates per upcycled item:
                // Water Saved: ~500 Liters (conservative vs new production)
                // CO2 Reduced: ~2 Kg
                // Waste Diverted: ~0.3 Kg

                setStats({
                    totalUsers: users.length,
                    totalSellers: sellers,
                    totalBuyers: buyers,
                    totalTransactions: transactionsCount,
                    envImpact: {
                        waterSaved: totalItemsSold * 500,
                        co2Reduced: totalItemsSold * 2,
                        wasteDiverted: totalItemsSold * 0.3
                    }
                });

            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Chart Data Preparation
    const roleDistributionData = [
        { name: 'Sellers', value: stats.totalSellers },
        { name: 'Buyers', value: stats.totalBuyers },
    ];

    // Mock Trend Data
    const impactData = [
        { name: 'Jan', co2: 120, water: 2000 },
        { name: 'Feb', co2: 250, water: 4500 },
        { name: 'Mar', co2: 180, water: 3200 },
        { name: 'Apr', co2: 320, water: 5800 },
        { name: 'May', co2: 450, water: 8000 },
        { name: 'Jun', co2: 500, water: 9500 },
    ];

    const COLORS = ['#8884d8', '#82ca9d'];

    if (loading) return <div className="p-10 text-center">Loading Dashboard Data...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sellers</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalSellers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Buyers</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalBuyers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Transactions</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.totalTransactions}</p>
                </div>
            </div>

            {/* Environmental Impact Section */}
            <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6">🌱 Environmental Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-400 mb-2">{stats.envImpact.waterSaved.toLocaleString()} L</div>
                        <div className="text-sm opacity-80 uppercase tracking-widest">Water Saved</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">{stats.envImpact.co2Reduced.toLocaleString()} Kg</div>
                        <div className="text-sm opacity-80 uppercase tracking-widest">CO2 Reduced</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">{stats.envImpact.wasteDiverted.toLocaleString()} Kg</div>
                        <div className="text-sm opacity-80 uppercase tracking-widest">Waste Diverted</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-bold mb-4">User Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={roleDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {roleDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Impact Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-bold mb-4">Impact Growth (Est.)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impactData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="water" fill="#3b82f6" name="Water Saved" />
                            <Bar dataKey="co2" fill="#22c55e" name="CO2 Reduced" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

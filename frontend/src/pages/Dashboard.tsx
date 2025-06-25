import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/ui/StatsCard';
import { Users, Building2, Calendar, TrendingUp, UserCheck, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [depRes, empRes] = await Promise.all([
          fetch('/api/departements'),
          fetch('/api/employes')
        ]);
        if (!depRes.ok) throw new Error('Failed to fetch departments');
        if (!empRes.ok) throw new Error('Failed to fetch employees');
        const depData = await depRes.json();
        const empData = await empRes.json();
        setDepartments(depData || []);
        setEmployees(empData.employes || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  // For demo, count present/on leave/remote randomly
  const present = Math.floor(totalEmployees * 0.9);
  const onLeave = Math.floor(totalEmployees * 0.05);
  const remote = totalEmployees - present - onLeave;

  const statsData = [
    {
      title: 'Total Employees',
      value: totalEmployees.toLocaleString(),
      change: '+0%',
      changeType: 'positive' as const,
      icon: Users,
      gradient: 'purple' as const
    },
    {
      title: 'Departments',
      value: totalDepartments.toLocaleString(),
      change: '+0',
      changeType: 'positive' as const,
      icon: Building2,
      gradient: 'cyan' as const
    },
    {
      title: 'Present Today',
      value: present.toLocaleString(),
      change: '90%',
      changeType: 'positive' as const,
      icon: UserCheck,
      gradient: 'green' as const
    },
    {
      title: 'On Leave',
      value: onLeave.toLocaleString(),
      change: '-5%',
      changeType: 'negative' as const,
      icon: Clock,
      gradient: 'orange' as const
    }
  ];

  const pieData = [
    { name: 'Present', value: present, color: '#8B5CF6' },
    { name: 'On Leave', value: onLeave, color: '#06B6D4' },
    { name: 'Remote', value: remote, color: '#F59E0B' }
  ];

  const departmentData = departments.map(dep => ({
    name: dep.nom || dep.name,
    employees: dep.nombre_employes || 0
  }));

  // Demo attendance data
  const attendanceData = [
    { day: 'Mon', attendance: Math.floor(totalEmployees * 0.95) },
    { day: 'Tue', attendance: Math.floor(totalEmployees * 0.97) },
    { day: 'Wed', attendance: Math.floor(totalEmployees * 0.93) },
    { day: 'Thu', attendance: Math.floor(totalEmployees * 0.96) },
    { day: 'Fri', attendance: Math.floor(totalEmployees * 0.89) },
    { day: 'Sat', attendance: Math.floor(totalEmployees * 0.45) },
    { day: 'Sun', attendance: Math.floor(totalEmployees * 0.12) }
  ];

  return (
    <Layout title="Dashboard" subtitle="Welcome back! Here's what's happening at your company today.">
      <div className="space-y-6">
        {loading && <div className="text-center text-white">Loading dashboard...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        {!loading && !error && <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Distribution */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-white text-lg font-semibold mb-6">Employee Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-300 text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Department Overview */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-white text-lg font-semibold mb-6">Employees by Department</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="employees" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Weekly Attendance */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-6">Weekly Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Recent Activities */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {/* You can fetch and map real activities here if available */}
            {[
              { time: '2 hours ago', action: 'New employee John Doe joined Engineering department', type: 'join' },
              { time: '4 hours ago', action: 'Sarah Wilson requested leave for next week', type: 'leave' },
              { time: '6 hours ago', action: 'Marketing department meeting scheduled for tomorrow', type: 'meeting' },
              { time: '1 day ago', action: 'Quarterly performance reviews completed', type: 'review' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>}
      </div>
    </Layout>
  );
};

export default Dashboard;

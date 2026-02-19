
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Clock, Building2 } from '../components/Icons';

const AdminAnalytics: React.FC = () => {
  // Mock Data for Charts
  const applicationData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 59 },
    { name: 'Mar', value: 80 },
    { name: 'Apr', value: 81 },
    { name: 'May', value: 56 },
    { name: 'Jun', value: 95 },
    { name: 'Jul', value: 120 },
  ];

  const statusData = [
    { name: 'Approved', value: 400 },
    { name: 'Rejected', value: 50 },
    { name: 'Pending', value: 300 },
    { name: 'In Review', value: 200 },
  ];

  const COLORS = ['#059669', '#DC2626', '#F59E0B', '#3B82F6'];

  const stats = [
    { label: 'Total Citizens', value: '24,593', icon: Users, change: '+12%' },
    { label: 'Applications YTD', value: '1,892', icon: FileText, change: '+8%' },
    { label: 'Avg Process Time', value: '2.4 Days', icon: Clock, change: '-15%' },
    { label: 'Depts Active', value: '8', icon: Building2, change: '0%' },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-500">System overview, performance metrics, and workflow bottlenecks.</p>
      </div>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <stat.icon className="text-gray-600" size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-blue-600' : 'text-gray-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-400 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart - Added min-w-0 for safety */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Applications Received (2023)</h3>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  cursor={{fill: '#f3f4f6'}}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Added min-w-0 for safety */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Application Status Breakdown</h3>
          <div style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;


import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, Clock, Building2, TrendingUp, AlertCircle, CheckCircle, DollarSign, Activity } from '../components/Icons';
import { User, Role } from '../types';

interface ExecutiveDashboardProps {
  currentUser: User;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ currentUser }) => {
  // ----------------------------------------------------------------------
  // Role-Based Views
  // ----------------------------------------------------------------------

  // 1. MAYOR'S VIEW: Focus on Finance, Public Service Speed, and Critical Bottlenecks
  const MayorView = () => (
    <div className="space-y-6">
       {/* High Level Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Cash Position" value="₱ 142.5M" sub="As of Oct 27" icon={DollarSign} color="emerald" />
          <StatCard label="Pending Vouchers" value="12" sub="Requiring Signature" icon={FileText} color="orange" />
          <StatCard label="Incoming Letters" value="8" sub="Unread Today" icon={Users} color="blue" />
          <StatCard label="Project Completion" value="68%" sub="2023 Annual Infra" icon={Activity} color="indigo" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Velocity Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Budget Utilization Rate (2023)</h3>
                <select className="text-xs border rounded p-1"><option>General Fund</option><option>SEF</option></select>
             </div>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                      { name: 'Q1', budget: 25, actual: 22 },
                      { name: 'Q2', budget: 50, actual: 45 },
                      { name: 'Q3', budget: 75, actual: 68 },
                      { name: 'Q4 (Proj)', budget: 100, actual: 92 },
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="budget" fill="#e2e8f0" radius={[4,4,0,0]} name="Target" />
                      <Bar dataKey="actual" fill="#0ea5e9" radius={[4,4,0,0]} name="Actual Util." />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" /> Executive Alerts
             </h3>
             <div className="space-y-4">
                <AlertItem title="Brgy. San Jose Road Project" desc="Delayed by 14 days due to weather" type="critical" />
                <AlertItem title="Accounting Department" desc="Voucher backlog exceeding 48hrs" type="warning" />
                <AlertItem title="AIP 2024 Deadline" desc="Submission required by Oct 31" type="info" />
             </div>
             <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100">View All Notifications</button>
          </div>
       </div>
    </div>
  );

  // 2. MPDC VIEW: Focus on Projects, AIP, and Development Metrics
  const MPDCView = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Active Projects" value="24" sub="Infrastructure" icon={Building2} color="blue" />
          <StatCard label="Delayed" value="3" sub="Requiring Intervention" icon={AlertCircle} color="red" />
          <StatCard label="Total Investment" value="₱ 85M" sub="2023 AIP" icon={TrendingUp} color="emerald" />
          <StatCard label="Resolutions" value="15" sub="Endorsed to SB" icon={FileText} color="purple" />
       </div>

       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-6">Project Progress Tracking</h3>
          <div className="space-y-6">
             <ProjectProgress name="Public Market Renovation" progress={85} status="On Track" />
             <ProjectProgress name="San Jose Farm-to-Market Road" progress={45} status="Delayed" color="red" />
             <ProjectProgress name="Municipal Hall Solar Retrofit" progress={100} status="Completed" color="emerald" />
             <ProjectProgress name="Drainage System Phase 2" progress={10} status="Just Started" color="blue" />
          </div>
       </div>
    </div>
  );

  // 3. GENERIC / DEFAULT VIEW
  const DefaultView = () => (
    <div className="text-center p-12">
       <h2 className="text-2xl font-bold text-slate-400">Dashboard Loading...</h2>
    </div>
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-500 font-medium">Real-time governance intelligence for {currentUser.department}</p>
        </div>
        <div className="flex gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
           <Clock size={16} /> 
           Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {currentUser.role === Role.MAYOR ? <MayorView /> : 
       currentUser.role === Role.MPDC_OFFICER ? <MPDCView /> : 
       <MayorView /> /* Default to Mayor view for demo purposes if other roles not fully mocked */ }
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, sub, icon: Icon, color }: any) => {
    const colors: any = {
      emerald: 'bg-emerald-50 text-emerald-600',
      orange: 'bg-orange-50 text-orange-600',
      blue: 'bg-blue-50 text-blue-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
            <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${colors[color]}`}>
                <Icon size={24} />
            </div>
        </div>
    )
}

const AlertItem = ({ title, desc, type }: any) => {
    const colors: any = {
        critical: 'border-l-4 border-red-500 bg-red-50',
        warning: 'border-l-4 border-orange-500 bg-orange-50',
        info: 'border-l-4 border-blue-500 bg-blue-50'
    }
    return (
        <div className={`p-4 rounded-r-lg ${colors[type]}`}>
            <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
            <p className="text-xs text-slate-600">{desc}</p>
        </div>
    )
}

const ProjectProgress = ({ name, progress, status, color = 'emerald' }: any) => {
    const colors: any = {
        emerald: 'bg-emerald-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500'
    }
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-slate-700">{name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${color === 'red' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{status}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${colors[color]}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}

export default ExecutiveDashboard;

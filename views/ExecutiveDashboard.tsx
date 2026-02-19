
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Fixed: Added Shield to the imported icons list to resolve "Cannot find name 'Shield'" error.
import { Users, FileText, Clock, Building2, TrendingUp, AlertCircle, DollarSign, Activity, CloudRain, Wind, Droplets, CheckCircle, ArrowRight, Shield } from '../components/Icons';
import { User, JobLevel, InternalDocument, DocumentStatus } from '../types';
import { DB } from '../services/db';
import { WeatherService, SimpleWeatherData } from '../services/weather.service';
import { useNavigate } from 'react-router-dom';

interface ExecutiveDashboardProps {
  currentUser: User;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<SimpleWeatherData | null>(null);
  const [pendingItems, setPendingItems] = useState<InternalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
        setIsLoading(true);
        const [weatherData, docs] = await Promise.all([
            WeatherService.getCurrentWeather(),
            DB.getInternalDocuments()
        ]);
        setWeather(weatherData);
        // Items waiting for Mayor's signature
        setPendingItems(docs.filter(d => d.status === DocumentStatus.FOR_APPROVAL));
        setIsLoading(false);
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Command Center</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] mt-1">Real-time governance intelligence • Talibon, Bohol</p>
        </div>
        <div className="flex gap-3">
           <div className="hidden md:flex gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm items-center font-bold">
              <Clock size={16} className="text-gov-500" /> 
              {new Date().toLocaleTimeString()}
           </div>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Cash Position" value="₱ 142.5M" sub="General Fund Balance" icon={DollarSign} color="emerald" />
          <StatCard label="Pending Approval" value={pendingItems.length} sub="Requiring Signature" icon={FileText} color="orange" onClick={() => navigate('/workbench')} />
          <StatCard label="Total Personnel" value="128" sub="Active Employees" icon={Users} color="blue" />
          <StatCard label="Infra Progress" value="68%" sub="2024 Project Load" icon={Activity} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Queue for Mayor */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                        <Shield size={20} className="text-gov-600" /> Action Required
                      </h3>
                      <button onClick={() => navigate('/workbench')} className="text-xs font-bold text-gov-600 hover:underline">View All Taskings</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                      {isLoading ? (
                          <div className="p-12 text-center text-slate-400">Syncing Secure Stream...</div>
                      ) : pendingItems.length === 0 ? (
                          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                              <CheckCircle size={48} className="text-emerald-200 mb-2" />
                              <p className="font-bold text-slate-700">All queues cleared.</p>
                              <p className="text-xs">No pending documents require executive action.</p>
                          </div>
                      ) : (
                          pendingItems.map(item => (
                              <div key={item.id} className="p-6 hover:bg-gov-50/30 transition-colors flex justify-between items-center group">
                                  <div className="flex gap-4 items-start">
                                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-white transition-colors">
                                          <FileText size={20} />
                                      </div>
                                      <div>
                                          <p className="text-xs font-black text-gov-600 uppercase tracking-widest">{item.originatingDept}</p>
                                          <h4 className="font-bold text-slate-900 group-hover:text-gov-700 transition-colors">{item.title}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold mt-1">Ref: {item.trackingId} • Submitted: {new Date(item.dateCreated).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => navigate('/workbench')}
                                      className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-gov-600 hover:border-gov-600 transition-all shadow-sm active:scale-95"
                                  >
                                      <ArrowRight size={18} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-slate-900 uppercase tracking-tighter">Budget Utilization Velocity</h3>
                      <div className="flex gap-2">
                          <span className="h-3 w-3 rounded bg-gov-500"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">General Fund</span>
                      </div>
                  </div>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                              { name: 'Jan', val: 12 }, { name: 'Feb', val: 15 }, { name: 'Mar', val: 28 }, 
                              { name: 'Apr', val: 22 }, { name: 'May', val: 34 }, { name: 'Jun', val: 45 }
                          ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                              <YAxis hide />
                              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                              <Bar dataKey="val" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={32} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
              {/* MDRRMO Weather Module */}
              <div className={`p-8 rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-700 ${weather?.isAlert ? 'bg-red-600 text-white shadow-red-200' : 'bg-gradient-to-br from-gov-600 to-gov-800 text-white shadow-gov-200'}`}>
                  {weather ? (
                      <div className="relative z-10">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">MDRRMO Weather Monitor</p>
                                  <h3 className="text-5xl font-black">{weather.temp}°C</h3>
                                  <p className="text-sm font-bold capitalize mt-2 flex items-center gap-2">
                                      {weather.description} 
                                      {weather.isAlert && <AlertCircle size={16} className="animate-pulse" />}
                                  </p>
                              </div>
                              <img src={weather.iconUrl} alt="Weather" className="w-20 h-20 -mr-4 -mt-2 drop-shadow-lg" />
                          </div>
                          <div className="mt-8 grid grid-cols-2 gap-3 text-xs font-black uppercase tracking-wider">
                              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col gap-1">
                                  <Wind size={16} className="opacity-50" />
                                  <span>{weather.windSpeed} m/s</span>
                              </div>
                              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col gap-1">
                                  <Droplets size={16} className="opacity-50" />
                                  <span>{weather.humidity}% Hum.</span>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex items-center justify-center h-48 opacity-50">Syncing Satellite Data...</div>
                  )}
              </div>

              {/* Quick Tasks */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-gov-600" /> Growth Stats
                  </h3>
                  <div className="space-y-6">
                      <ProjectProgress name="Business Permits (MTD)" progress={92} status="High" />
                      <ProjectProgress name="Infra Implementation" progress={64} status="On-Track" color="blue" />
                      <ProjectProgress name="Social Services Reach" progress={45} status="Delayed" color="orange" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, sub, icon: Icon, color, onClick }: any) => {
    const colors: any = {
      emerald: 'bg-emerald-50 text-emerald-600',
      orange: 'bg-orange-50 text-orange-600',
      blue: 'bg-blue-50 text-blue-600',
      indigo: 'bg-indigo-50 text-indigo-600',
    };
    return (
        <div 
          onClick={onClick}
          className={`bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-start justify-between group transition-all ${onClick ? 'cursor-pointer hover:border-gov-400 hover:scale-[1.02]' : ''}`}
        >
            <div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 italic leading-none">{value}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">{sub}</p>
            </div>
            <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
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
            <div className="flex justify-between mb-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{name}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${color === 'red' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{status}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                <div className={`h-full rounded-full ${colors[color]} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}

export default ExecutiveDashboard;

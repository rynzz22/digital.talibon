
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, JobLevel, Department } from '../types';
import ExecutiveDashboard from './ExecutiveDashboard';
import InternalRoutingView from './InternalRoutingView';
import VoucherMonitorView from './VoucherMonitorView';
import CommunicationsView from './CommunicationsView';
import ChatPortal from './ChatPortal';
import { 
  Building2, 
  Settings, 
  Users, 
  FileText, 
  PieChart, 
  MapPin, 
  Archive,
  Lock,
  X,
  Bell,
  Shield,
  LogOut
} from '../components/Icons';

interface DepartmentPortalProps {
  user: User;
  currentView: string;
}

const DepartmentPortal: React.FC<DepartmentPortalProps> = ({ user, currentView }) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
        case 'DASHBOARD':
            if (user.jobLevel === JobLevel.EXECUTIVE) {
                return <ExecutiveDashboard currentUser={user} />;
            }
            // Department Head / Staff Dashboard
            return (
                <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-[0.2em] shadow-sm">
                                    <Lock size={10} className="text-gov-400" /> Secure Node
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                                    Synced
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">{user.department}</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1 ml-1">Operations Hub & Analytics</p>
                        </div>
                        <div className="bg-white border border-slate-200 px-6 py-4 rounded-[2rem] text-sm text-slate-600 font-black shadow-xl shadow-slate-100 flex flex-col items-end border-l-4 border-l-gov-600">
                            <span className="text-[9px] text-slate-400 uppercase tracking-[0.3em] mb-1">Clearance LVL</span>
                            <span className="text-slate-800 italic tracking-tighter">{user.jobLevel}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gov-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gov-600/40 transition-colors"></div>
                            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-6">Pending Operations</h3>
                            <div className="flex items-end justify-between relative z-10">
                                <span className="text-6xl font-black italic tracking-tighter">12</span>
                                <FileText className="opacity-20 group-hover:opacity-40 transition-opacity" size={56} />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-transform">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Budget Utilisation</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-6xl font-black text-slate-900 italic tracking-tighter">42%</span>
                                <PieChart className="text-slate-100 group-hover:text-gov-100 transition-colors" size={56} />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-transform">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Ops Personnel</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-6xl font-black text-emerald-600 italic tracking-tighter">08</span>
                                <Users className="text-slate-100 group-hover:text-emerald-50 transition-colors" size={56} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        <QuickAction icon={FileText} label="Doc Registry" color="blue" onClick={() => navigate('/workbench')} />
                        <QuickAction icon={MapPin} label="Infra Projects" color="orange" onClick={() => navigate('/projects')} />
                        <QuickAction icon={Archive} label="Digital Vault" color="purple" onClick={() => navigate('/archive')} />
                        <QuickAction icon={Settings} label="Office Config" color="slate" onClick={() => setIsSettingsOpen(true)} />
                    </div>
                </div>
            );

        case 'COMMUNICATIONS': return <CommunicationsView />;
        case 'VOUCHERS': return <VoucherMonitorView />;
        case 'MY_QUEUE': return <InternalRoutingView currentUser={user} />;
        case 'MESSAGES': return <ChatPortal currentUser={user} />;
        case 'ARCHIVE':
            return (
                <div className="p-24 text-center">
                    <Archive size={80} className="mx-auto mb-6 text-slate-100" />
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">LGU Records Archive</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Restricted Access • Clearance Required</p>
                </div>
            );
        default: return <div className="p-10 font-bold text-slate-400">SELECT MODULE</div>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-full">
        {renderContent()}

        {/* Office Settings Modal */}
        {isSettingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 italic tracking-tighter"><Settings size={22} className="text-gov-600"/> Office Configuration</h2>
                        <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-xl shadow-sm"><X size={24} /></button>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="space-y-4">
                            <ToggleItem icon={Bell} label="Broadcast Alerts" active={true} />
                            <ToggleItem icon={Shield} label="Advanced Encryption" active={false} />
                        </div>
                        <div className="pt-4 text-center">
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 italic">Device ID: TAL-ND-{user.id.slice(0,8)}</p>
                             <button className="w-full py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                                <LogOut size={16}/> Revoke Device Session
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color, onClick }: any) => {
    const colors: any = {
        blue: 'text-gov-600 bg-gov-50',
        orange: 'text-orange-600 bg-orange-50',
        purple: 'text-purple-600 bg-purple-50',
        slate: 'text-slate-600 bg-slate-50',
    };
    return (
        <div onClick={onClick} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-gov-400 cursor-pointer transition-all shadow-xl shadow-slate-200/30 group active:scale-95 flex flex-col items-center">
            <div className={`p-5 rounded-2xl w-fit mb-5 shadow-sm group-hover:shadow-md transition-all ${colors[color]}`}>
                <Icon size={28} />
            </div>
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-widest">{label}</h4>
        </div>
    );
};

const ToggleItem = ({ icon: Icon, label, active }: any) => (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-50 text-slate-500"><Icon size={18} /></div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{label}</span>
        </div>
        <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-gov-600' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${active ? 'right-1' : 'left-1 shadow-sm'}`}></div>
        </div>
    </div>
);

export default DepartmentPortal;

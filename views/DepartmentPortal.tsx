
import React, { useState } from 'react';
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
  Lock
} from '../components/Icons';

interface DepartmentPortalProps {
  user: User;
  currentView: string;
}

const DepartmentPortal: React.FC<DepartmentPortalProps> = ({ user, currentView }) => {

  const renderContent = () => {
    switch (currentView) {
        case 'DASHBOARD':
            if (user.jobLevel === JobLevel.EXECUTIVE) {
                return <ExecutiveDashboard currentUser={user} />;
            }
            // Department Head / Staff Dashboard
            return (
                <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                                    <Lock size={8} /> Internal Network
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    Online
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900">{user.department}</h1>
                            <p className="text-slate-500 font-medium">Departmental Operations & Analytics</p>
                        </div>
                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 font-medium shadow-sm flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Security Clearance</span>
                            <span className="font-bold text-slate-800">{user.jobLevel}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest mb-4">Pending Actions</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-black">12</span>
                                <FileText className="opacity-50" size={32} />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Budget Utilized</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-black text-slate-900">42%</span>
                                <PieChart className="text-slate-300" size={32} />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Personnel Active</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-black text-emerald-600">8</span>
                                <Users className="text-slate-300" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center group">
                            <div className="bg-white p-3 rounded-lg w-fit mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                <FileText className="text-gov-600" size={24} />
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm">Document Registry</h4>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center group">
                            <div className="bg-white p-3 rounded-lg w-fit mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                <MapPin className="text-orange-600" size={24} />
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm">Projects Map</h4>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center group">
                            <div className="bg-white p-3 rounded-lg w-fit mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                <Archive className="text-purple-600" size={24} />
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm">Records Vault</h4>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center group">
                            <div className="bg-white p-3 rounded-lg w-fit mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                <Settings className="text-slate-600" size={24} />
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm">Office Settings</h4>
                        </div>
                    </div>
                </div>
            );

        case 'COMMUNICATIONS':
            return <CommunicationsView />;
        case 'VOUCHERS':
            return <VoucherMonitorView />;
        case 'MY_QUEUE':
            return <InternalRoutingView currentUser={user} />;
        case 'MESSAGES':
            return <ChatPortal currentUser={user} />;
        case 'ARCHIVE':
            return (
                <div className="p-12 text-center text-slate-400">
                    <Archive size={64} className="mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-slate-700">Digital Records Archive</h2>
                    <p>Access to historic documents and scanning is restricted to Records Officers.</p>
                </div>
            );
        default:
            return <div className="p-10">Select a module from the sidebar.</div>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-full">
        {renderContent()}
    </div>
  );
};

export default DepartmentPortal;

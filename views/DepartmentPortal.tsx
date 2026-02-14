
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
  Archive 
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
                            <h1 className="text-3xl font-black text-slate-900">{user.department}</h1>
                            <p className="text-slate-500 font-medium">Departmental Overview & Operations</p>
                        </div>
                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 font-medium shadow-sm">
                            {user.jobLevel} ACCESS LEVEL
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
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Team Active</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-black text-emerald-600">8</span>
                                <Users className="text-slate-300" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center">
                            <FileText className="mx-auto text-gov-600 mb-3" size={24} />
                            <h4 className="font-bold text-slate-700 text-sm">Document Registry</h4>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center">
                            <MapPin className="mx-auto text-orange-600 mb-3" size={24} />
                            <h4 className="font-bold text-slate-700 text-sm">Projects Map</h4>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center">
                            <Archive className="mx-auto text-purple-600 mb-3" size={24} />
                            <h4 className="font-bold text-slate-700 text-sm">Records Vault</h4>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-gov-400 cursor-pointer transition-all text-center">
                            <Settings className="mx-auto text-slate-600 mb-3" size={24} />
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

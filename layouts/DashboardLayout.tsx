import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JobLevel } from '../types';
import GlobalSearch from '../components/GlobalSearch';
import { 
  Shield, Menu, LogOut, Settings, BarChart2, Layers, MessageSquare, 
  Inbox, Landmark, Briefcase, Folder 
} from 'lucide-react';

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* ENTERPRISE SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-30 shadow-2xl`}>
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 bg-slate-900 shrink-0">
          <Shield className="text-gov-500 mr-4 shrink-0" size={28} />
          {isSidebarOpen && (
              <div className="animate-in fade-in slide-in-from-left duration-300">
                  <span className="font-black text-xl tracking-tighter block leading-none italic">TALIBON</span>
                  <span className="text-[9px] text-gov-400 font-bold uppercase tracking-[0.3em]">Enterprise</span>
              </div>
          )}
        </div>

        {/* User Profile Snippet */}
        <div className={`p-6 border-b border-white/5 bg-slate-800/50 ${isSidebarOpen ? '' : 'flex justify-center'}`}>
           {isSidebarOpen ? (
               <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-gov-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-gov-900/50">
                       {user.name.charAt(0)}
                   </div>
                   <div className="overflow-hidden">
                       <p className="text-sm font-bold text-white truncate">{user.name}</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-tight truncate">{user.department}</p>
                   </div>
               </div>
           ) : (
                <div className="h-10 w-10 rounded-xl bg-gov-600 flex items-center justify-center font-bold text-sm">
                   {user.name.charAt(0)}
                </div>
           )}
        </div>

        {/* Navigation */}
        <div className="py-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
             {/* Core Module */}
             <div className="px-4">
                 {isSidebarOpen && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-3">Main Portal</p>}
                 <nav className="space-y-1">
                  <NavItem icon={BarChart2} label="Dashboard" active={isActive('/')} onClick={() => navigate('/')} isOpen={isSidebarOpen} />
                  <NavItem icon={Layers} label="My Workbench" active={isActive('/workbench')} onClick={() => navigate('/workbench')} isOpen={isSidebarOpen} />
                  <NavItem icon={MessageSquare} label="GovChat" active={isActive('/chat')} onClick={() => navigate('/chat')} isOpen={isSidebarOpen} />
                </nav>
             </div>

             {/* Functional Modules */}
             <div className="px-4">
                 {isSidebarOpen && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-3">Operations</p>}
                 <nav className="space-y-1">
                    <NavItem icon={Inbox} label="Communications" active={isActive('/communications')} onClick={() => navigate('/communications')} isOpen={isSidebarOpen} />
                    <NavItem icon={Landmark} label="Vouchers & Finance" active={isActive('/vouchers')} onClick={() => navigate('/vouchers')} isOpen={isSidebarOpen} />
                    
                    {/* Role Restricted Modules */}
                    {[JobLevel.EXECUTIVE, JobLevel.DEPT_HEAD, JobLevel.ADMIN].includes(user.jobLevel) && (
                         <NavItem icon={Briefcase} label="Programs & Projects" active={isActive('/projects')} onClick={() => navigate('/projects')} isOpen={isSidebarOpen} />
                    )}
                    
                    <NavItem icon={Folder} label="Records Archive" active={isActive('/archive')} onClick={() => navigate('/archive')} isOpen={isSidebarOpen} />
                 </nav>
             </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900">
          <button onClick={logout} className="flex items-center w-full px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
             <LogOut size={20} className="shrink-0 group-hover:text-red-400 transition-colors" />
             {isSidebarOpen && <span className="ml-3 font-bold text-sm">Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-24'}`}>
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm/50">
          <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:bg-slate-100 p-2.5 rounded-xl transition-colors">
                <Menu size={22} />
              </button>
              <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Enterprise Workspace</p>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                         {user.jobLevel} • {user.department}
                      </p>
                  </div>
              </div>
          </div>

          {/* Central Global Search */}
          <div className="flex-1 px-8 max-w-2xl">
             <GlobalSearch />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
            <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Router Outlet / Children */}
        <main className="flex-1 overflow-x-hidden bg-slate-50">
           {children}
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, isOpen }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center w-full px-4 py-3 rounded-2xl transition-all mb-1 group relative ${
      active 
      ? 'bg-gov-600 text-white shadow-lg shadow-gov-900/50' 
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} className={`shrink-0 ${active ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
    {isOpen && <span className="ml-4 text-sm font-bold whitespace-nowrap overflow-hidden animate-in fade-in duration-300">{label}</span>}
    {active && !isOpen && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gov-400 rounded-l-full"></div>}
  </button>
);
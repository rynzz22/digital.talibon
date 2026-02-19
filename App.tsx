import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Views
import LoginView from './views/LoginView';
import DepartmentPortal from './views/DepartmentPortal'; 
import CommunicationsView from './views/CommunicationsView';
import VoucherMonitorView from './views/VoucherMonitorView';
import InternalRoutingView from './views/InternalRoutingView';
import ChatPortal from './views/ChatPortal';
import { ProjectsModule } from './views/SystemModules'; 
import ExecutiveDashboard from './views/ExecutiveDashboard';

// Guards
import { RoleGuard } from './components/RoleGuard';
import { JobLevel } from './types';

// Fixed: Correctly typed children prop using React.FC to prevent TS error about missing children property in JSX.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50">Loading Secure Workspace...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
    const { user } = useAuth();
    
    return (
        <Routes>
            <Route path="/login" element={<LoginView />} />
            
            <Route path="/*" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Routes>
                            <Route path="/" element={
                                user?.jobLevel === JobLevel.EXECUTIVE ? <ExecutiveDashboard currentUser={user!} /> :
                                <DepartmentPortal user={user!} currentView="DASHBOARD" />
                            } />
                            
                            <Route path="/workbench" element={<InternalRoutingView currentUser={user!} />} />
                            <Route path="/chat" element={<ChatPortal currentUser={user!} />} />
                            
                            <Route path="/communications" element={<CommunicationsView />} />
                            <Route path="/vouchers" element={<VoucherMonitorView />} />
                            
                            <Route path="/projects" element={
                                <RoleGuard allowedLevels={[JobLevel.EXECUTIVE, JobLevel.DEPT_HEAD, JobLevel.ADMIN]}>
                                    <ProjectsModule />
                                </RoleGuard>
                            } />
                            
                            <Route path="/archive" element={<div className="p-8">Archive Module Coming Soon</div>} />

                             {/* Redirect unknown routes to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </DashboardLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    </AuthProvider>
  );
}

export default App;
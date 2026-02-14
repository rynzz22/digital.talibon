import React, { useMemo } from 'react';
import { Application, ApplicationStatus, Department, Role, User } from '../types';
import { ArrowRight, Clock, CheckCircle, FileText, Activity, DollarSign, PenTool, Shield, Archive, AlertCircle } from '../components/Icons';
import StatusBadge from '../components/StatusBadge';

interface EmployeeDashboardProps {
  currentUser: User;
  applications: Application[];
  onViewApplication: (app: Application) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ currentUser, applications, onViewApplication }) => {
  
  // ----------------------------------------------------------------------
  // Role-Based Filtering Logic
  // ----------------------------------------------------------------------
  const myTasks = useMemo(() => {
    return applications.filter(app => app.currentDepartment === currentUser.department);
  }, [applications, currentUser.department]);

  // ----------------------------------------------------------------------
  // Sub-Dashboards (Components within Component for cleaner file structure)
  // ----------------------------------------------------------------------

  // A. CLERK DASHBOARD (BPLO)
  const ClerkDashboard = () => {
    const pendingCount = myTasks.length;
    const forRevision = applications.filter(a => a.status === ApplicationStatus.RETURNED).length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="New Applications" value={pendingCount} icon={FileText} color="blue" />
          <StatCard title="Returned for Revision" value={forRevision} icon={AlertCircle} color="orange" />
          <StatCard title="Processed Today" value={15} icon={CheckCircle} color="emerald" />
        </div>
        
        <DashboardTable 
          title="Incoming Applications" 
          apps={myTasks} 
          onView={onViewApplication}
          columns={['Ref #', 'Business Name', 'Applicant', 'Date', 'Status']}
        />
      </div>
    );
  };

  // B. TREASURER DASHBOARD
  const TreasurerDashboard = () => {
    const forAssessment = myTasks.filter(a => a.status === ApplicationStatus.FOR_ASSESSMENT).length;
    const forPayment = myTasks.filter(a => a.status === ApplicationStatus.FOR_PAYMENT).length;
    const totalCollected = "₱ 1,240,500";

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Pending Assessment" value={forAssessment} icon={FileText} color="blue" />
          <StatCard title="Pending Payment" value={forPayment} icon={DollarSign} color="orange" />
          <StatCard title="Total Collected (Oct)" value={totalCollected} icon={Activity} color="emerald" />
        </div>

        <DashboardTable 
          title="Assessment & Payment Queue" 
          apps={myTasks} 
          onView={onViewApplication}
          columns={['Ref #', 'Business Name', 'Assessed Fee', 'Payment Status', 'Status']}
        />
      </div>
    );
  };

  // C. ENGINEERING DASHBOARD
  const EngineeringDashboard = () => {
    const pendingInspections = myTasks.length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Scheduled Inspections" value={pendingInspections} icon={Shield} color="blue" />
          <StatCard title="Reports Pending" value={4} icon={FileText} color="orange" />
          <StatCard title="Compliant Businesses" value={189} icon={CheckCircle} color="emerald" />
        </div>

        <DashboardTable 
          title="Compliance & Inspection Review" 
          apps={myTasks} 
          onView={onViewApplication}
          columns={['Ref #', 'Business Name', 'Applicant', 'Submission Date', 'Status']}
        />
      </div>
    );
  };

  // D. MAYOR DASHBOARD
  const MayorDashboard = () => {
    const forApproval = myTasks.length;
    const approvedThisMonth = applications.filter(a => a.status === ApplicationStatus.APPROVED).length;

    return (
      <div className="space-y-6">
         <div className="bg-gradient-to-r from-gov-900 to-gov-800 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Good Morning, Mayor.</h2>
              <p className="opacity-80 mt-1">You have <span className="font-bold underline text-white">{forApproval} permits</span> awaiting digital signature.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <PenTool size={32} />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Pending Final Approval" value={forApproval} icon={Clock} color="orange" />
            <StatCard title="Approved This Month" value={approvedThisMonth} icon={CheckCircle} color="emerald" />
         </div>

         <DashboardTable 
          title="Executive Approval Queue" 
          apps={myTasks} 
          onView={onViewApplication}
          columns={['Ref #', 'Business Name', 'Clearances', 'Date', 'Action']}
        />
      </div>
    );
  };

  // E. RELEASE OFFICER DASHBOARD
  const ReleaseDashboard = () => {
    const toRelease = myTasks.length;
    const releasedToday = 24;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Ready for Release" value={toRelease} icon={Archive} color="blue" />
          <StatCard title="Released Today" value={releasedToday} icon={CheckCircle} color="emerald" />
        </div>

        <DashboardTable 
          title="Document Release Management" 
          apps={myTasks} 
          onView={onViewApplication}
          columns={['Ref #', 'Business Name', 'Applicant', 'Approval Date', 'Status']}
        />
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // Main Render Switch
  // ----------------------------------------------------------------------
  const renderContent = () => {
    switch(currentUser.role) {
      case Role.CLERK: return <ClerkDashboard />;
      case Role.TREASURER: return <TreasurerDashboard />;
      case Role.ENGINEERING: return <EngineeringDashboard />;
      case Role.MAYOR: return <MayorDashboard />;
      case Role.RELEASE_OFFICER: return <ReleaseDashboard />;
      default: return <div className="p-8 text-center text-gray-500">Role dashboard not configured</div>;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentUser.department}</h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            {currentUser.role.replace('_', ' ')} Portal
          </p>
        </div>
        <div className="text-right">
           <span className="text-xs text-gray-400">System Date</span>
           <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

// ----------------------------------------------------------------------
// Reusable Sub-components
// ----------------------------------------------------------------------

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

const DashboardTable = ({ title, apps, onView, columns }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
      <h3 className="font-bold text-gray-800">{title}</h3>
      <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{apps.length} Items</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col: string, idx: number) => (
              <th key={idx} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
            ))}
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {apps.length === 0 ? (
            <tr><td colSpan={columns.length + 1} className="p-8 text-center text-gray-400">No records found.</td></tr>
          ) : (
            apps.map((app: Application) => (
              <tr key={app.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => onView(app)}>
                <td className="px-6 py-4 font-medium text-gov-900">{app.referenceNumber}</td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                   {app.businessName || <span className="text-gray-400 italic">N/A</span>}
                </td>
                
                {/* Conditional rendering based on what columns are usually passed, crudely simplified for this demo */}
                {columns.includes('Assessed Fee') ? (
                   <td className="px-6 py-4 text-gray-600 font-mono">
                      {app.assessedAmount ? `₱${app.assessedAmount.toLocaleString()}` : '-'}
                   </td>
                ) : (
                   <td className="px-6 py-4 text-gray-600">
                      {columns.includes('Applicant') ? app.applicantName : 
                       columns.includes('Clearances') ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> Complete</span> : '-'}
                   </td>
                )}

                {columns.includes('Payment Status') ? (
                    <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${app.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {app.paymentStatus || 'Unpaid'}
                        </span>
                    </td>
                ) : (
                    <td className="px-6 py-4 text-sm text-gray-500">{app.submissionDate}</td>
                )}

                {columns.includes('Status') && (
                    <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                )}
                
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-gov-600 font-medium hover:underline flex items-center justify-end gap-1">
                    Process <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default EmployeeDashboard;
import React, { useState } from 'react';
import { Application, ApplicationStatus, Department, Role, User } from '../types';
import { X, FileIcon, CheckCircle, XCircle, DollarSign, Shield, PenTool, Archive, ArrowRight } from './Icons';
import StatusBadge from './StatusBadge';

interface ApplicationDetailModalProps {
  application: Application;
  currentUser: User;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, newDept: Department, notes: string) => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, currentUser, onClose, onUpdateStatus }) => {
  const [notes, setNotes] = useState('');
  const [assessmentFee, setAssessmentFee] = useState(application.assessedAmount || 0);

  // ----------------------------------------------------------------
  // TALIBON WORKFLOW ENGINE
  // ----------------------------------------------------------------
  const handleApprove = () => {
    let nextStatus = application.status;
    let nextDept = application.currentDepartment;

    // Logic Flow: Clerk -> Eng -> Treasury -> Mayor -> Release
    // Note: Typical LGU flow varies, this implements the prompt's implied logic + standard practices
    switch (currentUser.role) {
      case Role.CLERK:
        nextStatus = ApplicationStatus.FOR_INSPECTION;
        nextDept = Department.ENGINEERING;
        break;
      case Role.ENGINEERING:
        nextStatus = ApplicationStatus.FOR_ASSESSMENT;
        nextDept = Department.TREASURY;
        break;
      case Role.TREASURER:
        if (application.status === ApplicationStatus.FOR_ASSESSMENT) {
             nextStatus = ApplicationStatus.FOR_PAYMENT;
             // Stay in Treasury for payment
             nextDept = Department.TREASURY; 
        } else if (application.status === ApplicationStatus.FOR_PAYMENT) {
             nextStatus = ApplicationStatus.FOR_APPROVAL;
             nextDept = Department.MAYORS_OFFICE;
        }
        break;
      case Role.MAYOR:
        nextStatus = ApplicationStatus.APPROVED;
        nextDept = Department.RECORDS;
        break;
      case Role.RELEASE_OFFICER:
        nextStatus = ApplicationStatus.RELEASED;
        nextDept = Department.RECORDS;
        break;
    }

    onUpdateStatus(application.id, nextStatus, nextDept, notes);
    onClose();
  };

  const handleReject = () => {
    onUpdateStatus(application.id, ApplicationStatus.REJECTED, Department.RECEIVING, notes);
    onClose();
  };
  
  const handleReturn = () => {
     onUpdateStatus(application.id, ApplicationStatus.RETURNED, Department.RECEIVING, notes);
     onClose();
  }

  const isActionable = currentUser.department === application.currentDepartment;

  // ----------------------------------------------------------------
  // Role-Specific Action Buttons Render
  // ----------------------------------------------------------------
  const renderActionButtons = () => {
    if (!isActionable) return <p className="text-sm text-gray-500 italic text-center">Viewing mode only.</p>;

    switch (currentUser.role) {
      case Role.CLERK:
        return (
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleReturn} className="btn-secondary text-orange-700 bg-orange-100">Return for Revision</button>
             <button onClick={handleApprove} className="btn-primary">Verify & Forward <ArrowRight size={16}/></button>
          </div>
        );
      case Role.ENGINEERING:
        return (
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleReturn} className="btn-secondary text-red-700 bg-red-100">Non-Compliant</button>
             <button onClick={handleApprove} className="btn-primary"><Shield size={16}/> Inspection Approved</button>
          </div>
        );
      case Role.TREASURER:
        if (application.status === ApplicationStatus.FOR_ASSESSMENT) {
            return (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-700">Assess Fee Amount (PHP)</label>
                        <input type="number" value={assessmentFee} onChange={(e) => setAssessmentFee(Number(e.target.value))} className="w-full border p-2 rounded" />
                    </div>
                    <button onClick={handleApprove} className="btn-primary w-full">Submit Assessment</button>
                </div>
            )
        }
        return (
          <div className="grid grid-cols-1 gap-3">
             <button onClick={handleApprove} className="btn-primary"><DollarSign size={16}/> Confirm Payment Received</button>
          </div>
        );
      case Role.MAYOR:
        return (
          <div className="grid grid-cols-1 gap-3">
             <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800 mb-2">
                By clicking approve, you apply your digital signature to this document.
             </div>
             <button onClick={handleApprove} className="btn-primary bg-gov-900 hover:bg-gov-800"><PenTool size={16}/> Sign & Approve</button>
          </div>
        );
      case Role.RELEASE_OFFICER:
        return (
          <button onClick={handleApprove} className="btn-primary w-full"><Archive size={16}/> Mark as Released</button>
        );
      default:
        return <button onClick={handleApprove} className="btn-primary w-full">Approve</button>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-70 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded bg-gov-100 text-gov-800 text-xs font-bold tracking-wider uppercase">Business Permit</span>
               <p className="text-sm text-gray-500">#{application.referenceNumber}</p>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{application.businessName || application.type}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row h-full">
            
            {/* Left: Document View (Mock) */}
            <div className="w-full md:w-3/5 bg-slate-100 p-6 border-r border-gray-200 overflow-y-auto">
               <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <FileIcon size={16} /> Submitted Documents
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  {application.documents.length === 0 ? <p className="text-sm text-gray-500 italic">No documents attached.</p> : 
                    application.documents.map(doc => (
                        <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="h-12 w-12 bg-red-50 rounded flex items-center justify-center text-red-500 font-bold">PDF</div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.size} • {doc.dateUploaded}</p>
                            </div>
                        </div>
                    ))
                  }
               </div>

               <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Application Details</h3>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 uppercase">Applicant</label>
                              <p className="font-medium">{application.applicantName}</p>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase">Submission Date</label>
                              <p className="font-medium">{application.submissionDate}</p>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase">Business Type</label>
                              <p className="font-medium">Sole Proprietorship</p>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase">Assessment</label>
                              <p className="font-medium">{application.assessedAmount ? `₱ ${application.assessedAmount.toLocaleString()}` : 'Pending'}</p>
                          </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Right: Workflow Controls */}
            <div className="w-full md:w-2/5 p-6 bg-white flex flex-col">
               <div className="mb-6">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</label>
                  <div className="mt-1 flex justify-between items-center">
                    <StatusBadge status={application.status} />
                    <span className="text-xs text-gray-400">{application.currentDepartment}</span>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 border-b pb-2">Workflow History</h4>
                  {application.logs.map((log) => (
                    <div key={log.id} className="flex gap-3 text-sm">
                       <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                          <div className="w-0.5 h-full bg-gray-100 mt-1"></div>
                       </div>
                       <div className="pb-4">
                          <p className="font-medium text-gray-900">{log.action}</p>
                          <p className="text-xs text-gray-500">{log.actor} • {log.timestamp}</p>
                          {log.notes && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 italic border border-gray-100">"{log.notes}"</p>}
                       </div>
                    </div>
                  ))}
               </div>

               {/* Action Panel */}
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-auto">
                   {isActionable ? (
                       <>
                         <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase">Take Action</h4>
                         <textarea 
                            className="w-full text-sm border-gray-300 rounded shadow-sm focus:border-gov-500 focus:ring-gov-500 p-2 border mb-3"
                            rows={2}
                            placeholder="Add remarks (optional)..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                         ></textarea>
                         {renderActionButtons()}
                       </>
                   ) : (
                       <div className="text-center py-2">
                           <Shield size={24} className="mx-auto text-gray-300 mb-2"/>
                           <p className="text-xs text-gray-500">Currently with {application.currentDepartment}</p>
                       </div>
                   )}
               </div>
            </div>
        </div>
      </div>
      <style>{`
        .btn-primary { @apply flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gov-600 hover:bg-gov-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-500; }
        .btn-secondary { @apply flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2; }
      `}</style>
    </div>
  );
};

export default ApplicationDetailModal;
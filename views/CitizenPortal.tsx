import React, { useState } from 'react';
import { Application, ApplicationStatus, Department, Role, User, DocumentAttachment } from '../types';
import { APP_TYPES } from '../constants';
import { Upload, FileIcon, Search, ArrowRight, Clock } from '../components/Icons';
import StatusBadge from '../components/StatusBadge';

interface CitizenPortalProps {
  currentUser: User;
  applications: Application[];
  onSubmitApplication: (appData: Partial<Application>) => void;
  onViewApplication: (app: Application) => void;
}

const CitizenPortal: React.FC<CitizenPortalProps> = ({ currentUser, applications, onSubmitApplication, onViewApplication }) => {
  const [activeTab, setActiveTab] = useState<'track' | 'apply'>('track');
  const [selectedType, setSelectedType] = useState(APP_TYPES[0]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert File objects to mock DocumentAttachments
    const docs: DocumentAttachment[] = uploadedFiles.map((f, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      name: f.name,
      type: f.type,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      dateUploaded: new Date().toISOString().split('T')[0]
    }));

    onSubmitApplication({
      type: selectedType,
      documents: docs,
      submissionDate: new Date().toISOString().split('T')[0],
    });

    // Reset and switch view
    setUploadedFiles([]);
    setActiveTab('track');
  };

  const myApplications = applications.filter(app => app.applicantName === currentUser.name || currentUser.name === 'Juan Dela Cruz'); // Mock filter logic

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex justify-between items-end pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mabuhay, {currentUser.name}!</h1>
          <p className="text-gray-500 mt-1">Welcome to the Municipal Digital Services Portal.</p>
        </div>
        <button 
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${activeTab === 'apply' ? 'bg-gov-800 text-white' : 'bg-gov-600 text-white hover:bg-gov-700'}`}
        >
          + New Application
        </button>
      </div>

      {activeTab === 'track' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">My Applications</h2>
            <div className="relative">
              <input type="text" placeholder="Search reference #..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-500 focus:outline-none" />
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference No.</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Step</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 {myApplications.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No applications found. Start a new one!</td></tr>
                 ) : (
                    myApplications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{app.referenceNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{app.type}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{app.submissionDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                           <Clock size={14} className="text-gray-400" /> {app.currentDepartment}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => onViewApplication(app)}
                            className="text-gov-600 hover:text-gov-800 text-sm font-medium flex items-center gap-1"
                          >
                            View <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
           <div className="mb-6 pb-6 border-b border-gray-100 flex justify-between items-center">
             <div>
               <h2 className="text-xl font-bold text-gray-900">Start New Application</h2>
               <p className="text-sm text-gray-500 mt-1">Please ensure all uploaded documents are clear and valid.</p>
             </div>
             <button onClick={() => setActiveTab('track')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Type</label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                >
                  {APP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-gray-400 mb-4">Support PDF, JPG, PNG</p>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gov-50 file:text-gov-700
                      hover:file:bg-gov-100
                    "
                  />
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-700 uppercase">Ready to upload:</p>
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        <FileIcon size={14} /> {file.name} <span className="text-xs text-gray-400">({(file.size/1024).toFixed(0)}kb)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                 <button type="submit" className="w-full bg-gov-600 text-white font-bold py-3 rounded-lg hover:bg-gov-700 transition-colors shadow-lg shadow-blue-200">
                   Submit Application
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default CitizenPortal;

import React, { useState, useEffect } from 'react';
import { CommunicationsService, CreateDocumentPayload } from '../services/communications.service';
import { DocType, DocumentStatus, InternalDocument, Department } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Inbox, Send, Search, Clock, ChevronRight, Filter, Plus, X } from '../components/Icons';

const CommunicationsView: React.FC = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<InternalDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
        const data = await CommunicationsService.getAllDocuments();
        setDocs(data);
    } catch (e) {
        console.error("Failed to fetch documents", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);
  
  const filteredDocs = docs.filter(d => 
    activeTab === 'incoming' 
    ? [DocType.LETTER_IN, DocType.ENDORSEMENT, DocType.RESOLUTION].includes(d.type)
    : [DocType.LETTER_OUT, DocType.MEMO].includes(d.type)
  );

  const handleLogComm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: CreateDocumentPayload = {
        title: formData.get('title') as string,
        type: formData.get('type') as DocType,
        originatingDept: user?.department || Department.RECEIVING,
        priority: 'Routine', // Default for now
        recipient: formData.get('recipient') as string
    };

    await CommunicationsService.createDocument(payload);

    setIsLogOpen(false);
    fetchDocs();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Communications Center</h1>
           <p className="text-slate-500">Manage official correspondence, endorsements, and memoranda.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('incoming')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'incoming' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
                <Inbox size={18} /> Incoming
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{filteredDocs.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('outgoing')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'outgoing' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
                <Send size={18} /> Outgoing
            </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50">
            <div className="flex gap-2">
               <div className="relative">
                  <input type="text" placeholder="Ref #, Subject, or Sender..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gov-500 bg-white" />
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
               </div>
               <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-sm font-medium hover:bg-slate-50">
                  <Filter size={16} /> Filters
               </button>
            </div>
            <button 
                onClick={() => setIsLogOpen(true)}
                className="bg-gov-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gov-700 flex items-center gap-2"
            >
               <Plus size={16}/> Log New {activeTab === 'incoming' ? 'Receipt' : 'Dispatch'}
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                     <th className="px-6 py-4">Reference No.</th>
                     <th className="px-6 py-4">Subject / Matter</th>
                     <th className="px-6 py-4">Source / Destination</th>
                     <th className="px-6 py-4">Status / Action</th>
                     <th className="px-6 py-4">Days Elapsed</th>
                     <th className="px-6 py-4 text-right">Option</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-400">Loading Documents...</td></tr>
                  ) : filteredDocs.map(doc => (
                     <tr key={doc.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                           <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">{doc.trackingId}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                           <p className="font-bold text-slate-800 text-sm truncate">{doc.title}</p>
                           <p className="text-xs text-slate-500">{doc.type}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-medium text-slate-700">{doc.originatingDept}</p>
                           <p className="text-xs text-slate-400">To: {doc.currentHolderId.replace('u_', '').toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${doc.status === DocumentStatus.FOR_APPROVAL ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                              <span className="text-xs font-bold text-slate-700">{doc.status}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                              <Clock size={12} /> 0 Days
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-gov-600 hover:bg-gov-50 p-2 rounded-full transition-colors">
                              <ChevronRight size={18} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {!isLoading && filteredDocs.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No {activeTab} communications found.</p>
                </div>
            )}
         </div>
      </div>

      {/* LOG MODAL */}
      {isLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Log {activeTab === 'incoming' ? 'Incoming' : 'Outgoing'} Communication</h2>
                    <button onClick={() => setIsLogOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleLogComm} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Document Type</label>
                        <select name="type" className="w-full p-2.5 border rounded-lg text-sm bg-slate-50">
                            <option value={DocType.LETTER_IN}>Incoming Letter</option>
                            <option value={DocType.ENDORSEMENT}>Endorsement</option>
                            <option value={DocType.MEMO}>Memorandum</option>
                            <option value={DocType.RESOLUTION}>Resolution</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Subject / Title</label>
                        <input name="title" type="text" required className="w-full p-2.5 border rounded-lg text-sm" placeholder="Subject of the letter..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">{activeTab === 'incoming' ? 'Sender (Source)' : 'Recipient (Destination)'}</label>
                        <input name="recipient" type="text" required className="w-full p-2.5 border rounded-lg text-sm" placeholder="e.g., Brgy. Captain, National Agency..." />
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsLogOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-gov-600 text-white font-bold rounded-xl hover:bg-gov-700 shadow-lg shadow-gov-200">Log to System</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsView;


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InternalDocument, DocumentStatus, Role, User, Department, DocType, JobLevel, AttachmentMeta } from '../types';
import { DB } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  MoreVertical,
  Paperclip,
  ChevronRight,
  Shield,
  Layers,
  Archive,
  Upload,
  X,
  FileIcon,
  Loader2,
  Menu
} from '../components/Icons';

interface InternalRoutingViewProps {
  currentUser: User;
}

const InternalRoutingView: React.FC<InternalRoutingViewProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<InternalDocument[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<InternalDocument | null>(null);
  
  // New Modal & Upload State
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Ref to track drag enter/leave events to prevent flickering on child elements
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
      const data = await DB.getInternalDocuments();
      setDocs(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           doc.trackingId.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'my-tasks') return matchesSearch && (doc.currentHolderId === currentUser.id || (doc.status === DocumentStatus.FOR_APPROVAL && currentUser.jobLevel === JobLevel.EXECUTIVE));
      if (filter === 'urgent') return matchesSearch && doc.priority === 'Highly Urgent';
      if (filter === 'dept') return matchesSearch && doc.originatingDept === currentUser.department;
      return matchesSearch;
    });
  }, [docs, filter, searchQuery, currentUser]);

  const stats = {
    incoming: docs.filter(d => d.status === DocumentStatus.RECEIVED).length,
    pending: docs.filter(d => d.currentHolderId === currentUser.id).length,
    urgent: docs.filter(d => d.priority === 'Highly Urgent').length,
    finalized: docs.filter(d => d.status === DocumentStatus.APPROVED).length
  };

  const handleDocAction = async (docId: string, action: 'FORWARD' | 'APPROVE' | 'REJECT' | 'RETURN') => {
    let newStatus = DocumentStatus.ROUTED;
    let nextUser = 'system'; 

    switch(action) {
        case 'FORWARD':
            newStatus = DocumentStatus.UNDER_REVIEW;
            nextUser = 'u_eval';
            break;
        case 'APPROVE':
            if (currentUser.jobLevel === JobLevel.EXECUTIVE) {
              newStatus = DocumentStatus.APPROVED;
              nextUser = 'u_records';
            } else {
              newStatus = DocumentStatus.FOR_APPROVAL;
              nextUser = 'u_mayor';
            }
            break;
        case 'RETURN':
            newStatus = DocumentStatus.RETURNED;
            nextUser = 'u_clerk'; 
            break;
        case 'REJECT':
            newStatus = DocumentStatus.REJECTED;
            nextUser = 'u_records';
            break;
    }

    try {
        await DB.updateDocumentStatus(docId, newStatus, nextUser, `${action} verified by ${currentUser.name} (${currentUser.department})`, currentUser.department);
        setSelectedDoc(null);
        loadData();
        alert(`Document successfully ${action.toLowerCase()}ed.`);
    } catch (err) {
        console.error(err);
        alert("Operation failed. Workflow conflict detected.");
    }
  };

  const handleFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setUploadQueue(prev => [...prev, ...Array.from(e.target.files || [])]);
      }
  };

  const removeFileFromQueue = (index: number) => {
      setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Improved Drag and Drop Handlers
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadQueue(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsUploading(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      try {
          const attachments: AttachmentMeta[] = [];
          
          // Process uploads sequentially
          for (const file of uploadQueue) {
              const meta = await DB.uploadDocumentFile(file);
              if (meta) attachments.push(meta);
          }

          const trackingId = `TAL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          
          await DB.createInternalDocument({
              trackingId,
              title: formData.get('title') as string,
              type: formData.get('type') as DocType,
              priority: formData.get('priority') as any,
              originatingDept: currentUser.department,
              currentHolderId: currentUser.id,
              status: DocumentStatus.RECEIVED,
          }, attachments);

          loadData();
          setIsNewDocModalOpen(false);
          setUploadQueue([]);
          
      } catch (error) {
          console.error("Creation failed", error);
          alert("Failed to create document.");
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Operations Workbench <span className="text-gov-500 font-bold not-italic text-sm ml-2 bg-gov-50 px-3 py-1 rounded-full border border-gov-100 uppercase tracking-widest hidden sm:inline-block">v2.5 Live</span></h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Authorised Access Only • {currentUser.department}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button onClick={() => navigate('/archive')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-sm">
              <Archive size={18} /> Vault Access
            </button>
            <button 
                onClick={() => setIsNewDocModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gov-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gov-700 transition-all shadow-xl shadow-gov-200 active:scale-95 text-sm"
            >
              <Plus size={18} /> Digitise Document
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Live Stream" value={stats.incoming} icon={Clock} color="blue" />
        <StatCard label="Direct Action" value={stats.pending} icon={Layers} color="indigo" />
        <StatCard label="High Priority" value={stats.urgent} icon={AlertCircle} color="red" />
        <StatCard label="Finalised" value={stats.finalized} icon={CheckCircle} color="emerald" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        
        {/* Table List */}
        <div className={`flex-1 w-full min-w-0 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 ease-in-out`}>
          {/* Controls Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col xl:flex-row justify-between gap-4 bg-slate-50/30">
            <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-full xl:w-fit overflow-x-auto max-w-full no-scrollbar">
              <FilterTab active={filter === 'all'} label="Global" onClick={() => setFilter('all')} />
              <FilterTab active={filter === 'my-tasks'} label="My Priority" onClick={() => setFilter('my-tasks')} />
              <FilterTab active={filter === 'dept'} label="Internal" onClick={() => setFilter('dept')} />
              <FilterTab active={filter === 'urgent'} label="Critical" onClick={() => setFilter('urgent')} />
            </div>
            <div className="relative w-full xl:w-auto">
              <input 
                type="text" 
                placeholder="Search Tracking ID or Title..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-gov-500/10 focus:border-gov-500 focus:outline-none w-full xl:w-80 transition-all shadow-sm" 
              />
              <Search size={20} className="absolute left-4 top-3.5 text-slate-300" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5 whitespace-nowrap">Track ID</th>
                  <th className="px-6 py-5">Matter</th>
                  <th className="px-6 py-5 text-center hidden xl:table-cell">Security</th>
                  <th className="px-6 py-5 hidden md:table-cell">Stage</th>
                  <th className="px-6 py-5 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.map(doc => (
                  <tr 
                    key={doc.id} 
                    onClick={() => setSelectedDoc(doc)}
                    className={`hover:bg-gov-50/50 transition-all cursor-pointer group relative ${selectedDoc?.id === doc.id ? 'bg-gov-50/80 shadow-inner' : ''}`}
                  >
                    <td className="px-6 py-5 align-top">
                      <span className="text-[10px] sm:text-xs font-mono font-black text-gov-700 bg-gov-100/50 px-2 sm:px-3 py-1.5 rounded-xl border border-gov-100/50 whitespace-nowrap">
                        {doc.trackingId}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-gov-700 transition-colors line-clamp-2 max-w-[200px] sm:max-w-xs">{doc.title}</span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{doc.type}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200 hidden sm:block"></span>
                            <span className="text-[10px] font-bold text-gov-600 uppercase tracking-tighter hidden sm:block">{doc.originatingDept}</span>
                            {doc.attachments && doc.attachments.length > 0 && (
                                <span className="flex items-center gap-1 text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 rounded whitespace-nowrap">
                                    <Paperclip size={10} /> {doc.attachments.length}
                                </span>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center hidden xl:table-cell">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm ${
                        doc.priority === 'Highly Urgent' ? 'bg-red-50 text-red-700 border-red-100' :
                        doc.priority === 'Urgent' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {doc.priority.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full shadow-sm shrink-0 ${
                          doc.status === DocumentStatus.FOR_APPROVAL ? 'bg-orange-500 animate-pulse' :
                          doc.status === DocumentStatus.APPROVED ? 'bg-emerald-500' : 
                          doc.status === DocumentStatus.RECEIVED ? 'bg-blue-500' : 'bg-slate-300'
                        }`}></div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight truncate max-w-[100px]">{doc.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right align-middle">
                       <button className="p-2 bg-white text-slate-400 hover:text-gov-600 hover:shadow-md rounded-xl transition-all border border-slate-100">
                         <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocs.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center">
                    <FileText size={40} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active documents in this stream</p>
                </div>
            )}
          </div>
        </div>

        {/* Mobile Backdrop */}
        {selectedDoc && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
            onClick={() => setSelectedDoc(null)}
          />
        )}

        {/* Sidebar Detail View (Drawer on Mobile, Collapsible Sidebar on Desktop) */}
        <div className={`
            fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
            lg:static lg:shadow-none lg:z-0 lg:bg-transparent
            ${selectedDoc ? 'translate-x-0 lg:w-[400px] xl:w-[450px] lg:opacity-100' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
        `}>
          {selectedDoc && (
            <div className="bg-white lg:rounded-[2rem] lg:shadow-2xl lg:shadow-gov-900/10 lg:border border-slate-100 h-full lg:h-auto flex flex-col min-w-[350px]">
              {/* Sidebar Header */}
              <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-start shrink-0 bg-slate-50/50">
                <div>
                    <p className="text-[10px] font-black text-gov-600 uppercase tracking-widest leading-none">Metadata Profile</p>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-tight italic pr-4">{selectedDoc.title}</h2>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm"><X size={20}/></button>
              </div>
              
              {/* Sidebar Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 lg:max-h-[calc(100vh-250px)] scrollbar-hide">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Chain of Custody</label>
                  <div className="mt-6 space-y-6 relative">
                    {selectedDoc.routingHistory.map((step, idx) => (
                      <div key={step.id} className="flex gap-5 relative group">
                        {idx !== selectedDoc.routingHistory.length - 1 && (
                          <div className="absolute left-[13px] top-7 bottom-[-24px] w-[2px] bg-slate-100"></div>
                        )}
                        <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all z-10 ${
                          idx === 0 ? 'bg-gov-600 border-gov-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-300'
                        }`}>
                          <CheckCircle size={14} />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{step.status}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(step.timestamp).toLocaleString()}</p>
                          {step.remarks && <p className="mt-3 text-[11px] font-medium text-slate-600 bg-slate-50 p-3 rounded-2xl italic border border-slate-100">"{step.remarks}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 block">Secured Attachments</label>
                  <div className="space-y-3">
                    {selectedDoc.attachments.map((file, idx) => (
                      <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-gov-300 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-gov-600 shrink-0"><FileText size={18} /></div>
                          <div className="truncate">
                             <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB • Digital Asset</p>
                          </div>
                        </div>
                        <Paperclip size={14} className="text-slate-300 group-hover:text-gov-500 shrink-0" />
                      </a>
                    ))}
                    {selectedDoc.attachments.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No physical attachments digitized.</p>
                    )}
                  </div>
                </div>
                
                {/* Authority Controls */}
                <div className="pt-8 border-t border-slate-100 space-y-3 pb-8">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 block">Authorization Console</label>
                  
                  {currentUser.jobLevel === JobLevel.EXECUTIVE && (
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => handleDocAction(selectedDoc.id, 'APPROVE')} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95">
                            <Shield size={18} /> Apply Digital Signature
                        </button>
                        <button onClick={() => handleDocAction(selectedDoc.id, 'RETURN')} className="w-full bg-white text-orange-600 border-2 border-orange-100 py-4 rounded-2xl font-black text-sm hover:bg-orange-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                            <ArrowRight size={18} className="rotate-180" /> Return to Dept
                        </button>
                    </div>
                  )}

                  {currentUser.jobLevel === JobLevel.DEPT_HEAD && (
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => handleDocAction(selectedDoc.id, 'APPROVE')} className="w-full bg-gov-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-gov-700 transition-all shadow-xl shadow-gov-600/20 flex items-center justify-center gap-3 active:scale-95">
                            Endorse for Executive Signature
                        </button>
                        <button onClick={() => handleDocAction(selectedDoc.id, 'FORWARD')} className="w-full bg-white text-blue-600 border-2 border-blue-100 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                            Forward for Evaluation
                        </button>
                    </div>
                  )}

                  {currentUser.jobLevel === JobLevel.OFFICER && (
                    <button onClick={() => handleDocAction(selectedDoc.id, 'APPROVE')} className="w-full bg-gov-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-gov-700 transition-all shadow-xl shadow-gov-600/20 flex items-center justify-center gap-3 active:scale-95">
                        Recommend Approval <CheckCircle size={18} />
                    </button>
                  )}

                  <button onClick={() => handleDocAction(selectedDoc.id, 'REJECT')} className="w-full bg-white text-slate-400 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 active:scale-95">
                      Terminate Record
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW DOCUMENT MODAL */}
      {isNewDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem] shrink-0">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Digitise Document</h2>
                    <button onClick={() => setIsNewDocModalOpen(false)} className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleCreateDocument} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                        <input name="title" type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-500/10 focus:outline-none" placeholder="e.g. Activity Proposal..." required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                            <select name="type" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-500/10 focus:outline-none appearance-none" required>
                                {Object.values(DocType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                            <select name="priority" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-500/10 focus:outline-none appearance-none">
                                <option value="Routine">Routine</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Highly Urgent">Highly Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachments</label>
                        <div 
                          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-colors relative cursor-pointer group ${isDragging ? 'border-gov-500 bg-gov-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
                          onDragEnter={onDragEnter}
                          onDragLeave={onDragLeave}
                          onDragOver={onDragOver}
                          onDrop={onDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={32} className={`mb-2 transition-colors ${isDragging ? 'text-gov-500' : 'text-slate-300 group-hover:text-gov-400'}`} />
                            <p className="text-xs font-bold text-slate-500 pointer-events-none">Drag files here or click to browse</p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                multiple 
                                onChange={handleFilesAdded}
                                className="hidden"
                            />
                        </div>
                        
                        {/* File Queue List */}
                        {uploadQueue.length > 0 && (
                            <div className="space-y-2 mt-4">
                                {uploadQueue.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                                <FileIcon size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                        </div>
                                        <button type="button" onClick={() => removeFileFromQueue(idx)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full py-5 bg-gov-600 text-white font-black rounded-2xl hover:bg-gov-700 shadow-xl shadow-gov-200 mt-4 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                        {isUploading ? 'Uploading & Routing...' : 'Upload & Route Document'}
                    </button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600 text-white shadow-blue-100',
    indigo: 'bg-indigo-600 text-white shadow-indigo-100',
    red: 'bg-red-600 text-white shadow-red-100',
    emerald: 'bg-emerald-600 text-white shadow-emerald-100',
  };
  return (
    <div className={`p-6 rounded-[2rem] border border-white/10 shadow-xl transition-all hover:scale-[1.03] flex justify-between items-center ${colors[color]}`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
        <p className="text-3xl font-black mt-2 italic leading-none">{value}</p>
      </div>
      <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md shrink-0`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

const FilterTab = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active ? 'bg-white text-gov-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);

export default InternalRoutingView;

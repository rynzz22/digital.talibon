import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Voucher, VoucherStage, VoucherType, User, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, CheckCircle, Clock, FileText, Search, Filter, ArrowRight, AlertCircle, FileCheck, Users, Plus, X, PenTool, Shield } from '../components/Icons';

const VoucherMonitorView: React.FC = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const refreshData = async () => {
    const data = await DB.getVouchers();
    setVouchers(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredVouchers = vouchers.filter(v => 
    (filter === 'All' || v.type === filter) &&
    (v.payee.toLowerCase().includes(search.toLowerCase()) || v.refNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await DB.createVoucher({
        type: formData.get('type') as VoucherType,
        payee: formData.get('payee') as string,
        particulars: formData.get('particulars') as string,
        amount: Number(formData.get('amount')),
        refNumber: formData.get('refNumber') as string,
    });
    
    setIsCreateOpen(false);
    refreshData();
  };

  const handleProcess = async () => {
    if (!selectedVoucher || !user) return;
    await DB.advanceVoucherStage(selectedVoucher.id, user, "Processed via Command Center");
    setSelectedVoucher(null);
    refreshData();
  };

  // Logic to determine if user can act on the selected voucher
  const canAct = (v: Voucher) => {
    if (!user) return false;
    // Simple RBAC logic for demo
    if (v.currentStage === VoucherStage.PREPARATION && user.role === Role.ADMIN_CLERK) return true;
    if (v.currentStage === VoucherStage.BUDGET_REVIEW && user.role === Role.BUDGET_OFFICER) return true;
    if (v.currentStage === VoucherStage.ACCOUNTING_AUDIT && user.role === Role.ACCOUNTANT) return true;
    if (v.currentStage === VoucherStage.MAYOR_APPROVAL && user.role === Role.MAYOR) return true;
    if (v.currentStage === VoucherStage.TREASURY_CHECK && user.role === Role.TREASURER) return true;
    return false; // View only
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             <DollarSign className="text-emerald-600" /> Financial Document Tracker
           </h1>
           <p className="text-slate-500 mt-1">Real-time monitoring of DVs, ORS, PRs, and Payroll flow.</p>
        </div>
        <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
            <Plus size={18} /> New Voucher
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Total in Pipeline</p>
            <p className="text-2xl font-black text-slate-900 mt-1">₱ {(vouchers.reduce((acc, v) => acc + v.amount, 0)/1000000).toFixed(1)}M</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Pending Mayor's Sig</p>
            <p className="text-2xl font-black text-orange-500 mt-1">{vouchers.filter(v => v.currentStage === VoucherStage.MAYOR_APPROVAL).length} Docs</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg Turnaround</p>
            <p className="text-2xl font-black text-blue-500 mt-1">2.4 Days</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Released Today</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">{vouchers.filter(v => v.currentStage === VoucherStage.RELEASED).length}</p>
         </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="flex gap-2">
            {[ 'All', VoucherType.DV, VoucherType.ORS, VoucherType.PAYROLL ].map(t => (
                <button 
                  key={t}
                  onClick={() => setFilter(t)} 
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                    {t}
                </button>
            ))}
         </div>
         <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search Payee or Ref #..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
         </div>
      </div>

      {/* List */}
      <div className="space-y-4">
         {filteredVouchers.map(v => (
             <div key={v.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            {v.type === VoucherType.PAYROLL ? <Users size={24}/> : <FileText size={24}/>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{v.refNumber}</span>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{v.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{v.payee}</h3>
                            <p className="text-sm text-slate-500">{v.particulars}</p>
                        </div>
                    </div>
                    <div className="text-left lg:text-right">
                        <p className="text-2xl font-black text-slate-900">₱ {v.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Amount Payable</p>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                    <div className="relative z-10 flex justify-between overflow-x-auto pb-2">
                        {Object.values(VoucherStage).map((stage, idx) => {
                             const isActive = stage === v.currentStage;
                             const isPast = Object.values(VoucherStage).indexOf(stage) < Object.values(VoucherStage).indexOf(v.currentStage);
                             
                             return (
                                <div key={idx} className="flex flex-col items-center gap-2 min-w-[60px]">
                                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-white ${
                                        isActive ? 'border-blue-600 text-blue-600 scale-110 shadow-lg' : 
                                        isPast ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 text-slate-300'
                                    }`}>
                                        {isPast ? <CheckCircle size={14} /> : <div className="h-2 w-2 rounded-full bg-current"></div>}
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-tight whitespace-nowrap ${isActive ? 'text-blue-700' : isPast ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {stage.split(' ')[0]}
                                    </span>
                                </div>
                             )
                        })}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} /> Created: {v.dateCreated}
                    </div>
                    <button 
                        onClick={() => setSelectedVoucher(v)}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        View & Process <ArrowRight size={16} />
                    </button>
                </div>
             </div>
         ))}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">New Financial Document</h2>
                    <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Voucher Type</label>
                        <select name="type" className="w-full p-2.5 border rounded-lg text-sm bg-slate-50">
                            {Object.values(VoucherType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Reference No.</label>
                        <input name="refNumber" type="text" placeholder="Auto-generated if empty" className="w-full p-2.5 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Payee</label>
                        <input name="payee" type="text" required className="w-full p-2.5 border rounded-lg text-sm" placeholder="Name of recipient" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount (PHP)</label>
                        <input name="amount" type="number" required className="w-full p-2.5 border rounded-lg text-sm" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Particulars</label>
                        <textarea name="particulars" rows={3} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Description of payment..."></textarea>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">Submit Voucher</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* DETAIL/PROCESS MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div>
                        <div className="flex gap-2 mb-1">
                             <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{selectedVoucher.type}</span>
                             <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">{selectedVoucher.refNumber}</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900">{selectedVoucher.payee}</h2>
                    </div>
                    <button onClick={() => setSelectedVoucher(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
                            <p className="text-2xl font-black text-emerald-600">₱ {selectedVoucher.amount.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <label className="text-xs font-bold text-slate-400 uppercase">Current Stage</label>
                            <p className="text-lg font-bold text-blue-600">{selectedVoucher.currentStage}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Particulars</label>
                        <p className="text-sm text-slate-700 bg-white border border-slate-200 p-3 rounded-xl">{selectedVoucher.particulars}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Audit Trail</label>
                        <div className="space-y-3 relative">
                            {selectedVoucher.history.map((h, i) => (
                                <div key={i} className="flex gap-4 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5"></div>
                                        {i !== selectedVoucher.history.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{h.stage}</p>
                                        <p className="text-xs text-slate-500">{h.action} by {h.actor} • {new Date(h.date).toLocaleDateString()}</p>
                                        {h.notes && <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded mt-1">"{h.notes}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-slate-50 rounded-b-2xl">
                    {canAct(selectedVoucher) ? (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase text-center">Action Required: {selectedVoucher.currentStage}</p>
                            <button onClick={handleProcess} className="w-full py-3 bg-gov-600 text-white font-bold rounded-xl hover:bg-gov-700 shadow-lg shadow-gov-200 flex items-center justify-center gap-2">
                                <PenTool size={18} /> Digitally Sign & Approve
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 text-sm italic flex flex-col items-center">
                            <Shield size={24} className="mb-2 opacity-20"/>
                            Current stage is handled by {selectedVoucher.currentStage.split(' ')[0]} Office.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VoucherMonitorView;
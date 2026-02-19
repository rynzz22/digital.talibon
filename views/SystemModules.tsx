
import React, { useState, useEffect } from 'react';
import { MOCK_CONTACTS, MOCK_BARANGAYS } from '../constants'; 
import { DB } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle,
  ChevronRight,
  X,
  Plus,
  Loader2,
  CheckCircle,
  Search,
  Phone,
  FileText
} from '../components/Icons';

export const ProjectsModule: React.FC = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = async () => {
      setIsLoading(true);
      const data = await DB.getProjects();
      setProjects(data);
      setIsLoading(false);
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const newProj = {
          name: formData.get('name'),
          location: formData.get('location'),
          department: "Engineering", 
          budget: Number(formData.get('budget')),
          progress: 0,
          status: "Planning"
      };
      await DB.createProject(newProj);
      setIsNewProjectModalOpen(false);
      loadProjects();
  };

  const totalBudget = projects.reduce((acc, p) => acc + Number(p.budget), 0);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Infrastructure & Development</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Real-time PPA Management Monitor</p>
        </div>
        <button onClick={() => setIsNewProjectModalOpen(true)} className="bg-gov-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-gov-200 hover:bg-gov-700 flex items-center gap-2 active:scale-95 transition-all">
          <Plus size={18}/> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatTile label="Aggregated Budget" value={`₱ ${(totalBudget/1000000).toFixed(2)}M`} color="blue" />
        <StatTile label="Active Works" value={projects.filter(p => p.status === 'Ongoing').length} color="indigo" />
        <StatTile label="Completed" value={projects.filter(p => p.status === 'Completed').length} color="emerald" />
        <StatTile label="Critical Path" value={projects.filter(p => p.status === 'Delayed').length} color="red" />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisation</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                  <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-gov-600"/></td></tr>
              ) : projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-gov-50/30 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800 text-sm italic">{proj.name}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                    <MapPin size={14} className="text-gov-500"/> {proj.location}
                  </td>
                  <td className="px-8 py-5 text-sm font-mono font-black text-slate-900">₱{(Number(proj.budget)/1000000).toFixed(2)}M</td>
                  <td className="px-8 py-5 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${proj.progress === 100 ? 'bg-emerald-500' : 'bg-gov-600'}`} style={{ width: `${proj.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 italic">{proj.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm ${
                      proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      proj.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && projects.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Archive empty.</div>}
        </div>
      </div>

      {isNewProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem]">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Initialize Operation</h2>
                    <button onClick={() => setIsNewProjectModalOpen(false)} className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreateProject} className="p-8 space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                        <input name="name" type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-500/10 focus:outline-none" placeholder="e.g. Brgy. Hall Solar Grid" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocation (PHP)</label>
                            <input name="budget" type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-500/10 focus:outline-none font-mono" placeholder="0.00" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coordinate/Location</label>
                            <input name="location" type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-500/10 focus:outline-none" placeholder="Barangay" required />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-gov-600 text-white font-black rounded-2xl hover:bg-gov-700 shadow-xl shadow-gov-200 mt-4 active:scale-95 transition-all">Submit for PPA Log</button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

const StatTile = ({ label, value, color }: any) => {
    const colors: any = {
        blue: 'text-blue-600', indigo: 'text-indigo-600', emerald: 'text-emerald-600', red: 'text-red-600'
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black italic ${colors[color]}`}>{value}</p>
        </div>
    );
};

export const BarangayModule: React.FC = () => {
  const [selectedBrgy, setSelectedBrgy] = useState<any>(null);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Barangay Operations</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Territorial Oversight • 25 Units</p>
        </div>
        <button onClick={() => alert("Consolidating Demographic Data...")} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-sm font-black shadow-sm hover:bg-slate-50 uppercase tracking-widest transition-all">
          Global Census
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {MOCK_BARANGAYS.map(brgy => (
           <div key={brgy.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-gov-400 transition-all hover:scale-[1.02]">
              <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl text-gov-600 shadow-sm border border-slate-100">
                       <Building2 size={24} />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter italic">{brgy.name}</h3>
                 </div>
                 {brgy.status === 'Active' ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-orange-500"/>}
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Chief Exec.</span>
                        <span className="font-bold text-slate-700 text-sm leading-tight block truncate">{brgy.captain}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Population</span>
                        <span className="font-black text-gov-700 text-sm leading-tight block">{brgy.population.toLocaleString()}</span>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-50">
                    <button onClick={() => setSelectedBrgy(brgy)} className="w-full py-4 bg-slate-50 text-gov-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gov-50 transition-all flex items-center justify-center gap-2 group-hover:bg-gov-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-gov-200">
                       Unit Profile <ChevronRight size={14}/>
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {selectedBrgy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gov-600 text-white">
                    <h2 className="text-2xl font-black tracking-tighter italic flex items-center gap-3"><Building2 size={24}/> {selectedBrgy.name}</h2>
                    <button onClick={() => setSelectedBrgy(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={24} /></button>
                </div>
                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-slate-300 font-black text-3xl italic shadow-inner border border-slate-200">
                            {selectedBrgy.name.charAt(0)}
                        </div>
                        <p className="text-xl font-black text-slate-800 tracking-tight italic">Hon. {selectedBrgy.captain}</p>
                        <p className="text-[10px] text-gov-600 font-black uppercase tracking-[0.2em]">Punong Barangay</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                             <p className="text-2xl font-black text-slate-900 italic">{selectedBrgy.population}</p>
                             <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest mt-1">Residents</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                             <p className="text-2xl font-black text-emerald-600 italic">98%</p>
                             <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest mt-1">RPT Collection</p>
                         </div>
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all">Download Masterlist</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export const DirectoryModule: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = MOCK_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Unified Personnel Directory</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Secure Internal Communication Lines</p>
        </div>
        <div className="relative w-full md:w-80">
           <input 
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Lookup Employee..." 
             className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-gov-500/10 focus:outline-none transition-all placeholder:text-slate-300" 
           />
           <Search size={20} className="absolute left-4 top-4 text-slate-300" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
             <tr>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity / Auth Level</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Office</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel Info</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((contact) => (
              <tr key={contact.id} className="hover:bg-gov-50/30 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-800 text-sm italic">{contact.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{contact.position}</p>
                </td>
                <td className="px-8 py-6 text-xs font-black text-gov-600 uppercase tracking-tighter">{contact.department}</td>
                <td className="px-8 py-6">
                   <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-2"><Phone size={14} className="text-slate-300"/> {contact.phone}</span>
                      <span className="flex items-center gap-2 text-gov-600 lowercase tracking-tight italic"><Users size={14} className="text-slate-300"/> {contact.email}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <button 
                     onClick={() => navigate('/chat', { state: { contactId: `u_eng` } })} 
                     className="px-5 py-2.5 bg-gov-50 text-gov-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gov-600 hover:text-white hover:shadow-lg hover:shadow-gov-100 transition-all active:scale-95"
                   >
                     Initiate Chat
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

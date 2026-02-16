
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Department, JobLevel } from '../types';
import { Shield, Lock, Building2, UserCircle, Briefcase, AlertCircle } from '../components/Icons';

const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | ''>('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
        setLoading(true);
        setTimeout(() => {
            if (!email.endsWith('@talibon.gov.ph') && !email.includes('admin')) {
                 setError('Access Denied: Non-government email detected.');
                 setLoading(false);
                 return;
            }
            setLoading(false);
            setStep(2);
        }, 800);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (selectedDept && selectedLevel) {
        setLoading(true);
        
        const success = await login(email, selectedDept, selectedLevel);
        
        if (success) {
            navigate('/', { replace: true });
        } else {
            setError('Authentication failed. Please verify your credentials and permissions.');
            setLoading(false);
        }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-end p-4 pb-12 md:pb-24 overflow-hidden">
      
      {/* Background Layer with Blur and Lightness */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: "url('https://phillexevansnotebook.wordpress.com/wp-content/uploads/2019/01/20180410_153642.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px) brightness(1.15) contrast(0.95)'
        }}
      ></div>

      {/* Subtle Overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-white/10"></div>
      
      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_40px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px] animate-in slide-in-from-bottom-12 duration-700 border border-white/50">
        
        {/* Left Panel: Branding */}
        <div className="md:w-5/12 bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[120px] opacity-10 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-10 -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
                        <Shield size={32} className="text-gov-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter leading-none text-slate-100">LGU TALIBON</h1>
                        <p className="text-[9px] font-bold tracking-[0.2em] text-red-500 uppercase mt-1">Restricted Access</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">Internal<br/>Operations<br/>Platform</h2>
                    <p className="text-slate-400 text-xs leading-relaxed border-l-2 border-slate-700 pl-4">
                        This system is for the exclusive use of authorized government personnel. Unauthorized access is prohibited and punishable by law under the Data Privacy Act of 2012.
                    </p>
                </div>
            </div>

            <div className="relative z-10 text-[9px] text-slate-600 font-mono mt-8 border-t border-slate-800 pt-4">
                <p className="flex items-center gap-2"><Lock size={10}/> 256-bit SSL Encrypted Connection</p>
                <p>IP: Recorded for Security Audit</p>
            </div>
        </div>

        {/* Right Panel: Login Forms */}
        <div className="md:w-7/12 p-12 bg-white flex flex-col justify-center relative">
            
            <div className="absolute top-6 right-6">
                <div className="bg-red-50 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full border border-red-100 flex items-center gap-1 uppercase tracking-wide">
                    <AlertCircle size={10} /> Official Use Only
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            
            {step === 1 ? (
                <form onSubmit={handleCredentialsSubmit} className="max-w-md w-full mx-auto space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">Employee Identification</h3>
                        <p className="text-slate-500 text-sm">Please identify yourself using your official LGU credentials.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Government Email</label>
                            <div className="relative">
                                <UserCircle size={20} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="lastname.firstname@talibon.gov.ph"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none transition-all font-medium text-slate-800"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secure Password</label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none transition-all font-medium text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Validating Identity...' : 'Verify Credential'}
                    </button>
                    
                    <div className="text-center pt-4 border-t border-slate-100">
                         <p className="text-xs text-slate-400">By logging in, you agree to the <a href="#" className="underline">Acceptable Use Policy</a>.</p>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleFinalSubmit} className="max-w-md w-full mx-auto space-y-6 animate-in slide-in-from-right duration-500">
                     <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">Workstation Configuration</h3>
                        <p className="text-slate-500 text-sm">Configure your session environment for this terminal.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Department</label>
                            <div className="relative">
                                <Building2 size={20} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    required
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value as Department)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none appearance-none font-medium text-slate-800"
                                >
                                    <option value="" disabled>Select Department</option>
                                    {Object.values(Department).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clearance Level</label>
                            <div className="relative">
                                <Briefcase size={20} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    required
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value as JobLevel)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none appearance-none font-medium text-slate-800"
                                >
                                    <option value="" disabled>Select Clearance</option>
                                    {Object.values(JobLevel).map(l => (
                                        <option key={l} value={l}>{l.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all text-sm"
                        >
                            Back
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-2/3 bg-gov-600 text-white font-bold py-4 rounded-xl hover:bg-gov-700 transition-all shadow-xl shadow-gov-200 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span> : 'Establish Secure Session'}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;

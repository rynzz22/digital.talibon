
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Department, JobLevel } from '../types';
import { Shield, Lock, Building2, UserCircle, Briefcase } from '../components/Icons';

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1577017040065-65052831a153?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px] animate-in fade-in zoom-in duration-500">
        
        {/* Left Panel: Branding */}
        <div className="md:w-5/12 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gov-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <Shield size={42} className="text-gov-500" />
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none italic uppercase">LGU Talibon</h1>
                        <p className="text-[10px] font-bold tracking-[0.3em] text-gov-400 uppercase">Enterprise Platform</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold leading-tight">Unified Digital Governance System</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Securely access departmental workflows, financial monitoring, and executive dashboards in one centralized enterprise portal.
                    </p>
                </div>
            </div>

            <div className="relative z-10 text-[10px] text-slate-500 font-mono mt-8">
                <p>System Version 3.0.2 (Enterprise)</p>
                <p>Authorized Personnel Only</p>
            </div>
        </div>

        {/* Right Panel: Login Forms */}
        <div className="md:w-7/12 p-12 bg-white flex flex-col justify-center">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    {error}
                </div>
            )}
            
            {step === 1 ? (
                <form onSubmit={handleCredentialsSubmit} className="max-w-md w-full mx-auto space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">Sign In</h3>
                        <p className="text-slate-500">Enter your secure credentials to proceed.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email</label>
                            <div className="relative">
                                <UserCircle size={20} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@talibon.gov.ph"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Verifying...' : 'Next Step'}
                    </button>
                    
                    <div className="text-center">
                        <a href="#" className="text-xs text-gov-600 font-bold hover:underline">Forgot Password?</a>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleFinalSubmit} className="max-w-md w-full mx-auto space-y-6 animate-in slide-in-from-right duration-500">
                     <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">Portal Access</h3>
                        <p className="text-slate-500">Select your department and authorization level.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department / Office</label>
                            <div className="relative">
                                <Building2 size={20} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    required
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value as Department)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none appearance-none"
                                >
                                    <option value="" disabled>Select Department</option>
                                    {Object.values(Department).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Level / Role</label>
                            <div className="relative">
                                <Briefcase size={20} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    required
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value as JobLevel)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none appearance-none"
                                >
                                    <option value="" disabled>Select Authorization Level</option>
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
                            className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Back
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-2/3 bg-gov-600 text-white font-bold py-4 rounded-xl hover:bg-gov-700 transition-all shadow-lg shadow-gov-200 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span> : 'Access Portal'}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
      
      <div className="absolute bottom-6 text-center text-slate-400 text-[10px] font-mono">
         Protected by LGU Talibon Enterprise Security • RBAC Enabled • 256-bit Encryption
      </div>
    </div>
  );
};

export default LoginView;

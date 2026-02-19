
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Department, JobLevel } from '../types';
import { Shield, Lock, Building2, UserCircle, Briefcase, AlertCircle, UserPlus, ArrowLeft, Loader2 } from '../components/Icons';

const LoginView: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | ''>('');

  const clearMessages = () => {
      setError('');
      setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
        if (!selectedDept || !selectedLevel) {
            throw new Error("Please select Department and Clearance Level.");
        }

        // Basic validation
        const cleanEmail = email.trim();
        const cleanPass = password.trim();
        const cleanName = fullName.trim();

        if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
            throw new Error("Please enter a valid email address.");
        }
        
        if (cleanPass.length < 6) {
             throw new Error("Password must be at least 6 characters.");
        }

        if (mode === 'REGISTER') {
            await register(cleanEmail, selectedDept, selectedLevel, cleanPass, cleanName);
            setSuccessMsg("Account created! Please check your email inbox (and spam folder) to confirm your address before logging in.");
            setMode('LOGIN');
            setPassword('');
        } else {
            // Login Mode
            await login(cleanEmail, selectedDept, selectedLevel, cleanPass);
            // If we get here, login was successful (no error thrown)
            navigate('/', { replace: true });
        }
    } catch (err: any) {
        console.error("Auth Error Detail:", err);
        
        let msg = err.message || "Authentication failed.";
        
        // Detailed Error Mapping
        const lowerMsg = msg.toLowerCase();
        
        if (lowerMsg.includes("rate limit exceeded") || lowerMsg.includes("too many requests")) {
            msg = "Security Alert: Too many attempts. Please wait 60 seconds before trying again.";
        } else if (lowerMsg.includes("database error")) {
            msg = "System Error: Database trigger failed. Please run the 'db_schema.sql' script in Supabase.";
        } else if (lowerMsg.includes("user already registered")) {
            msg = "This email is already registered. Please log in.";
        } else if (lowerMsg.includes("email not confirmed")) {
            msg = "Please verify your email address. Check your inbox for the confirmation link.";
        } else if (lowerMsg.includes("invalid login credentials")) {
            msg = "Incorrect email or password.";
        } else if (lowerMsg.includes("is invalid")) {
            msg = "The email address format is invalid.";
        } else if (lowerMsg.includes("password")) {
            msg = "Password error: " + msg;
        }
        
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center md:justify-end p-4 pb-12 md:pb-24 overflow-hidden bg-slate-900">
      
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: "url('https://phillexevansnotebook.wordpress.com/wp-content/uploads/2019/01/20180410_153642.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(4px) brightness(0.4) contrast(1.1)'
        }}
      ></div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_40px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px] animate-in slide-in-from-bottom-12 duration-700 border border-white/10">
        
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
                        <p className="text-[9px] font-bold tracking-[0.2em] text-red-500 uppercase mt-1">Enterprise Core</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        {mode === 'LOGIN' ? 'Internal\nOperations\nPlatform' : 'Personnel\nRegistration\nSystem'}
                    </h2>
                    <p className="text-slate-400 text-xs leading-relaxed border-l-2 border-slate-700 pl-4">
                        This system is for the exclusive use of authorized government personnel. Unauthorized access is prohibited.
                    </p>
                    
                    {error && error.includes("Security Alert") && (
                         <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-xs animate-pulse">
                             System has temporarily blocked requests from your IP due to multiple failures.
                         </div>
                    )}
                </div>
            </div>

            <div className="relative z-10 text-[9px] text-slate-600 font-mono mt-8 border-t border-slate-800 pt-4">
                <p className="flex items-center gap-2"><Lock size={10}/> System Online & Secured</p>
            </div>
        </div>

        {/* Right Panel: Forms */}
        <div className="md:w-7/12 p-12 bg-white flex flex-col justify-center relative">
            
            <div className="absolute top-6 right-6 flex gap-2">
                 {mode === 'REGISTER' && (
                     <button onClick={() => { setMode('LOGIN'); clearMessages(); }} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
                        <ArrowLeft size={12} /> Back to Login
                     </button>
                 )}
                 <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1 uppercase tracking-wide">
                    <AlertCircle size={10} /> Official Use Only
                 </div>
            </div>

            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-start gap-2">
                    <Shield size={18} className="shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2 animate-in shake">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto space-y-4 animate-in slide-in-from-right duration-500">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">{mode === 'LOGIN' ? 'Secure Login' : 'Create Account'}</h3>
                    <p className="text-slate-500 text-sm">{mode === 'LOGIN' ? 'Enter credentials to access workspace.' : 'Register new personnel profile.'}</p>
                </div>

                {mode === 'REGISTER' && (
                    <div className="relative">
                         <UserCircle size={20} className="absolute left-3 top-3 text-slate-400" />
                         <input 
                             type="text" 
                             required={mode === 'REGISTER'}
                             value={fullName}
                             onChange={(e) => { setFullName(e.target.value); clearMessages(); }}
                             placeholder="Full Name"
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none transition-all font-medium text-slate-800"
                         />
                    </div>
                )}

                <div className="relative">
                    <UserCircle size={20} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                        placeholder="Email Address"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none transition-all font-medium text-slate-800"
                    />
                </div>

                <div className="relative">
                    <Lock size={20} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                        placeholder="Password"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none transition-all font-medium text-slate-800"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <Building2 size={20} className="absolute left-3 top-3 text-slate-400" />
                        <select 
                            required
                            value={selectedDept}
                            onChange={(e) => { setSelectedDept(e.target.value as Department); clearMessages(); }}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none appearance-none font-medium text-slate-800 text-xs"
                        >
                            <option value="" disabled>Department</option>
                            {Object.values(Department).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Briefcase size={20} className="absolute left-3 top-3 text-slate-400" />
                        <select 
                            required
                            value={selectedLevel}
                            onChange={(e) => { setSelectedLevel(e.target.value as JobLevel); clearMessages(); }}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:outline-none appearance-none font-medium text-slate-800 text-xs"
                        >
                            <option value="" disabled>Role / Level</option>
                            {Object.values(JobLevel).map(l => (
                                <option key={l} value={l}>{l.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 mt-4 ${mode === 'LOGIN' ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200' : 'bg-gov-600 hover:bg-gov-700 shadow-gov-200'}`}
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (mode === 'LOGIN' ? 'Establish Session' : 'Create Personnel Record')}
                </button>
                
                {mode === 'LOGIN' && (
                    <div className="text-center pt-4 border-t border-slate-100">
                         <button type="button" onClick={() => { setMode('REGISTER'); clearMessages(); }} className="text-xs text-gov-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                            <UserPlus size={14}/> First time here? Create Account
                         </button>
                    </div>
                )}
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

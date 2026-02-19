
import { supabase } from '../lib/supabase';
import { User, Department, JobLevel } from '../types';

interface LoginPayload {
  email: string;
  department: Department;
  jobLevel: JobLevel;
  password?: string;
  fullName?: string;
}

interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export const AuthService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const email = payload.email.trim();
    const password = payload.password?.trim();
    
    if (!password) throw new Error("Password required");

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await (supabase.auth as any).signInWithPassword({
        email: email,
        password: password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No user returned from Auth provider");

    // 2. Fetch Extended Profile Data
    let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    // 3. SELF-HEALING: If profile is missing (schema reset or trigger failed), create it now.
    if (profileError || !profile) {
        console.warn("Profile missing for authenticated user. Attempting self-healing...");
        
        const newProfile = {
            id: authData.user.id,
            email: email,
            full_name: authData.user.user_metadata?.full_name || 'Recovered User',
            department: authData.user.user_metadata?.department || payload.department || 'Unassigned',
            job_level: authData.user.user_metadata?.job_level || payload.jobLevel || 'CLERK',
            role: 'STAFF',
            is_active: true
        };

        const { error: insertError } = await supabase.from('profiles').insert(newProfile);
        
        if (insertError) {
             console.error("Self-healing failed. Using metadata fallback.", insertError);
        } else {
             // Retry fetch
             const { data: retryProfile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
             if (retryProfile) {
                 profile = retryProfile;
             }
        }
    }

    // 4. Construct User Object
    if (profile) {
        return {
            token: authData.session?.access_token || '',
            user: {
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                department: profile.department as Department,
                jobLevel: profile.job_level as JobLevel,
                role: profile.role || 'STAFF',
                avatar: profile.avatar_url
            },
            expiresIn: authData.session?.expires_in || 3600
        };
    }

    // Fallback if DB insert completely failed
    return {
        token: authData.session?.access_token || '',
        user: {
            id: authData.user.id,
            name: authData.user.user_metadata?.full_name || email.split('@')[0],
            email: authData.user.email || email,
            department: authData.user.user_metadata?.department as Department,
            jobLevel: authData.user.user_metadata?.job_level as JobLevel,
            role: 'STAFF' as any,
        },
        expiresIn: authData.session?.expires_in || 3600
    };
  },

  register: async (payload: LoginPayload): Promise<boolean> => {
     const email = payload.email.trim();
     const password = payload.password?.trim();
     const fullName = payload.fullName?.trim();

     if (!password) throw new Error("Password required");
     
     // We pass the exact string values to Supabase.
     // The SQL Trigger 'handle_new_user' will cast these to the Enums.
     const { data, error } = await (supabase.auth as any).signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName || 'New User',
                department: payload.department, 
                job_level: payload.jobLevel,
            }
        }
     });

     if (error) {
        console.error("Supabase Registration Error:", error);
        throw error;
     }
     
     if (data.user) {
         return true;
     }
     
     return false;
  },

  logout: async () => {
    try {
        await (supabase.auth as any).signOut();
    } catch(e) { console.error("Logout error", e); }
    localStorage.removeItem('lgu_token');
    localStorage.removeItem('lgu_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('lgu_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};


import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobLevel, Department } from '../types';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedLevels?: JobLevel[];
  allowedDepts?: Department[];
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedLevels, 
  allowedDepts, 
  fallback 
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const isLevelAllowed = allowedLevels ? allowedLevels.includes(user.jobLevel) : true;
  const isDeptAllowed = allowedDepts ? allowedDepts.includes(user.department) : true;

  if (isLevelAllowed && isDeptAllowed) {
    return <>{children}</>;
  }

  return (
    <>
        {fallback || (
            <div className="flex flex-col items-center justify-center p-12 h-full text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Shield size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Access Restricted</h3>
                <p className="text-sm text-gray-500 max-w-md">
                    Your current authorization level ({user.jobLevel}) or department does not have permission to view this module.
                </p>
            </div>
        )}
    </>
  );
};

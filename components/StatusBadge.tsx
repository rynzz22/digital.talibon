import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';

  switch (status) {
    case ApplicationStatus.APPROVED:
    case ApplicationStatus.RELEASED:
    case ApplicationStatus.PAYMENT_VERIFIED:
      colorClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      break;
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.RETURNED:
      colorClass = 'bg-red-100 text-red-800 border border-red-200';
      break;
    case ApplicationStatus.FOR_INSPECTION:
    case ApplicationStatus.FOR_VERIFICATION:
      colorClass = 'bg-blue-100 text-blue-800 border border-blue-200';
      break;
    case ApplicationStatus.FOR_ASSESSMENT:
    case ApplicationStatus.FOR_PAYMENT:
      colorClass = 'bg-amber-100 text-amber-800 border border-amber-200';
      break;
    case ApplicationStatus.FOR_APPROVAL:
      colorClass = 'bg-purple-100 text-purple-800 border border-purple-200';
      break;
    case ApplicationStatus.SUBMITTED:
      colorClass = 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
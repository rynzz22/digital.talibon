import React, { useState } from 'react';
import { MOCK_PROJECTS, MOCK_EVENTS, MOCK_CONTACTS, MOCK_BARANGAYS } from '../constants';
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar as CalendarIcon, 
  Phone, 
  Search, 
  Briefcase, 
  BarChart2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Folder
} from '../components/Icons';

// ----------------------------------------------------------------------
// 1. PROGRAMS, PROJECTS & ACTIVITIES (PPAs)
// ----------------------------------------------------------------------
export const ProjectsModule: React.FC = () => {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs, Projects & Activities</h1>
          <p className="text-gray-500">Monitor infrastructure and development projects.</p>
        </div>
        <button className="bg-gov-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gov-700">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Budget</p>
          <p className="text-xl font-bold text-gray-900 mt-1">₱ 8.75M</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-xs font-bold text-gray-500 uppercase">Active Projects</p>
           <p className="text-xl font-bold text-emerald-600 mt-1">4 Ongoing</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-xs font-bold text-gray-500 uppercase">Completion Rate</p>
           <p className="text-xl font-bold text-blue-600 mt-1">54% Avg</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-xs font-bold text-gray-500 uppercase">Critical</p>
           <p className="text-xl font-bold text-red-600 mt-1">1 Delayed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dept</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Budget</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_PROJECTS.map((proj) => (
              <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900 text-sm">{proj.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400"/> {proj.location}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{proj.department}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-700">₱{(proj.budget/1000000).toFixed(2)}M</td>
                <td className="px-6 py-4 w-48">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${proj.progress === 100 ? 'bg-emerald-500' : proj.progress < 30 ? 'bg-red-400' : 'bg-blue-500'}`} style={{ width: `${proj.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{proj.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    proj.status === 'Delayed' ? 'bg-red-50 text-red-700 border-red-200' :
                    proj.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {proj.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. BARANGAY MODULE
// ----------------------------------------------------------------------
export const BarangayModule: React.FC = () => {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barangay Management</h1>
          <p className="text-gray-500">Oversight for the 25 Barangays of Talibon.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
             Consolidated Reports
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {MOCK_BARANGAYS.map(brgy => (
           <div key={brgy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:border-gov-300 transition-colors">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="bg-gov-100 p-2 rounded-lg text-gov-700">
                       <Building2 size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">{brgy.name}</h3>
                 </div>
                 {brgy.status === 'Active' ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-orange-500"/>}
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Punong Barangay</span>
                    <span className="font-medium text-gray-900">{brgy.captain}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Population</span>
                    <span className="font-medium text-gray-900">{brgy.population.toLocaleString()}</span>
                 </div>
                 <div className="pt-4 border-t border-gray-100">
                    <button className="w-full py-2 bg-gray-50 text-gov-600 font-medium text-sm rounded hover:bg-gov-50 transition-colors flex items-center justify-center gap-2">
                       View Profile <ChevronRight size={14}/>
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. DIRECTORY
// ----------------------------------------------------------------------
export const DirectoryModule: React.FC = () => {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Municipal Directory</h1>
          <p className="text-gray-500">Internal communication lines and email addresses.</p>
        </div>
        <div className="relative w-64">
           <input type="text" placeholder="Search employee..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-500 focus:outline-none" />
           <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
             <tr>
               <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name / Position</th>
               <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
               <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contact Info</th>
               <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_CONTACTS.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.position}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{contact.department}</td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {contact.phone}</span>
                      <span className="flex items-center gap-2 text-blue-600 underline"><Users size={14} className="text-gray-400"/> {contact.email}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-gov-600 hover:bg-gov-50 px-3 py-1.5 rounded text-sm font-medium transition-colors">
                     Message
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

// ----------------------------------------------------------------------
// 4. CALENDAR
// ----------------------------------------------------------------------
export const CalendarModule: React.FC = () => {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Calendar</h1>
          <p className="text-gray-500">Schedule of municipal activities and deadlines.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-gray-100 rounded text-sm font-medium text-gray-600">Month</button>
           <button className="px-3 py-1.5 bg-white border rounded text-sm font-medium text-gray-600">Week</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
             {MOCK_EVENTS.map(evt => (
               <div key={evt.id} className="flex bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center justify-center w-16 bg-blue-50 rounded-lg text-blue-700 mr-4 shrink-0">
                     <span className="text-xs font-bold uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                     <span className="text-2xl font-bold">{new Date(evt.date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">{evt.title}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${evt.type === 'Public' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                           {evt.type}
                        </span>
                     </div>
                     <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Clock size={14}/> {evt.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={14}/> {evt.location}</span>
                     </div>
                     <p className="text-xs text-gray-400 mt-2">Organized by {evt.organizer}</p>
                  </div>
               </div>
             ))}
         </div>

         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-500 mt-1 shrink-0" />
                  <div>
                     <p className="text-sm font-medium text-gray-800">Q4 Budget Hearing Submission</p>
                     <p className="text-xs text-gray-500">Oct 31, 2023</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-orange-500 mt-1 shrink-0" />
                  <div>
                     <p className="text-sm font-medium text-gray-800">Dept. Performance Review</p>
                     <p className="text-xs text-gray-500">Nov 03, 2023</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
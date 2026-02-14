
import { InternalDocument, DocumentStatus, DocType, Department, Role, User, Application, ApplicationStatus, ChatThread, Message, Voucher, VoucherType, VoucherStage, JobLevel } from './types';

// ENTERPRISE MOCK USERS
export const MOCK_USERS: User[] = [
  // EXECUTIVES
  { id: 'u_mayor', name: 'Hon. Jan-Jan Reyes', email: 'mayor@talibon.gov.ph', department: Department.MAYORS_OFFICE, jobLevel: JobLevel.EXECUTIVE, role: Role.MAYOR },
  { id: 'u_vm', name: 'Hon. Vice Mayor', email: 'vm@talibon.gov.ph', department: Department.VICE_MAYORS_OFFICE, jobLevel: JobLevel.EXECUTIVE, role: Role.VICE_MAYOR },

  // DEPT HEADS
  { id: 'u_mpdc', name: 'Arch. Planas', email: 'mpdc@talibon.gov.ph', department: Department.MPDC, jobLevel: JobLevel.DEPT_HEAD, role: Role.MPDC_OFFICER },
  { id: 'u_budget', name: 'Mrs. Kuripot', email: 'budget@talibon.gov.ph', department: Department.BUDGET, jobLevel: JobLevel.DEPT_HEAD, role: Role.BUDGET_OFFICER },
  { id: 'u_acct', name: 'Mr. Tuos', email: 'acct@talibon.gov.ph', department: Department.ACCOUNTING, jobLevel: JobLevel.DEPT_HEAD, role: Role.ACCOUNTANT },
  { id: 'u_treasurer', name: 'Mrs. Yaman', email: 'treasury@talibon.gov.ph', department: Department.TREASURY, jobLevel: JobLevel.DEPT_HEAD, role: Role.TREASURER },
  { id: 'u_eng', name: 'Engr. Build', email: 'eng@talibon.gov.ph', department: Department.ENGINEERING, jobLevel: JobLevel.DEPT_HEAD, role: Role.ENGINEERING },
  
  // OFFICERS & STAFF
  { id: 'u_clerk', name: 'Maria Santos', email: 'clerk.mayor@talibon.gov.ph', department: Department.MAYORS_OFFICE, jobLevel: JobLevel.CLERK, role: Role.ADMIN_CLERK },
  { id: 'u_eval', name: 'Engr. Jun Rico', email: 'eval.eng@talibon.gov.ph', department: Department.ENGINEERING, jobLevel: JobLevel.OFFICER, role: Role.EVALUATOR },
  { id: 'u_records', name: 'Pedro Penduko', email: 'records@talibon.gov.ph', department: Department.RECORDS, jobLevel: JobLevel.OFFICER, role: Role.RECORDS_OFFICER },
  
  // ADMIN
  { id: 'u_admin', name: 'IT Admin', email: 'it@talibon.gov.ph', department: Department.ADMIN, jobLevel: JobLevel.ADMIN, role: Role.ADMIN },
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v-1',
    refNumber: 'DV-2023-10-001',
    payee: 'ABC Construction Corp',
    particulars: 'Partial payment for Public Market Renovation (30%)',
    amount: 1500000,
    type: VoucherType.DV,
    dateCreated: '2023-10-20',
    currentStage: VoucherStage.MAYOR_APPROVAL,
    status: 'Pending',
    history: [
      { stage: VoucherStage.PREPARATION, date: '2023-10-20 09:00', actor: 'Engr. Jun Rico', action: 'Signed' },
      { stage: VoucherStage.BUDGET_REVIEW, date: '2023-10-21 14:00', actor: 'Mrs. Kuripot', action: 'Signed', notes: 'Fund source: 20% Dev Fund' },
      { stage: VoucherStage.ACCOUNTING_AUDIT, date: '2023-10-22 10:30', actor: 'Mr. Tuos', action: 'Signed' }
    ]
  },
  {
    id: 'v-2',
    refNumber: 'PR-2023-10-045',
    payee: 'Talibon Office Supplies',
    particulars: 'Q4 Office Supplies for Sangguniang Bayan',
    amount: 25000,
    type: VoucherType.PR,
    dateCreated: '2023-10-25',
    currentStage: VoucherStage.BUDGET_REVIEW,
    status: 'Pending',
    history: [
      { stage: VoucherStage.PREPARATION, date: '2023-10-25 08:30', actor: 'SB Staff', action: 'Signed' }
    ]
  },
  {
    id: 'v-3',
    refNumber: 'PAY-2023-10-15',
    payee: 'LGU Employees (Regular)',
    particulars: 'Salary for Oct 1-15, 2023',
    amount: 4200000,
    type: VoucherType.PAYROLL,
    dateCreated: '2023-10-12',
    currentStage: VoucherStage.RELEASED,
    status: 'Approved',
    history: [
       { stage: VoucherStage.PREPARATION, date: '2023-10-12', actor: 'HR', action: 'Signed' },
       { stage: VoucherStage.TREASURY_CHECK, date: '2023-10-14', actor: 'Treasurer', action: 'Signed' }
    ]
  }
];

export const MOCK_INTERNAL_DOCS: InternalDocument[] = [
  {
    id: 'doc-101',
    trackingId: 'COMM-IN-2023-0089',
    title: 'Letter Request: Brgy. San Agustin Fiesta Support',
    type: DocType.LETTER_IN,
    originatingDept: Department.MAYORS_OFFICE,
    currentHolderId: 'u_mayor',
    status: DocumentStatus.FOR_APPROVAL,
    priority: 'Routine',
    dateCreated: '2023-10-27T08:00:00Z',
    lastUpdated: '2023-10-27T08:00:00Z',
    attachments: ['letter_san_agustin.pdf'],
    routingHistory: [
      { id: 'step-1', fromDept: Department.RECEIVING, toUser: 'Maria Santos', timestamp: '2023-10-27T08:00:00Z', status: DocumentStatus.RECEIVED, remarks: 'Encoded and routed to Mayor.' }
    ]
  },
  {
    id: 'doc-102',
    trackingId: 'PROJ-2023-012',
    title: 'Road Widening Plan - Brgy. San Jose',
    type: DocType.PROJECT_PROPOSAL,
    originatingDept: Department.ENGINEERING,
    currentHolderId: 'u_mpdc',
    status: DocumentStatus.UNDER_REVIEW,
    priority: 'Urgent',
    dateCreated: '2023-10-25T10:00:00Z',
    lastUpdated: '2023-10-26T14:30:00Z',
    attachments: ['blueprint_sj_v2.dwg', 'cost_estimates.xlsx'],
    routingHistory: [
      { id: 'step-1', fromDept: Department.ENGINEERING, toUser: 'Engr. Jun Rico', timestamp: '2023-10-25T10:00:00Z', status: DocumentStatus.RECEIVED },
      { id: 'step-2', fromDept: Department.ENGINEERING, toUser: 'Arch. Planas', timestamp: '2023-10-26T14:30:00Z', status: DocumentStatus.ROUTED, remarks: 'For PDC Endorsement.' }
    ]
  },
  {
    id: 'doc-103',
    trackingId: 'RES-SB-2023-55',
    title: 'Resolution Adopting 2024 Annual Investment Plan',
    type: DocType.RESOLUTION,
    originatingDept: Department.SB_SECRETARIAT,
    currentHolderId: 'u_mayor',
    status: DocumentStatus.FOR_APPROVAL,
    priority: 'Highly Urgent',
    dateCreated: '2023-10-20T09:00:00Z',
    lastUpdated: '2023-10-27T11:00:00Z',
    attachments: ['aip_2024_final.pdf'],
    routingHistory: [
      { id: 'step-1', fromDept: Department.SB_SECRETARIAT, toUser: 'SB Sec', timestamp: '2023-10-20T09:00:00Z', status: DocumentStatus.RECEIVED },
      { id: 'step-2', fromDept: Department.SB_SECRETARIAT, toUser: 'Hon. Jan-Jan Reyes', timestamp: '2023-10-27T11:00:00Z', status: DocumentStatus.FOR_APPROVAL, remarks: 'Transmitted for LCE Signature.' }
    ]
  }
];

export const APP_TYPES = ['Business Permit (New)', 'Business Permit (Renewal)', 'Building Permit', 'Occupancy Permit', 'Zoning Clearance'];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    referenceNumber: 'BP-2023-0001',
    type: 'Business Permit (New)',
    businessName: 'Coastal Brew Coffee',
    applicantName: 'Juan Dela Cruz',
    submissionDate: '2023-10-25',
    status: ApplicationStatus.SUBMITTED,
    currentDepartment: Department.BPLO,
    documents: [
      { id: 'doc-1', name: 'Barangay Clearance.pdf', type: 'application/pdf', size: '1.2 MB', dateUploaded: '2023-10-25' }
    ],
    logs: [
      { id: 'log-1', action: 'Application Submitted', actor: 'Juan Dela Cruz', timestamp: '2023-10-25 09:00', notes: 'Initial submission' }
    ]
  }
];

export const MOCK_CHATS: ChatThread[] = [
  {
    id: 'chat-1',
    participantName: 'Arch. Planas (MPDC)',
    participantRole: 'Planning Officer',
    lastMessage: 'The AIP needs the Mayors signature today.',
    lastMessageTime: '10:30 AM',
    status: 'online',
    unreadCount: 2
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'chat-1': [
    { id: 'm-1', senderId: 'u_mpdc', content: 'Good morning, Mayor. The AIP is ready.', timestamp: '10:25 AM', isRead: true, type: 'text' },
    { id: 'm-2', senderId: 'me', content: 'Noted, forward it to my dashboard.', timestamp: '10:27 AM', isRead: true, type: 'text' }
  ]
};

export const MOCK_PROJECTS = [
  { id: 1, name: 'Road Maintenance - Brgy San Jose', location: 'San Jose', department: 'Engineering', budget: 2500000, progress: 45, status: 'Ongoing' },
  { id: 2, name: 'Public Market Expansion', location: 'Poblacion', department: 'Engineering', budget: 15000000, progress: 100, status: 'Completed' }
];

export const MOCK_EVENTS = [
  { id: 1, title: 'Municipal Budget Hearing', date: '2023-11-05', time: '09:00 AM', location: 'Session Hall', type: 'Internal', organizer: 'Treasury' }
];

export const MOCK_CONTACTS = [
  { id: 1, name: 'Engr. Jun Rico', position: 'Technical Evaluator', department: 'Engineering', phone: '0917-123-4567', email: 'eval.eng@talibon.gov.ph' }
];

export const MOCK_BARANGAYS = [
  { id: 1, name: 'Poblacion', captain: 'Hon. Jose Rizal', population: 5200, status: 'Active' }
];

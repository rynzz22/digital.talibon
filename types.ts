
// OLD ROLE ENUM DEPRECATED IN FAVOR OF JOB_LEVEL + DEPARTMENT COMBINATION
// Keeping for backward compatibility with older components if needed, but primary logic moves to JobLevel
export enum Role {
  MAYOR = 'MAYOR',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  HEAD = 'HEAD',
  // CITIZEN Role removed for Internal System
  // Legacy mappings
  CLERK = 'CLERK',
  MPDC_OFFICER = 'MPDC_OFFICER',
  BUDGET_OFFICER = 'BUDGET_OFFICER',
  ACCOUNTANT = 'ACCOUNTANT',
  TREASURER = 'TREASURER', 
  ENGINEERING = 'ENGINEERING',
  EVALUATOR = 'EVALUATOR',
  DEPT_HEAD = 'DEPT_HEAD',
  ADMIN_CLERK = 'ADMIN_CLERK',
  RECORDS_OFFICER = 'RECORDS_OFFICER',
  RELEASE_OFFICER = 'RELEASE_OFFICER',
  VICE_MAYOR = 'VICE_MAYOR',
  SB_MEMBER = 'SB_MEMBER'
}

export enum JobLevel {
  EXECUTIVE = 'EXECUTIVE', // Mayor, Vice Mayor
  LEGISLATIVE = 'LEGISLATIVE', // SB Members
  DEPT_HEAD = 'DEPT_HEAD', // Department Heads
  DIVISION_CHIEF = 'DIVISION_CHIEF',
  OFFICER = 'OFFICER', // Analysts, Officers
  CLERK = 'CLERK', // Staff, Encoders
  ADMIN = 'ADMIN' // IT Super Admin
}

export enum Department {
  MAYORS_OFFICE = "Mayor's Office",
  VICE_MAYORS_OFFICE = "Vice Mayor's Office",
  SB_SECRETARIAT = "Sangguniang Bayan",
  MPDC = "MPDC (Planning)",
  TREASURY = "Treasury Office",
  ACCOUNTING = "Accounting Office",
  BUDGET = "Budget Office",
  ENGINEERING = "Engineering Office",
  MENRO = "MENRO",
  MSWDO = "MSWDO",
  MAO = "Agriculture (MAO)",
  RECORDS = "Records Office",
  ADMIN = "IT / Admin",
  BPLO = "BPLO", // Legacy support
  HR = "HR",
  ASSESSOR = "Assessor",
  RECEIVING = "Receiving"
}

export enum DocumentStatus {
  RECEIVED = 'Received',
  ROUTED = 'Routed', 
  UNDER_REVIEW = 'Under Review', 
  ACTION_TAKEN = 'Acted Upon', 
  FOR_APPROVAL = 'For Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  RETURNED = 'Returned',
  ARCHIVED = 'Archived'
}

export enum VoucherType {
  ORS = 'Obligation Request',
  DV = 'Disbursement Voucher',
  PR = 'Purchase Request',
  PAYROLL = 'Payroll'
}

export enum VoucherStage {
  PREPARATION = 'Preparation',
  BUDGET_REVIEW = 'Budget Review',
  ACCOUNTING_AUDIT = 'Accounting Audit',
  MAYOR_APPROVAL = 'Mayor Approval',
  TREASURY_CHECK = 'Treasury Release',
  RELEASED = 'Released'
}

export interface Voucher {
  id: string;
  refNumber: string;
  payee: string;
  particulars: string;
  amount: number;
  type: VoucherType;
  dateCreated: string;
  currentStage: VoucherStage;
  status: 'Pending' | 'Approved' | 'Returned' | 'Hold';
  history: {
    stage: VoucherStage;
    date: string;
    actor: string;
    action: 'Signed' | 'Returned' | 'Received';
    notes?: string;
  }[];
}

export type CommunicationDoc = InternalDocument;

export enum ApplicationStatus {
  SUBMITTED = 'Submitted',
  FOR_VERIFICATION = 'For Verification',
  FOR_INSPECTION = 'For Inspection',
  FOR_ASSESSMENT = 'For Assessment',
  FOR_PAYMENT = 'For Payment',
  PAYMENT_VERIFIED = 'Payment Verified',
  FOR_APPROVAL = 'For Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  RETURNED = 'Returned',
  RELEASED = 'Released'
}

export enum DocType {
  MEMO = 'Memorandum',
  LETTER_IN = 'Incoming Letter',
  LETTER_OUT = 'Outgoing Letter',
  ENDORSEMENT = 'Endorsement',
  PERMIT = 'Permit Application',
  RESOLUTION = 'Resolution',
  ORDINANCE = 'Ordinance',
  PAYROLL = 'Payroll/Voucher',
  CONTRACT = 'Contract/MOA',
  PROJECT_PROPOSAL = 'Project Proposal'
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  dateUploaded: string;
}

export interface Application {
  id: string;
  referenceNumber: string;
  type: string;
  businessName?: string;
  applicantName: string;
  submissionDate: string;
  status: ApplicationStatus;
  currentDepartment: Department;
  assessedAmount?: number;
  paymentStatus?: 'Paid' | 'Unpaid';
  documents: DocumentAttachment[];
  logs: any[];
}

export interface RoutingStep {
  id: string;
  fromDept: Department;
  toUser: string;
  timestamp: string;
  status: DocumentStatus;
  remarks?: string;
}

export interface AttachmentMeta {
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
}

export interface InternalDocument {
  id: string;
  trackingId: string;
  title: string;
  type: DocType;
  originatingDept: Department;
  currentHolderId: string; // User ID
  status: DocumentStatus;
  priority: 'Routine' | 'Urgent' | 'Highly Urgent';
  dateCreated: string;
  lastUpdated: string;
  attachments: AttachmentMeta[]; // Updated to object array
  routingHistory: RoutingStep[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role; // Keeping for legacy component compatibility
  
  // Enterprise Fields
  department: Department;
  jobLevel: JobLevel;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'document' | 'image';
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'online' | 'busy' | 'offline';
  unreadCount: number;
}

// SEARCH TYPES
export type SearchCategory = 'Documents' | 'Vouchers' | 'Projects' | 'Navigation';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  url: string;
  metadata?: string; // e.g., "Urgent", "₱50k"
}

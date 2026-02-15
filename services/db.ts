import { supabase, isSupabaseConnected } from '../lib/supabase';
import { Application, ApplicationStatus, Department, Role, User, Message, InternalDocument, DocumentStatus, DocType, Voucher, VoucherStage, VoucherType } from '../types';
import { INITIAL_APPLICATIONS, MOCK_USERS, MOCK_INTERNAL_DOCS, MOCK_VOUCHERS } from '../constants';

// STATEFUL MOCK STORAGE (Persists during session)
let _mockDocs = [...MOCK_INTERNAL_DOCS];
let _mockVouchers = [...MOCK_VOUCHERS];
let _mockApps = [...INITIAL_APPLICATIONS];

const isConnected = () => {
  return isSupabaseConnected;
};

export const DB = {
  // ------------------------------------------------------------------
  // VOUCHERS (FINANCIAL)
  // ------------------------------------------------------------------
  async getVouchers(): Promise<Voucher[]> {
    if (!isConnected()) return new Promise(resolve => resolve([..._mockVouchers]));
    // Real DB implementation would go here
    return [];
  },

  async createVoucher(voucherData: Partial<Voucher>): Promise<Voucher> {
    const newVoucher: Voucher = {
      id: `v-${Date.now()}`,
      refNumber: voucherData.refNumber || `DV-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`,
      payee: voucherData.payee || 'Unknown Payee',
      particulars: voucherData.particulars || '',
      amount: voucherData.amount || 0,
      type: voucherData.type || VoucherType.DV,
      dateCreated: new Date().toISOString().split('T')[0],
      currentStage: VoucherStage.PREPARATION,
      status: 'Pending',
      history: [{
        stage: VoucherStage.PREPARATION,
        date: new Date().toISOString(),
        actor: 'System Encoder',
        action: 'Signed'
      }]
    };

    if (!isConnected()) {
      _mockVouchers.unshift(newVoucher);
      return newVoucher;
    }
    return newVoucher;
  },

  async advanceVoucherStage(id: string, actor: User, notes?: string): Promise<void> {
    if (!isConnected()) {
      const vIndex = _mockVouchers.findIndex(v => v.id === id);
      if (vIndex === -1) return;

      const voucher = _mockVouchers[vIndex];
      const stages = Object.values(VoucherStage);
      const currentIndex = stages.indexOf(voucher.currentStage);
      
      // Determine next stage
      let nextStage = voucher.currentStage;
      let newStatus: any = 'Pending';

      if (currentIndex < stages.length - 1) {
        nextStage = stages[currentIndex + 1];
      }
      
      if (nextStage === VoucherStage.RELEASED) {
        newStatus = 'Approved';
      }

      const updatedVoucher = {
        ...voucher,
        currentStage: nextStage,
        status: newStatus,
        history: [
          ...voucher.history,
          {
            stage: voucher.currentStage, // Recording completion of previous stage
            date: new Date().toISOString(),
            actor: actor.name,
            action: 'Signed' as const,
            notes
          }
        ]
      };

      _mockVouchers[vIndex] = updatedVoucher;
      return;
    }
  },

  // ------------------------------------------------------------------
  // INTERNAL DOCUMENTS & COMMUNICATIONS
  // ------------------------------------------------------------------
  async uploadDocumentFile(file: File): Promise<{ path: string; url: string } | null> {
    if (!isConnected()) {
        console.log(`[MOCK STORAGE] Uploading ${file.name}`);
        return { path: `mock/${file.name}`, url: URL.createObjectURL(file) };
    }
    // ... Real implementation skipped for brevity as requested to keep functional without DB
    return null;
  },

  async createInternalDocument(
    doc: Omit<InternalDocument, 'id' | 'attachments' | 'routingHistory' | 'dateCreated' | 'lastUpdated'>, 
    fileData?: { name: string, url: string, path: string }
  ): Promise<InternalDocument | null> {
    
    const newDocId = `doc-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newDoc: InternalDocument = {
        ...doc,
        id: newDocId,
        dateCreated: timestamp,
        lastUpdated: timestamp,
        attachments: fileData ? [fileData.name] : [],
        routingHistory: [{
            id: `step-${Date.now()}`,
            fromDept: doc.originatingDept,
            toUser: doc.currentHolderId,
            timestamp: timestamp,
            status: DocumentStatus.RECEIVED,
            remarks: 'Initial Entry'
        }]
    };

    if (!isConnected()) {
        _mockDocs.unshift(newDoc);
        return newDoc;
    }
    return newDoc;
  },

  async updateDocumentStatus(docId: string, status: DocumentStatus, nextHolderId: string, remarks: string, actorDept: Department): Promise<void> {
    if (!isConnected()) {
      const idx = _mockDocs.findIndex(d => d.id === docId);
      if (idx === -1) return;

      const prevDoc = _mockDocs[idx];
      const updatedDoc = {
        ...prevDoc,
        status: status,
        currentHolderId: nextHolderId,
        lastUpdated: new Date().toISOString(),
        routingHistory: [
          ...prevDoc.routingHistory,
          {
            id: `step-${Date.now()}`,
            fromDept: actorDept,
            toUser: nextHolderId,
            timestamp: new Date().toISOString(),
            status: status,
            remarks: remarks
          }
        ]
      };
      _mockDocs[idx] = updatedDoc;
    }
  },

  async getInternalDocuments(): Promise<InternalDocument[]> {
    if (!isConnected()) return new Promise(resolve => resolve([..._mockDocs]));
    return [];
  },

  // ------------------------------------------------------------------
  // APPLICATIONS
  // ------------------------------------------------------------------
  async getApplications(): Promise<Application[]> {
    if (!isConnected()) return new Promise(resolve => resolve([..._mockApps]));
    return [];
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, dept: Department, notes: string, actorName: string): Promise<void> {
    if (!isConnected()) {
        const idx = _mockApps.findIndex(a => a.id === id);
        if (idx === -1) return;
        
        _mockApps[idx] = {
            ..._mockApps[idx],
            status,
            currentDepartment: dept,
            logs: [
                ..._mockApps[idx].logs,
                {
                    id: `log-${Date.now()}`,
                    action: `Status Updated: ${status}`,
                    actor: actorName,
                    notes: notes,
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }
  },

  async submitApplication(app: Application): Promise<void> {
    if (!isConnected()) {
        _mockApps.push(app);
        return;
    }
  },

  // ------------------------------------------------------------------
  // USERS
  // ------------------------------------------------------------------
  async getUserById(id: string): Promise<User | undefined> {
    if (!isConnected()) return MOCK_USERS.find(u => u.id === id);
    return undefined;
  },

  async sendMessage(msg: Message, chatId: string): Promise<void> {
    console.log('Message sent:', msg);
  }
};
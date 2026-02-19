
import { InternalDocument, DocType, Department, DocumentStatus } from '../types';
import { DB } from './db'; 

// Models
export interface CreateDocumentPayload {
  title: string;
  type: DocType;
  originatingDept: Department;
  priority: 'Routine' | 'Urgent' | 'Highly Urgent';
  recipient?: string;
}

export const CommunicationsService = {
  
  getAllDocuments: async (filter?: string): Promise<InternalDocument[]> => {
    return await DB.getInternalDocuments();
  },

  getDocumentById: async (id: string): Promise<InternalDocument | null> => {
    const docs = await DB.getInternalDocuments();
    return docs.find(d => d.id === id) || null;
  },

  createDocument: async (payload: CreateDocumentPayload): Promise<InternalDocument> => {
    const newDoc = await DB.createInternalDocument({
        trackingId: `COMM-${Date.now().toString().slice(-6)}`,
        title: payload.title,
        type: payload.type,
        originatingDept: payload.originatingDept,
        currentHolderId: 'system', // Initially held by system until routed
        status: DocumentStatus.RECEIVED,
        priority: payload.priority
    });
    return newDoc as InternalDocument;
  },

  updateStatus: async (id: string, status: DocumentStatus, remarks: string): Promise<void> => {
     // Handled via DB.updateDocumentStatus in UI components currently
  }
};

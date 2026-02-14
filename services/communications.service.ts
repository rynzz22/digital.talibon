
import apiClient from '../lib/axios';
import { InternalDocument, DocType, Department, DocumentStatus } from '../types';
import { DB } from './db'; // Importing DB only to simulate the backend response

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
    // SIMULATION: In real app -> await apiClient.get('/documents', { params: { filter } });
    return DB.getInternalDocuments();
  },

  getDocumentById: async (id: string): Promise<InternalDocument | null> => {
    // SIMULATION: await apiClient.get(`/documents/${id}`);
    const docs = await DB.getInternalDocuments();
    return docs.find(d => d.id === id) || null;
  },

  createDocument: async (payload: CreateDocumentPayload): Promise<InternalDocument> => {
    // SIMULATION: await apiClient.post('/documents', payload);
    const newDoc = await DB.createInternalDocument({
        trackingId: `COMM-${Date.now().toString().slice(-6)}`,
        title: payload.title,
        type: payload.type,
        originatingDept: payload.originatingDept,
        currentHolderId: 'system',
        status: DocumentStatus.RECEIVED,
        priority: payload.priority
    });
    return newDoc as InternalDocument;
  },

  updateStatus: async (id: string, status: DocumentStatus, remarks: string): Promise<void> => {
    // SIMULATION: await apiClient.patch(`/documents/${id}/status`, { status, remarks });
    // Mock update handled by DB service in this demo
  }
};

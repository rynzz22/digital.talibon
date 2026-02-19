
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { InternalDocument, DocumentStatus, DocType, Voucher, VoucherStage, VoucherType, User, Message, ChatThread, JobLevel, Department, AttachmentMeta } from '../types';
import { MOCK_USERS, MOCK_INTERNAL_DOCS, MOCK_VOUCHERS } from '../constants';

const isConnected = () => isSupabaseConnected;

export const DB = {
  // ------------------------------------------------------------------
  // USERS & PROFILES
  // ------------------------------------------------------------------
  async getAllUsers(): Promise<User[]> {
    if (!isConnected()) return MOCK_USERS;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true);
      
    if (error) { console.error("Fetch Users Error:", error); return []; }

    return data.map((p: any) => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        department: p.department,
        jobLevel: p.job_level,
        role: 'STAFF' as any, // Legacy compat
        avatar: p.avatar_url
    }));
  },

  async getUserById(id: string): Promise<User | undefined> {
    if (!isConnected()) return MOCK_USERS.find(u => u.id === id);
    
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) {
        return {
            id: data.id,
            name: data.full_name,
            email: data.email,
            department: data.department,
            jobLevel: data.job_level,
            role: 'STAFF' as any,
            avatar: data.avatar_url
        };
    }
    return undefined;
  },

  // ------------------------------------------------------------------
  // VOUCHERS (FINANCIAL)
  // ------------------------------------------------------------------
  async getVouchers(): Promise<Voucher[]> {
    if (!isConnected()) return MOCK_VOUCHERS;

    const { data, error } = await supabase
        .from('vouchers')
        .select(`
            *,
            voucher_history (
                stage,
                created_at,
                action,
                notes,
                profiles (full_name)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching vouchers:", error);
        return [];
    }

    return data.map((v: any) => ({
        id: v.id,
        refNumber: v.ref_number,
        payee: v.payee,
        particulars: v.particulars,
        amount: v.amount,
        type: v.type,
        dateCreated: new Date(v.created_at).toISOString().split('T')[0],
        currentStage: v.current_stage,
        status: v.status,
        history: (v.voucher_history || []).map((h: any) => ({
            stage: h.stage,
            date: h.created_at,
            actor: h.profiles?.full_name || 'System',
            action: h.action,
            notes: h.notes
        }))
    }));
  },

  async createVoucher(voucherData: Partial<Voucher>, creatorId: string): Promise<Voucher | null> {
    if (!isConnected()) {
         const v = { ...MOCK_VOUCHERS[0], ...voucherData, id: `v-${Date.now()}` } as Voucher;
         MOCK_VOUCHERS.unshift(v);
         return v;
    }

    // 1. Insert Voucher
    const { data: voucher, error } = await supabase
        .from('vouchers')
        .insert({
            ref_number: voucherData.refNumber || `REF-${Date.now()}`,
            payee: voucherData.payee,
            particulars: voucherData.particulars,
            amount: voucherData.amount,
            type: voucherData.type,
            current_stage: VoucherStage.PREPARATION,
            status: 'Pending',
            prepared_by: creatorId
        })
        .select()
        .single();

    if (error) { console.error("Create Voucher Error", error); throw error; }

    // 2. Insert Initial History
    await supabase.from('voucher_history').insert({
        voucher_id: voucher.id,
        stage: VoucherStage.PREPARATION,
        action: 'Created',
        notes: 'Initial Entry',
        actor_id: creatorId
    });

    return voucher;
  },

  async advanceVoucherStage(id: string, actor: User, notes?: string): Promise<void> {
    if (!isConnected()) return;

    // Get current voucher to determine next stage
    const { data: voucher } = await supabase.from('vouchers').select('current_stage').eq('id', id).single();
    if (!voucher) return;

    const stages = Object.values(VoucherStage);
    const currentIndex = stages.indexOf(voucher.current_stage);
    let nextStage = voucher.current_stage;
    let newStatus = 'Pending';

    // Logic: Move to next stage
    if (currentIndex < stages.length - 1) {
        nextStage = stages[currentIndex + 1];
    }
    
    // Logic: Final Stage
    if (nextStage === VoucherStage.RELEASED) {
        newStatus = 'Approved';
    }

    // Update Voucher
    const { error } = await supabase
        .from('vouchers')
        .update({ 
            current_stage: nextStage, 
            status: newStatus 
        })
        .eq('id', id);

    if (!error) {
        // Add History Log
        await supabase.from('voucher_history').insert({
            voucher_id: id,
            stage: nextStage,
            actor_id: actor.id,
            action: 'Approved & Signed',
            notes: notes
        });
    }
  },

  // ------------------------------------------------------------------
  // DOCUMENTS
  // ------------------------------------------------------------------
  async getInternalDocuments(): Promise<InternalDocument[]> {
    if (!isConnected()) return MOCK_INTERNAL_DOCS;

    const { data, error } = await supabase
        .from('documents')
        .select(`
            *,
            document_routing (
                id,
                from_dept,
                status,
                remarks,
                created_at,
                profiles: to_user_id (full_name) 
            )
        `)
        .order('updated_at', { ascending: false });

    if (error) { console.error("Fetch Docs Error", error); return []; }

    return data.map((d: any) => ({
        id: d.id,
        trackingId: d.tracking_id,
        title: d.title,
        type: d.type,
        originatingDept: d.originating_dept,
        currentHolderId: d.current_holder_id || 'system',
        status: d.status,
        priority: d.priority,
        dateCreated: d.created_at,
        lastUpdated: d.updated_at,
        attachments: Array.isArray(d.attachments) ? d.attachments : [],
        routingHistory: (d.document_routing || []).map((r: any) => ({
            id: r.id,
            fromDept: r.from_dept,
            toUser: r.profiles?.full_name || 'System',
            timestamp: r.created_at,
            status: r.status,
            remarks: r.remarks
        }))
    }));
  },

  async createInternalDocument(
    doc: Partial<InternalDocument>, 
    attachments: AttachmentMeta[] = []
  ): Promise<InternalDocument | null> {
    
    if (!isConnected()) return MOCK_INTERNAL_DOCS[0];

    // 1. Insert Document
    const { data: newDoc, error } = await supabase
        .from('documents')
        .insert({
            tracking_id: doc.trackingId,
            title: doc.title,
            type: doc.type,
            originating_dept: doc.originatingDept,
            current_holder_id: doc.currentHolderId === 'system' ? null : doc.currentHolderId,
            status: doc.status,
            priority: doc.priority,
            attachments: attachments 
        })
        .select()
        .single();

    if (error) { console.error("Doc Create Error", error); throw error; }

    // 2. Insert Initial Routing
    await supabase.from('document_routing').insert({
        document_id: newDoc.id,
        from_dept: doc.originatingDept,
        to_user_id: doc.currentHolderId === 'system' ? null : doc.currentHolderId,
        status: DocumentStatus.RECEIVED,
        remarks: 'Document initialized in system'
    });

    return newDoc;
  },

  async updateDocumentStatus(docId: string, status: DocumentStatus, nextHolderId: string, remarks: string, actorDept: Department): Promise<void> {
    if (!isConnected()) return;

    // 1. Update Main Doc Status & Holder
    const { error } = await supabase
        .from('documents')
        .update({
            status: status,
            current_holder_id: nextHolderId,
            updated_at: new Date().toISOString()
        })
        .eq('id', docId);

    if (error) { console.error("Update Doc Status Error", error); return; }

    // 2. Add Routing Log
    await supabase.from('document_routing').insert({
        document_id: docId,
        from_dept: actorDept,
        to_user_id: nextHolderId,
        status: status,
        remarks: remarks
    });
  },

  async uploadDocumentFile(file: File): Promise<AttachmentMeta | null> {
    if (!isConnected()) {
        return { 
            name: file.name, 
            url: URL.createObjectURL(file), 
            path: file.name,
            type: file.type,
            size: file.size
        };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload error", uploadError);
        return null;
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    
    return { 
        name: file.name,
        path: filePath, 
        url: data.publicUrl,
        type: file.type,
        size: file.size
    };
  },

  // ------------------------------------------------------------------
  // MESSENGER (REALTIME)
  // ------------------------------------------------------------------
  async getMessages(currentUserId: string, otherUserId: string): Promise<Message[]> {
    if (!isConnected()) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) { console.error("Get Messages Error", error); return []; }

    return data.map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: m.is_read,
      type: m.message_type
    }));
  },

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<void> {
    if (!isConnected()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content: content,
        message_type: 'text',
        is_read: false
      });
      
    if (error) console.error("Send Message Error", error);
  },

  // ------------------------------------------------------------------
  // PROJECTS & CALENDAR
  // ------------------------------------------------------------------
  async getProjects(): Promise<any[]> {
    if(!isConnected()) return [];
    const { data } = await supabase.from('projects').select('*').order('id', {ascending: false});
    return data || [];
  },

  async createProject(project: any): Promise<void> {
    if(!isConnected()) return;
    const { error } = await supabase.from('projects').insert(project);
    if(error) console.error("Create Project Error", error);
  },

  async getCalendarEvents(): Promise<any[]> {
    if(!isConnected()) return [];
    const { data } = await supabase.from('calendar_events').select('*').order('start_time', {ascending: true});
    return data || [];
  },

  async createCalendarEvent(event: any): Promise<void> {
    if(!isConnected()) return;
    const { error } = await supabase.from('calendar_events').insert(event);
    if(error) console.error("Create Event Error", error);
  }
};

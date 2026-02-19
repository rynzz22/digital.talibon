
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Message } from '../types';
import { DB } from '../services/db';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  MessageSquare,
  FileIcon, 
  ImageIcon,
  X
} from '../components/Icons'; 

interface ChatPortalProps {
  currentUser: User;
}

const ChatPortal: React.FC<ChatPortalProps> = ({ currentUser }) => {
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchContacts = async () => {
        const allUsers = await DB.getAllUsers();
        setContacts(allUsers.filter(u => u.id !== currentUser.id));
    };
    fetchContacts();
  }, [currentUser.id]);

  useEffect(() => {
     if (location.state && (location.state as any).contactId) {
         setActiveContactId((location.state as any).contactId);
         if (window.innerWidth < 768) setIsSidebarOpen(false);
         window.history.replaceState({}, document.title);
     }
  }, [location.state]);

  useEffect(() => {
    if (!activeContactId) return;
    const fetchMsgs = async () => {
        const data = await DB.getMessages(currentUser.id, activeContactId);
        setMessages(data);
    };
    fetchMsgs();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
         const newMsg = payload.new;
         if (
            (newMsg.sender_id === currentUser.id && newMsg.recipient_id === activeContactId) ||
            (newMsg.sender_id === activeContactId && newMsg.recipient_id === currentUser.id)
         ) {
            setMessages((prev) => [...prev, {
                id: newMsg.id,
                senderId: newMsg.sender_id,
                content: newMsg.content,
                timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: newMsg.is_read,
                type: newMsg.message_type
            }]);
         }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeContactId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;
    const tempText = inputText;
    setInputText(''); 
    await DB.sendMessage(currentUser.id, activeContactId, tempText);
  };

  const activeContact = contacts.find(c => c.id === activeContactId);
  const filteredContacts = useMemo(() => {
      return contacts.filter(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [contacts, searchQuery]);

  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-50 overflow-hidden relative border-t border-slate-100">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-full md:w-80 lg:w-96' : 'w-0 md:w-20'} bg-white border-r border-slate-100 flex flex-col transition-all duration-300 absolute md:relative h-full z-20`}>
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
           <div className="flex justify-between items-center mb-6">
              <h2 className={`font-black text-slate-900 uppercase tracking-tighter transition-all ${isSidebarOpen ? 'text-xl opacity-100' : 'text-[0px] opacity-0'}`}>GovChat</h2>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400"><MoreVertical size={20} /></button>
           </div>
           {isSidebarOpen && (
               <div className="relative animate-in fade-in duration-500">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Colleagues..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-gov-500/10 transition-all placeholder:text-slate-300" 
                  />
                  <Search size={16} className="absolute left-4 top-3.5 text-slate-300" />
               </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {filteredContacts.map(contact => (
             <div 
               key={contact.id} 
               onClick={() => {
                 setActiveContactId(contact.id);
                 if (window.innerWidth < 768) setIsSidebarOpen(false);
               }}
               className={`p-5 flex gap-4 cursor-pointer transition-all border-l-4 ${activeContactId === contact.id ? 'bg-gov-50 border-gov-600' : 'border-transparent hover:bg-slate-50'}`}
             >
                <div className="relative shrink-0">
                   <div className="h-12 w-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 font-black border-2 border-white shadow-sm overflow-hidden text-lg italic">
                      {contact.avatar ? <img src={contact.avatar} className="h-full w-full object-cover" alt="avatar"/> : contact.name.charAt(0)}
                   </div>
                   <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-4 border-white bg-emerald-500`}></div>
                </div>
                {isSidebarOpen && (
                    <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
                       <h3 className={`text-sm font-black truncate leading-none mb-1.5 ${activeContactId === contact.id ? 'text-gov-900' : 'text-slate-700'}`}>{contact.name}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{contact.department}</p>
                    </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
        {activeContact ? (
           <>
             {/* Header */}
             <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                   <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400"><Search size={20}/></button>
                   <div className="h-10 w-10 rounded-xl bg-gov-100 text-gov-700 font-black flex items-center justify-center italic text-sm">
                      {activeContact.avatar ? <img src={activeContact.avatar} className="h-full w-full object-cover" alt="avatar"/> : activeContact.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-black text-slate-900 leading-none italic">{activeContact.name}</h3>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Ops
                      </p>
                   </div>
                </div>
                <div className="flex gap-1">
                   <button className="p-2.5 text-slate-400 hover:text-gov-600 hover:bg-gov-50 rounded-xl transition-all"><Phone size={20}/></button>
                   <button className="p-2.5 text-slate-400 hover:text-gov-600 hover:bg-gov-50 rounded-xl transition-all"><Video size={20}/></button>
                </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fcfdfe] custom-scrollbar">
                 {messages.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                        <MessageSquare size={64} className="mx-auto mb-4 text-slate-200"/>
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Initialising Secured Channel</p>
                    </div>
                 ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`px-5 py-3.5 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed ${
                                        isMe 
                                        ? 'bg-gov-600 text-white rounded-br-none' 
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-black uppercase mt-2 px-1 tracking-tighter">
                                        {msg.timestamp} • {isMe ? 'Delivered' : 'Received'}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                 )}
                 <div ref={messagesEndRef} />
             </div>

             {/* Input */}
             <div className="p-6 bg-white border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                    <div className="flex gap-1">
                        <button type="button" className="p-3 text-slate-400 hover:text-gov-600 hover:bg-slate-50 rounded-2xl transition-all"><Paperclip size={20} /></button>
                        <button type="button" className="p-3 text-slate-400 hover:text-gov-600 hover:bg-slate-50 rounded-2xl transition-all"><ImageIcon size={20} /></button>
                    </div>
                    <div className="flex-1 relative">
                        <input 
                           type="text" 
                           value={inputText}
                           onChange={(e) => setInputText(e.target.value)}
                           placeholder="Transmit message..." 
                           className="w-full border border-slate-200 rounded-[1.5rem] px-6 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-gov-500/10 focus:border-gov-500 bg-slate-50/50 transition-all"
                        />
                    </div>
                    <button type="submit" disabled={!inputText.trim()} className="p-4 bg-gov-600 text-white rounded-2xl hover:bg-gov-700 transition-all shadow-xl shadow-gov-200 disabled:opacity-50 active:scale-95">
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-[9px] text-slate-300 font-black uppercase text-center mt-4 tracking-[0.3em]">Talibon Govt Secure Communications Protocol 1.0.4</p>
             </div>
           </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-[#fcfdfe]">
               <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl shadow-slate-100 flex items-center justify-center mb-6 border border-slate-50">
                  <MessageSquare size={40} className="text-slate-100" />
               </div>
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Select Ops Channel</h3>
               <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase">End-to-End Encryption Enabled</p>
           </div>
        )}
      </div>

    </div>
  );
};

export default ChatPortal;

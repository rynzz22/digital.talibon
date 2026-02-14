import React, { useState, useRef, useEffect } from 'react';
import { User, ChatThread, Message } from '../types';
import { MOCK_CHATS, MOCK_MESSAGES } from '../constants';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  CheckCircle,
  FileIcon,
  ImageIcon,
  MessageSquare
} from 'lucide-react'; // Using direct lucide-react here as icons are specific

interface ChatPortalProps {
  currentUser: User;
}

const ChatPortal: React.FC<ChatPortalProps> = ({ currentUser }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  // Mock State for Messages (in a real app, this would come from Supabase)
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [chats, setChats] = useState<ChatThread[]>(MOCK_CHATS);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, activeChatId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: `new-${Date.now()}`,
      senderId: 'me', // Represents current user
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    // Update chat list snippet
    setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
            return { ...c, lastMessage: inputText, lastMessageTime: 'Now' };
        }
        return c;
    }));

    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-100 p-4 gap-4 max-w-7xl mx-auto">
      
      {/* Sidebar: Chat List */}
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">GovChat</h2>
              <button className="bg-gov-100 p-2 rounded-full text-gov-600 hover:bg-gov-200">
                  <MoreVertical size={20} />
              </button>
           </div>
           <div className="relative">
              <input type="text" placeholder="Search colleagues..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gov-400 bg-gray-50" />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
           {chats.map(chat => (
             <div 
               key={chat.id} 
               onClick={() => setActiveChatId(chat.id)}
               className={`p-4 flex gap-3 cursor-pointer transition-colors border-l-4 ${activeChatId === chat.id ? 'bg-blue-50 border-gov-500' : 'border-transparent hover:bg-gray-50'}`}
             >
                <div className="relative">
                   <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm">
                      {chat.participantName.charAt(0)}
                   </div>
                   <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                       chat.status === 'online' ? 'bg-green-500' : 
                       chat.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                   }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-gov-900' : 'text-gray-800'}`}>{chat.participantName}</h3>
                      <span className="text-xs text-gray-400 shrink-0">{chat.lastMessageTime}</span>
                   </div>
                   <p className="text-xs text-gray-500 mb-1">{chat.participantRole}</p>
                   <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {chat.lastMessage}
                   </p>
                </div>
                {chat.unreadCount > 0 && (
                   <div className="flex items-center">
                       <span className="h-5 w-5 rounded-full bg-gov-600 text-white text-[10px] font-bold flex items-center justify-center">
                           {chat.unreadCount}
                       </span>
                   </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {activeChat ? (
           <>
             {/* Chat Header */}
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-gov-100 text-gov-700 font-bold flex items-center justify-center">
                      {activeChat.participantName.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900">{activeChat.participantName}</h3>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                         <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> 
                         {activeChat.status === 'online' ? 'Active Now' : 'Offline'}
                      </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:text-gov-600 hover:bg-gov-50 rounded-full transition-colors"><Phone size={20}/></button>
                   <button className="p-2 text-gray-400 hover:text-gov-600 hover:bg-gov-50 rounded-full transition-colors"><Video size={20}/></button>
                </div>
             </div>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
                 {currentMessages.map((msg) => {
                     const isMe = msg.senderId === 'me';
                     return (
                         <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                 <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                                     isMe 
                                     ? 'bg-gov-600 text-white rounded-br-none' 
                                     : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                 }`}>
                                     {msg.type === 'document' && (
                                         <div className={`flex items-center gap-3 p-2 rounded mb-2 ${isMe ? 'bg-gov-700/50' : 'bg-gray-100'}`}>
                                             <FileIcon size={16} />
                                             <span className="italic underline cursor-pointer">Document_Attachment.pdf</span>
                                         </div>
                                     )}
                                     {msg.content}
                                 </div>
                                 <span className="text-[10px] text-gray-400 mt-1 px-1">
                                     {msg.timestamp}
                                 </span>
                             </div>
                         </div>
                     )
                 })}
                 <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <button type="button" className="p-2 text-gray-400 hover:text-gov-600 hover:bg-gray-100 rounded-full transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <button type="button" className="p-2 text-gray-400 hover:text-gov-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ImageIcon size={20} />
                    </button>
                    <input 
                       type="text" 
                       value={inputText}
                       onChange={(e) => setInputText(e.target.value)}
                       placeholder="Type your message..." 
                       className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gov-500 focus:ring-2 focus:ring-gov-100 bg-gray-50"
                    />
                    <button type="submit" className="p-3 bg-gov-600 text-white rounded-full hover:bg-gov-700 transition-colors shadow-sm">
                        <Send size={18} />
                    </button>
                </form>
                <div className="text-center mt-2">
                   <p className="text-[10px] text-gray-300">GovChat Secured • End-to-End Encrypted • Audit Log Enabled</p>
                </div>
             </div>
           </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} />
               </div>
               <h3 className="text-lg font-bold text-gray-600">Select a Conversation</h3>
               <p className="text-sm">Choose a colleague from the sidebar to start chatting.</p>
           </div>
        )}
      </div>

    </div>
  );
};

export default ChatPortal;
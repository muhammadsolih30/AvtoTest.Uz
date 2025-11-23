
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { saveMessage, getConversation, getAdminId, getUsers, markAsRead } from '../services/db';
import { ChatMessage, Role } from '../types';
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { t } = useUI();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamically get Admin ID (in case user changed password and ID is static but we want to be safe)
  const adminId = getAdminId();
  const users = getUsers();
  const admin = users.find(u => u.role === Role.ADMIN);

  // Mark messages as read on mount
  useEffect(() => {
    if (user) {
      markAsRead(user.id, adminId);
    }
  }, [user, adminId]);

  const refreshMessages = () => {
    if (user) {
       const msgs = getConversation(user.id, adminId);
       setMessages(msgs);
    }
  };

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, [user, adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: adminId,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    saveMessage(msg);
    setInputText('');
    refreshMessages();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
         <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 overflow-hidden">
                {admin?.avatar ? (
                   <img src={admin.avatar} className="w-full h-full object-cover" alt="Admin" />
                ) : (
                   <UserIcon size={20} />
                )}
             </div>
             <div>
                <h1 className="font-bold text-slate-800 dark:text-white leading-tight">{admin?.name || 'Admin'}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
         {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
               {t('chat_no_msgs')}
            </div>
         ) : (
            messages.map(m => {
               const isMe = m.senderId === user?.id;
               return (
                 <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-tl-none'}`}>
                       <p className="text-sm">{m.text}</p>
                       <div className="flex items-center justify-end gap-1 mt-1">
                           <p className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                       </div>
                    </div>
                 </div>
               );
            })
         )}
         <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
         <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
            placeholder={t('chat_type_msg')}
         />
         <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
         >
            <Send size={20} />
         </button>
      </div>
    </div>
  );
};

export default Chat;

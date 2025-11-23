
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminId, getConversation, saveMessage, getUsers, markAsRead } from '../../services/db';
import { ChatMessage, User } from '../../types';
import { useUI } from '../../context/UIContext';
import { ArrowLeft, Send, User as UserIcon } from 'lucide-react';

const AdminChat: React.FC = () => {
  const { userId } = useParams<{userId: string}>();
  const navigate = useNavigate();
  const { t } = useUI();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const adminId = getAdminId();

  useEffect(() => {
    if (userId) {
       const users = getUsers();
       const found = users.find(u => u.id === userId);
       if (found) setTargetUser(found);
       
       // Mark messages as read immediately upon opening
       markAsRead(adminId, userId);
    }
  }, [userId, adminId]);

  const refreshMessages = () => {
    if (userId) {
       // Force a refresh from DB
       const msgs = getConversation(adminId, userId);
       setMessages(msgs);
    }
  };

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 2000); // Faster polling for smoother chat
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !userId) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: adminId,
      receiverId: userId,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    saveMessage(msg);
    setInputText('');
    refreshMessages();
  };

  if (!targetUser) return <div className="p-10 text-center dark:text-white">Foydalanuvchi topilmadi. U o'chirilgan bo'lishi mumkin.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
         <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                {targetUser.avatar ? (
                   <img src={targetUser.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                   <UserIcon size={20} />
                )}
             </div>
             <div>
                <h1 className="font-bold text-slate-800 dark:text-white leading-tight">{targetUser.name}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Foydalanuvchi</p>
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
               const isMe = m.senderId === adminId;
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

export default AdminChat;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatUsers, getAdminId, getConversation, getUnreadCount, deleteConversation, deleteUser } from '../../services/db';
import { User } from '../../types';
import { useUI } from '../../context/UIContext';
import { ArrowLeft, User as UserIcon, MessageCircle, Trash2, UserMinus } from 'lucide-react';
import { VirtualScroll } from '../../components/VirtualScroll';
import ConfirmModal from '../../components/ConfirmModal';

const AdminMessages: React.FC = () => {
  const { t } = useUI();
  const navigate = useNavigate();
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const adminId = getAdminId();

  // Modal State
  const [confirmState, setConfirmState] = useState<{
    type: 'chat' | 'user';
    id: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    setChatUsers(getChatUsers(adminId));
    
    const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
        const fresh = getChatUsers(adminId);
        if(fresh.length !== chatUsers.length) setChatUsers(fresh); 
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const getLastMessage = (userId: string) => {
    const msgs = getConversation(adminId, userId);
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };

  const handleDeleteChatClick = (e: React.MouseEvent, userId: string, name: string) => {
    e.stopPropagation();
    setConfirmState({ type: 'chat', id: userId, name });
  };

  const handleDeleteUserClick = (e: React.MouseEvent, userId: string, name: string) => {
    e.stopPropagation();
    setConfirmState({ type: 'user', id: userId, name });
  };

  const handleConfirm = () => {
    if (!confirmState) return;

    if (confirmState.type === 'chat') {
        deleteConversation(adminId, confirmState.id);
        setChatUsers(prev => prev.filter(u => u.id !== confirmState.id));
    } else {
        deleteUser(confirmState.id);
        setChatUsers(prev => prev.filter(u => u.id !== confirmState.id));
    }
    setConfirmState(null);
  };

  const renderRow = (user: User) => {
    const lastMsg = getLastMessage(user.id);
    const unreadCount = getUnreadCount(adminId, user.id);

    return (
        <div 
            onClick={() => navigate(`/admin/chat/${user.id}`)}
            className="p-4 h-full hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer flex items-center gap-4 transition-colors group border-b border-slate-100 dark:border-slate-700"
        >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden relative flex-shrink-0">
                {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                    <UserIcon size={24} />
                )}
                {unreadCount > 0 && (
                    <span className="absolute bottom-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex justify-between mb-1">
                    <h3 className={`font-bold text-slate-800 dark:text-white truncate ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : ''}`}>{user.name}</h3>
                    {lastMsg && <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{new Date(lastMsg.timestamp).toLocaleDateString()}</span>}
                </div>
                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {lastMsg ? (lastMsg.senderId === adminId ? `Siz: ${lastMsg.text}` : lastMsg.text) : 'Suhbatni boshlash...'}
                </p>
            </div>

            {/* Admin Actions */}
            <div className="flex gap-2 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => handleDeleteChatClick(e, user.id, user.name)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Suhbatni o'chirish"
                >
                    <Trash2 size={18} />
                </button>
                <button
                    onClick={(e) => handleDeleteUserClick(e, user.id, user.name)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Foydalanuvchini o'chirish"
                >
                    <UserMinus size={18} />
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col pb-4">
      <div className="flex items-center gap-4 mb-6 flex-shrink-0">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin_messages')}</h1>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        {chatUsers.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <MessageCircle size={32} className="opacity-50"/>
              <p>Xabarlar yo'q</p>
           </div>
        ) : (
           <VirtualScroll 
              items={chatUsers}
              height={600} 
              rowHeight={88} 
              renderRow={renderRow}
              className="h-full"
           />
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirm}
        title={confirmState?.type === 'chat' ? "Suhbatni o'chirish" : "Foydalanuvchini o'chirish"}
        message={
            confirmState?.type === 'chat' 
            ? `Siz ${confirmState?.name} bilan bo'lgan barcha yozishmalarni o'chirib tashlamoqchimisiz?`
            : `Siz ${confirmState?.name} foydalanuvchisini butunlay o'chirib tashlamoqchimisiz?`
        }
      />
    </div>
  );
};

export default AdminMessages;

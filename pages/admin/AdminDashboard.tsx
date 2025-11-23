
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, updateAdminPassword, getUsers, getActivityLogs, deleteUser, getUnreadCount, getAdminId, resetSystem } from '../../services/db';
import { FileText, Users, Activity, Key, PlusCircle, List, Eye, EyeOff, Wifi, Trash2, MessageSquare, Clock, Send, AlertTriangle } from 'lucide-react';
import { User, ActivityLog, Role } from '../../types';
import { useUI } from '../../context/UIContext';
import { VirtualScroll } from '../../components/VirtualScroll';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useUI();
  const [stats, setStats] = useState({ totalQuestions: 0, totalTestsTaken: 0, totalUsers: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showUserPasswords, setShowUserPasswords] = useState<Record<string, boolean>>({});
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Confirmation States
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isResetSystem, setIsResetSystem] = useState(false);

  const refreshData = () => {
    setStats(getStats());
    setUsers(getUsers());
    setActivityLogs(getActivityLogs().reverse().slice(0, 50)); 
    setUnreadTotal(getUnreadCount(getAdminId()));
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handlePasswordChange = () => {
    if (newPassword.length < 4) return alert("Parol juda qisqa");
    updateAdminPassword(newPassword);
    setShowPasswordModal(false);
    alert("Parol o'zgartirildi");
  };

  const toggleUserPassword = (userId: string) => {
    setShowUserPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleDeleteUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Prevent row click
    setDeleteUserId(userId);
  };

  const handleConfirmDeleteUser = () => {
    if (deleteUserId) {
      deleteUser(deleteUserId);
      setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      refreshData();
      setDeleteUserId(null);
    }
  };
  
  const handleSystemResetClick = () => {
    setIsResetSystem(true);
  };

  const handleConfirmSystemReset = () => {
     resetSystem('all');
     window.location.reload();
  };

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    const diff = new Date().getTime() - new Date(lastActive).getTime();
    return diff < 5 * 60 * 1000; 
  };

  const onlineUsers = users.filter(u => u.role !== Role.ADMIN && isOnline(u.lastActive));

  // Render Row for Virtual User List
  const renderUserRow = (u: User) => {
    const active = isOnline(u.lastActive);
    const isAdmin = u.role === Role.ADMIN;
    return (
      <div className="flex items-center p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 h-full transition-colors">
        <div className="w-1/3 px-2 flex items-center gap-3 overflow-hidden">
            {u.avatar ? (
              <img src={u.avatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
            ) : (
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                {u.name.charAt(0)}
              </div>
            )}
            <div className="truncate">
              <p className="font-medium text-slate-800 dark:text-white text-sm truncate flex items-center gap-1">
                {u.name} {isAdmin && <span className="text-orange-500 text-[10px] border border-orange-500 px-1 rounded">ADM</span>}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="w-1/4 px-2">
          <span className={`px-2 py-1 rounded text-[10px] font-bold ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {active ? t('status_online') : t('status_offline')}
          </span>
        </div>
        <div className="w-1/4 px-2 flex items-center gap-2">
          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] truncate max-w-[80px]">
            {showUserPasswords[u.id] ? u.password : '••••'}
          </span>
          <button onClick={() => toggleUserPassword(u.id)} className="text-slate-400 hover:text-slate-600">
            {showUserPasswords[u.id] ? <EyeOff size={12}/> : <Eye size={12}/>}
          </button>
        </div>
        <div className="w-1/6 px-2 flex justify-end gap-1">
            {!isAdmin && (
              <>
                  <button 
                  onClick={() => navigate(`/admin/chat/${u.id}`)}
                  className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Xabar"
                  >
                    <Send size={14} />
                  </button>
                  <button 
                  onClick={(e) => handleDeleteUserClick(e, u.id)} 
                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" 
                  title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
              </>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-600 dark:text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin_q_total')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalQuestions}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full text-green-600 dark:text-green-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin_tests_total')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalTestsTaken}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full text-purple-600 dark:text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin_users_total')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full text-teal-600 dark:text-teal-400">
            <Wifi size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin_online')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{onlineUsers.length}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/admin/questions/new')}
          className="p-6 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex flex-col items-center text-center gap-3"
        >
          <PlusCircle size={40} />
          <div>
            <h3 className="text-lg font-bold">{t('admin_add_q')}</h3>
            <p className="text-blue-100 text-sm">{t('admin_add_q_desc')}</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/questions')}
          className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
        >
          <List size={40} className="text-slate-400 dark:text-slate-500" />
          <div>
            <h3 className="text-lg font-bold">{t('admin_manage_q')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('admin_manage_q_desc')}</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/messages')}
          className="relative p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
        >
          <div className="relative">
            <MessageSquare size={40} className="text-slate-400 dark:text-slate-500" />
            {unreadTotal > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px]">
                {unreadTotal}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">{t('admin_messages')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Xabarlar qutisi</p>
          </div>
        </button>
      </div>

      {/* User List & Activity - Optimized with Virtual Scroll */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* All Users Virtual List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 z-10">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('admin_user_list')}</h3>
            {/* Header for Table */}
            <div className="flex text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 px-2">
               <div className="w-1/3">{t('name_label')}</div>
               <div className="w-1/4">{t('admin_status')}</div>
               <div className="w-1/4">{t('pass_label')}</div>
               <div className="w-1/6 text-right">Amallar</div>
            </div>
          </div>
          <div className="flex-1 relative">
             {users.length > 0 ? (
               <VirtualScroll 
                  items={users}
                  height={320}
                  rowHeight={60}
                  renderRow={renderUserRow}
                  className="h-full"
               />
             ) : (
               <div className="flex items-center justify-center h-full text-slate-400">Foydalanuvchilar yo'q</div>
             )}
          </div>
        </div>

        {/* Activity Log Table (Standard is fine for 50 items) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('admin_activity_log')}</h3>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-4">{t('name_label')}</th>
                  <th className="p-4"><Clock size={14} /> Kirish</th>
                  <th className="p-4">Davomiy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {activityLogs.map(log => {
                   const duration = Math.max(0, Math.round((new Date(log.lastSeen).getTime() - new Date(log.loginTime).getTime()) / 60000)); 
                   return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="p-4 font-medium text-slate-800 dark:text-white">{log.userName}</td>
                      <td className="p-4 text-xs">{new Date(log.loginTime).toLocaleTimeString()}</td>
                      <td className="p-4 text-xs font-mono">
                        {duration < 1 ? '< 1 min' : `${duration} min`}
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{t('admin_security')}</span>
            <button 
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-600"
            >
            <Key size={14} /> {t('admin_change_pass')}
            </button>
        </div>
        
        <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex justify-between items-center border border-red-100 dark:border-red-900/30">
            <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertTriangle size={16}/> Tizimni tozalash
            </span>
            <button 
            onClick={handleSystemResetClick}
            className="flex items-center gap-2 text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded"
            >
            <Trash2 size={14} /> Tozalash
            </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm dark:border dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Yangi Admin Parol</h3>
            <input 
              type="password" 
              className="w-full border dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded mb-4 text-slate-900 dark:text-white outline-none" 
              placeholder="Yangi parol" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400">Bekor qilish</button>
              <button onClick={handlePasswordChange} className="px-4 py-2 bg-blue-600 text-white rounded">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Foydalanuvchini o'chirish"
        message="Siz rostdan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz?"
      />

      {/* Reset System Modal */}
      <ConfirmModal
        isOpen={isResetSystem}
        onClose={() => setIsResetSystem(false)}
        onConfirm={handleConfirmSystemReset}
        title="Tizimni tozalash"
        message="DIQQAT! Tizimdagi barcha ma'lumotlar (foydalanuvchilar, natijalar, xabarlar) o'chiriladi. Davom etasizmi?"
      />
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useUI();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState(user?.password || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!name.trim() || !password.trim()) {
        setError(t('error_fill_all'));
        return;
    }

    if (password.length < 4) {
        setError(t('error_pass_len'));
        return;
    }

    updateUserProfile({
      ...user,
      name,
      password,
      avatar
    });
    setMsg(t('prof_success'));
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
       <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('prof_title')}</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 transition-colors">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-4xl font-bold">
                  {name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="text-center">
               <p className="text-sm text-slate-500 dark:text-slate-400">{t('prof_total_points')}</p>
               <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{user.totalPoints}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('name_label')}</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('pass_label')}</label>
              <input 
                type="text" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800 text-center">
              {error}
            </div>
          )}

          {msg && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-center font-medium">{msg}</div>}

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} /> {t('prof_save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
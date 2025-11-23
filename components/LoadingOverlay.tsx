
import React, { useEffect, useState } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-sm">
         <div className="mb-4 relative inline-block">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20"></div>
            <WifiOff size={48} className="text-red-500 relative z-10" />
         </div>
         <h2 className="text-xl font-bold mb-2">Internet aloqasi yo'q</h2>
         <p className="text-slate-400 mb-6">Iltimos, internetga ulanishni tekshiring. Aloqa tiklanishi bilan davom etishingiz mumkin.</p>
         <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> 
            <span>Ulanish kutilmoqda...</span>
         </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastNotifications: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {notifications.map((notif) => {
        let bg = 'bg-[#25352F] text-[#FAF7F2] border-[#3D5268]';
        let Icon = Info;
        let iconColor = 'text-[#B28A52]';

        if (notif.type === 'success') {
          bg = 'bg-[#FAF7F2] text-[#25352F] border-[#3F7654]';
          Icon = CheckCircle2;
          iconColor = 'text-[#3F7654]';
        } else if (notif.type === 'warning') {
          bg = 'bg-[#FAF7F2] text-[#25352F] border-[#B97932]';
          Icon = AlertTriangle;
          iconColor = 'text-[#B97932]';
        } else if (notif.type === 'error') {
          bg = 'bg-[#FAF7F2] text-[#25352F] border-[#A94A43]';
          Icon = AlertCircle;
          iconColor = 'text-[#A94A43]';
        }

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start space-x-2.5 p-3 rounded-lg border shadow-lg transition-all transform translate-y-0 ${bg}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs">
              <p className="font-medium leading-tight">{notif.message}</p>
              <span className="text-[10px] text-[#765C48] opacity-75">{notif.timestamp}</span>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-[#6F746F] hover:text-[#25352F] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

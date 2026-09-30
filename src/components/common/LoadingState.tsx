import React from 'react';
import { Loader2, Shield } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Authenticating clearance...',
  subMessage = 'Connecting to Secure Military Command Grid',
  fullscreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <Shield className="w-7 h-7 text-blue-500 absolute" />
      </div>
      <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">{message}</h4>
      {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-xs">{subMessage}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-slate-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

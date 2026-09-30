import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full tactical-glass rounded-3xl p-8 border border-rose-500/40 text-white shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Access Restricted · HTTP 403
        </span>

        <h1 className="text-xl font-bold mt-4 mb-2 text-white">
          Security Clearance Denied
        </h1>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Your current credentials with role <span className="font-mono text-amber-300 font-semibold">{user?.role || 'GUEST'}</span> do not possess operational authorization to access this sector.
        </p>

        <div className="flex justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

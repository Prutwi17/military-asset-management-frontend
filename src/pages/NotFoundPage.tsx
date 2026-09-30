import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full tactical-glass rounded-3xl p-8 border border-slate-700 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-4 text-blue-400">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Error 404 · Uncharted Coordinates
        </span>

        <h1 className="text-xl font-bold mt-4 mb-2">Tactical Sector Not Found</h1>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The tactical route or asset coordinates requested do not exist in the command registry.
        </p>

        <div className="flex justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Command Center
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

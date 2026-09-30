import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { MilitaryInsignia } from '../components/auth/MilitaryInsignia';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import loginBackground from '../assets/login-background.jpg';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, selectedRole, setSelectedRole, isAuthenticated } = useAuth();

  const roleParam = (searchParams.get('role') as Role) || selectedRole || 'BASE_COMMANDER';

  // Empty fields by default
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (roleParam) {
      setSelectedRole(roleParam);
    }
  }, [roleParam, setSelectedRole]);

  const getRoleTitle = (r: Role) => {
    switch (r) {
      case 'ADMIN':
        return 'Admin Login';
      case 'BASE_COMMANDER':
        return 'Commander Login';
      case 'LOGISTICS_OFFICER':
        return 'Logistics Login';
      default:
        return 'Terminal Login';
    }
  };

  const renderRoleBadge = (r: Role) => {
    switch (r) {
      case 'ADMIN':
        return (
          <div className="w-9 h-9 rounded-full bg-[#101e33] border border-amber-400/60 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 2L4 5V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V5L12 2Z"
                fill="#f59e0b"
                fillOpacity="0.2"
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <polygon
                points="12,7 13.5,10.5 17.5,11 14.5,13.5 15.5,17.5 12,15 8.5,17.5 9.5,13.5 6.5,11 10.5,10.5"
                fill="#fbbf24"
              />
            </svg>
          </div>
        );

      case 'BASE_COMMANDER':
        return (
          <div className="w-9 h-9 rounded-full bg-[#101e33] border border-amber-400/60 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <polygon points="12,3 13.5,6.5 17.5,7 14.5,9.5 15.5,13.5 12,11 8.5,13.5 9.5,9.5 6.5,7 10.5,6.5" fill="#fbbf24" />
              <path d="M7 14L12 18L17 14" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 18L12 22L17 18" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );

      case 'LOGISTICS_OFFICER':
        return (
          <div className="w-9 h-9 rounded-full bg-[#101e33] border border-amber-400/60 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <polygon points="12,3 21,7.5 12,12 3,7.5" fill="#fef08a" stroke="#fbbf24" strokeWidth="1" strokeLinejoin="round" />
              <polygon points="3,7.5 12,12 12,21 3,16.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" strokeLinejoin="round" />
              <polygon points="12,12 21,7.5 21,16.5 12,21" fill="#ca8a04" stroke="#78350f" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(username.trim(), password, rememberMe, roleParam);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* Subtle overlay preserving soldiers, mountain, and aircraft visibility while keeping text crisp */}
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />

      {/* Main Container matching Screen 1 lower login mockup */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center my-auto py-6 animate-in fade-in duration-300">
        {/* Top Military Emblem matching Screen 1 */}
        <div className="mb-6 text-center">
          <MilitaryInsignia size="md" withText={true} />
        </div>

        {/* Login Box matching Screen 1 */}
        <div className="w-full bg-[#0c1626]/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-cyan-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
          {/* Circular Gold Badge & Title at top */}
          <div className="flex flex-col items-center justify-center mb-5">
            {renderRoleBadge(roleParam)}
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide mt-2 text-center">
              {getRoleTitle(roleParam)}
            </h2>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold text-rose-400">FAIL:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form with exact white input boxes from Screen 1 */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            {/* Username Input */}
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="mil_username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="mil_password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                required
                className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-white">Remember Me</span>
              </label>
            </div>

            {/* Solid Vibrant Blue Login Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1b5df3] hover:bg-[#154ecc] active:bg-[#1140ad] disabled:opacity-70 text-white font-medium text-sm py-2.5 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isSubmitting ? 'Authenticating...' : 'Login'}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setForgotPasswordModalOpen(true)}
                className="text-xs text-slate-300 hover:text-white transition-colors focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Change Role Link at bottom of card */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
            <Link
              to="/select-role"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Role</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        title="Password Recovery Protocol"
        subtitle="Military Security Directive 802-A"
        footer={
          <Button variant="primary" size="sm" onClick={() => setForgotPasswordModalOpen(false)}>
            Acknowledged
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Due to top-secret clearance protocols, self-service automated password resets are restricted on this terminal.
          </p>
          <p>
            For password resets or credential reissuance, contact the Signal & Cyber Command Administrator at headquarters.
          </p>
        </div>
      </Modal>
    </div>
  );
};

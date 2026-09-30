import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'System Admin';
      case 'BASE_COMMANDER':
        return 'Commander';
      case 'LOGISTICS_OFFICER':
        return 'Logistics Officer';
      default:
        return 'Personnel';
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'role-admin' as const;
      case 'BASE_COMMANDER':
        return 'role-commander' as const;
      case 'LOGISTICS_OFFICER':
        return 'role-logistics' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar matching ui-reference.png */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search assets, personnel, requisitions..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none text-left"
          >
            {/* Avatar matching ui-reference military officer portrait or rank badge */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 text-amber-300 font-bold flex items-center justify-center text-xs shadow-inner border border-amber-400/40">
              {user?.rank ? user.rank.substring(0, 2).toUpperCase() : 'CO'}
            </div>

            <div className="hidden sm:block">
              <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                {user?.fullName || 'Command Officer'}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight flex items-center gap-1.5 mt-0.5">
                <span>{getRoleDisplayName(user?.role)}</span>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Menu Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  Operational Credentials
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {user?.fullName || 'Command Officer'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user?.role)} dot>
                    {getRoleDisplayName(user?.role)}
                  </Badge>
                </div>
              </div>

              <div className="px-4 py-2.5 text-xs text-slate-600 border-b border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Base:</span>
                  <span className="font-semibold text-slate-800">
                    {user?.base ? user.base.name : 'Central Command HQ'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security Clearance:</span>
                  <span className="font-semibold text-blue-600 uppercase">Level 4 Top Secret</span>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminate Session (Sign Out)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

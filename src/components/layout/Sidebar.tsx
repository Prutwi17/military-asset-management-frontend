import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  ShoppingBag,
  ArrowRightLeft,
  Users,
  Building2,
  ShieldCheck,
  ClipboardList,
  Wrench,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { MilitaryInsignia } from '../auth/MilitaryInsignia';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Assets', to: '/assets', icon: Shield },
    { name: 'Purchases', to: '/purchases', icon: ShoppingBag },
    { name: 'Transfers', to: '/transfers', icon: ArrowRightLeft },
    { name: 'Assignments & Ops', to: '/assignments', icon: Users },
    ...(user?.role === 'ADMIN' ? [{ name: 'Bases', to: '/bases', icon: Building2 }] : []),
    ...(user?.role === 'ADMIN' ? [{ name: 'Audit Trail', to: '/audit-logs', icon: ShieldCheck }] : []),
    ...(user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER'
      ? [{ name: 'Maintenance', to: '/maintenance', icon: Wrench }]
      : []),
    ...(user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER'
      ? [{ name: 'Reports', to: '/reports', icon: BarChart3 }]
      : []),
    ...(user?.role === 'ADMIN' ? [{ name: 'Settings', to: '/settings', icon: Settings }] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container matching ui-reference.png */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0d1424] text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Star Insignia */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/90">
          <div className="flex items-center gap-3">
            <MilitaryInsignia size="sm" lightText={false} />
            <div>
              <span className="font-bold text-xs tracking-[0.12em] text-white uppercase block leading-tight">
                Military Asset
              </span>
              <span className="text-[10px] tracking-[0.18em] font-semibold text-blue-400 uppercase block">
                Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Assigned Base Indicator */}
        <div className="p-4 border-t border-slate-800 bg-[#090e1a]">
          <div className="rounded-lg bg-slate-800/80 border border-slate-700/80 p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Assigned Post
            </div>
            <div className="text-xs font-semibold text-white mt-0.5 truncate">
              {user?.base ? user.base.name : 'Central Command HQ'}
            </div>
            <div className="text-[10px] text-blue-400 font-mono mt-0.5">
              Code: {user?.base ? user.base.code : 'GLOBAL-HQ'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

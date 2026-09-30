import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MilitaryInsignia } from '../components/auth/MilitaryInsignia';
import { RoleCard } from '../components/auth/RoleCard';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import loginBackground from '../assets/login-background.jpg';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedRole, setSelectedRole } = useAuth();

  const roles = [
    {
      role: 'ADMIN' as Role,
      title: 'Admin',
      icon: 'admin' as const,
    },
    {
      role: 'BASE_COMMANDER' as Role,
      title: 'Commander',
      icon: 'commander' as const,
    },
    {
      role: 'LOGISTICS_OFFICER' as Role,
      title: 'Logistics',
      icon: 'logistics' as const,
    },
  ];

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* Subtle overlay preserving soldiers, mountain, and aircraft visibility while keeping text crisp */}
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center my-auto py-6 animate-in fade-in duration-300">
        {/* Top Military Emblem matching Screen 1 */}
        <div className="mb-6 text-center">
          <MilitaryInsignia size="md" withText={true} />
        </div>

        {/* Role Selection Box matching Screen 1 */}
        <div className="w-full bg-[#0c1626]/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-cyan-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide mb-5 text-center">
            Select Your Role
          </h2>

          {/* 3 Role Cards Grid matching Screen 1 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-3.5">
            {roles.map((item) => (
              <RoleCard
                key={item.role}
                role={item.role}
                title={item.title}
                icon={item.icon}
                isSelected={selectedRole === item.role || item.role === 'BASE_COMMANDER'}
                onClick={() => handleSelectRole(item.role)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

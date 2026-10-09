import React from 'react';
import {
  BarChart3,
  Brain,
  Building2,
  Droplets,
  Layers,
  LineChart,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../types/profile';
import { ScreenId, UserRole } from '../types/water';
import { t } from '../utils/i18n';
import { UserAvatar } from './profile/UserAvatar';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  unreadCount?: number;
  userProfile?: UserProfile;
  currentLanguage?: LanguageCode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  userRole,
  onToggleRole,
  unreadCount = 2,
  userProfile,
  currentLanguage = 'en',
}) => {
  const navItems: Array<{ id: ScreenId; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'overview', label: t('navOverview', currentLanguage), icon: <Layers className="w-5 h-5" /> },
    { id: 'facilities', label: t('navFacilities', currentLanguage), icon: <Building2 className="w-5 h-5" /> },
    { id: 'water-budget', label: t('navBudget', currentLanguage), icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'forecasts', label: t('navForecasts', currentLanguage), icon: <TrendingUp className="w-5 h-5" /> },
    {
      id: 'ai-insights',
      label: t('navAiInsights', currentLanguage),
      icon: <Brain className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'reports', label: t('navReports', currentLanguage), icon: <LineChart className="w-5 h-5" /> },
    { id: 'settings', label: t('navSettings', currentLanguage), icon: <Settings className="w-5 h-5" /> },
    { id: 'profile', label: t('navProfile', currentLanguage), icon: <User className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 xl:w-72 bg-white dark:bg-[#0B1728] border-r border-[#DFE7EF] dark:border-[#1B2D45] flex flex-col justify-between shrink-0 select-none min-h-screen transition-colors">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#DFE7EF]/60 dark:border-[#1B2D45]/60">
          <div className="flex items-center gap-3">
            {/* Logo: Water droplet + neural nodes */}
            <div className="w-10 h-10 rounded-xl bg-[#0B3C5D] dark:bg-cyan-950 text-white flex items-center justify-center shadow-md relative overflow-hidden group border border-transparent dark:border-cyan-800">
              <svg className="w-6 h-6 text-[#00A6C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(0, 166, 199, 0.2)" stroke="#00A6C7" />
                <circle cx="12" cy="11" r="1.5" fill="#FFFFFF" />
                <circle cx="9" cy="15" r="1.5" fill="#FFFFFF" />
                <circle cx="15" cy="15" r="1.5" fill="#FFFFFF" />
                <line x1="12" y1="11" x2="9" y2="15" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1 1" />
                <line x1="12" y1="11" x2="15" y2="15" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1 1" />
                <line x1="9" y1="15" x2="15" y2="15" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1 1" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#0B3C5D] dark:text-slate-100 text-[17px] tracking-tight">AquaMind AI</span>
              </div>
              <span className="text-[10px] font-semibold text-[#00A6C7] tracking-wider uppercase">Scarcity Simulator</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#62748A] dark:text-slate-400 font-medium">Think Smarter. Save Every Drop.</p>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#E1F5FE] dark:bg-cyan-950/60 text-[#00677D] dark:text-cyan-300 font-semibold shadow-xs relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#00A6C7] before:rounded-r'
                    : 'text-[#62748A] dark:text-slate-400 hover:bg-[#F4F8FB] dark:hover:bg-slate-800/60 hover:text-[#172B4D] dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#00A6C7]' : 'text-[#62748A] dark:text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#D64545] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Community Status & User Profile Card */}
      <div className="p-4 space-y-3 border-t border-[#DFE7EF]/60 dark:border-[#1B2D45]/60 bg-[#FAFCFE] dark:bg-[#071220]/60">
        {/* User Profile Card (Clickable to open profile) */}
        <div
          onClick={() => onSelectScreen('profile')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            currentScreen === 'profile'
              ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-2 ring-cyan-500/20'
              : 'border-[#DFE7EF] dark:border-[#1B2D45] bg-white dark:bg-[#0D1929] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {userProfile ? (
                <UserAvatar
                  avatarUrl={userProfile.avatarUrl}
                  avatarType={userProfile.avatarType}
                  name={userProfile.displayName}
                  size="sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0B3C5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {userRole === 'admin' ? 'DA' : 'ER'}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#172B4D] dark:text-slate-100 truncate">
                  {userProfile?.displayName || (userRole === 'admin' ? 'David Adeleke' : 'Elena Rostova')}
                </span>
                <span className="text-[11px] text-[#62748A] dark:text-slate-400 flex items-center gap-1 truncate font-mono">
                  {userProfile ? `@${userProfile.username}` : (userRole === 'admin' ? 'Admin' : 'Viewer')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleRole();
              }}
              title={`Switch to ${userRole === 'admin' ? 'Viewer' : 'Admin'} Mode`}
              className="px-2 py-1 text-[11px] font-semibold rounded-md border border-[#DFE7EF] dark:border-slate-700 bg-[#F4F8FB] dark:bg-slate-800 hover:bg-[#E1F5FE] dark:hover:bg-slate-700 hover:text-[#00677D] text-[#62748A] dark:text-slate-300 transition-colors shrink-0"
            >
              Role
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

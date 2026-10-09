import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Languages,
  MapPin,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  User,
  X,
} from 'lucide-react';
import { LanguageCode, ThemeMode, UserProfile } from '../types/profile';
import { ScreenId, SocietyPreset, UserRole } from '../types/water';
import { t } from '../utils/i18n';
import { UserAvatar } from './profile/UserAvatar';

interface HeaderProps {
  currentScreen: ScreenId;
  userRole: UserRole;
  onOpenRecordModal: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  userProfile: UserProfile;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNavigate: (screen: ScreenId) => void;
  selectedSocietyId?: string;
  onSelectSociety?: (societyId: string) => void;
  societies?: SocietyPreset[];
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  userRole,
  onOpenRecordModal,
  onOpenNotifications,
  unreadCount = 2,
  onToggleMobileMenu,
  isMobileMenuOpen,
  userProfile,
  currentTheme,
  onSelectTheme,
  currentLanguage,
  onSelectLanguage,
  onNavigate,
  selectedSocietyId,
  onSelectSociety,
  societies = [],
}) => {
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeSociety = societies.find((s) => s.id === selectedSocietyId) || societies[0];
  const displayTitle = activeSociety?.name || 'Green Valley Cooperative Housing Society';

  // Quick toggle between Light and Dark
  const handleQuickThemeToggle = () => {
    if (currentTheme === 'light') {
      onSelectTheme('dark');
    } else if (currentTheme === 'dark') {
      onSelectTheme('system');
    } else {
      onSelectTheme('light');
    }
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0B1728]/95 backdrop-blur-md border-b border-[#DFE7EF] dark:border-[#1B2D45] sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-3 transition-colors">
      {/* Left: Mobile hamburger + Society / Community Selector */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* Community / Housing Society Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F8FB] dark:bg-[#071220] hover:bg-[#EBF3F9] dark:hover:bg-slate-800 border border-[#DFE7EF] dark:border-[#1B2D45] rounded-lg text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#00A6C7] shrink-0" />
            <span className="truncate max-w-[170px] sm:max-w-[270px]">{displayTitle}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {isCommunityDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 bg-white dark:bg-[#0D1929] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Select Housing Society Grid</span>
                <span className="text-[10px] text-cyan-500 font-semibold">{societies.length} Societies</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {societies.map((soc) => {
                  const isSelected = soc.id === selectedSocietyId;
                  return (
                    <button
                      key={soc.id}
                      onClick={() => {
                        if (onSelectSociety) onSelectSociety(soc.id);
                        setIsCommunityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        isSelected
                          ? 'text-[#00A6C7] font-semibold bg-cyan-50/50 dark:bg-cyan-950/30'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{soc.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#00A6C7] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {soc.description}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[#00677D] dark:text-cyan-400 font-medium">
                        <span>{soc.badge}</span>
                        <span>•</span>
                        <span>{soc.facilities.length} Facilities</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Cycle (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#F4F8FB] dark:bg-[#071220] rounded-lg text-xs text-slate-500 dark:text-slate-400 border border-[#DFE7EF]/60 dark:border-[#1B2D45]">
          <Calendar className="w-3.5 h-3.5 text-[#00A6C7]" />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Current Cycle: July 1 – July 31
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Prototype Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#F4F8FB] dark:bg-[#071220] rounded-lg border border-[#DFE7EF] dark:border-[#1B2D45] text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#00A6C7]" />
          <span className="font-semibold text-[11px] text-[#0B3C5D] dark:text-cyan-400">
            Simulator Prototype
          </span>
        </div>

        {/* FEATURE 1: Quick Theme Switcher Button */}
        <button
          onClick={handleQuickThemeToggle}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={`Current theme: ${currentTheme}. Click to cycle Light / Dark / Auto.`}
          aria-label="Toggle Theme"
        >
          {currentTheme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : currentTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Compass className="w-4 h-4 text-cyan-500" />
          )}
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="View Alerts & Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D64545] text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Primary Action Button: Record Reading */}
        <button
          onClick={onOpenRecordModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 text-[#00A6C7] dark:text-white" />
          <span className="whitespace-nowrap">{t('recordReading', currentLanguage)}</span>
        </button>

        {/* USER PROFILE AVATAR MENU (FEATURE 1 & FEATURE 2) */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#DFE7EF] dark:border-[#1B2D45] transition-colors"
            title="User Profile & Settings Menu"
            aria-label="User profile menu"
          >
            <UserAvatar
              avatarUrl={userProfile.avatarUrl}
              avatarType={userProfile.avatarType}
              name={userProfile.displayName}
              size="sm"
            />
            <span className="hidden xl:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
              {userProfile.displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0D1929] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 text-xs">
              {/* Profile Card Header in Dropdown */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <UserAvatar
                  avatarUrl={userProfile.avatarUrl}
                  avatarType={userProfile.avatarType}
                  name={userProfile.displayName}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">
                    {userProfile.displayName}
                  </div>
                  <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono truncate">
                    @{userProfile.username}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {userProfile.email}
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-cyan-500" />
                    <span>{t('navProfile', currentLanguage)}</span>
                  </div>
                  {userProfile.isPhoneVerified && (
                    <span className="text-[10px] text-emerald-500 font-bold">Verified</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{t('navSettings', currentLanguage)}</span>
                </button>
              </div>

              {/* FEATURE 1: Theme Switcher Row in Dropdown */}
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('theme', currentLanguage)}
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => onSelectTheme('light')}
                    className={`py-1 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white dark:bg-[#0B3C5D] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => onSelectTheme('dark')}
                    className={`py-1 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all ${
                      currentTheme === 'dark'
                        ? 'bg-white dark:bg-[#0B3C5D] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => onSelectTheme('system')}
                    className={`py-1 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all ${
                      currentTheme === 'system'
                        ? 'bg-white dark:bg-[#0B3C5D] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              {/* FEATURE 5: Language Switcher in Dropdown */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-cyan-500" />
                  <span>Language</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { code: 'en' as const, label: 'EN' },
                    { code: 'hi' as const, label: 'हिं' },
                    { code: 'mr' as const, label: 'मरा' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onSelectLanguage(l.code)}
                      className={`flex-1 py-1 text-center font-semibold rounded-lg text-[11px] transition-colors ${
                        currentLanguage === l.code
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

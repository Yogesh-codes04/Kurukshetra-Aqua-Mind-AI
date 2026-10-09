import React, { useState } from 'react';
import {
  Bell,
  Building,
  CheckCircle2,
  Clock,
  CloudRain,
  Compass,
  Database,
  DollarSign,
  Download,
  Droplets,
  FileText,
  Key,
  Languages,
  Layers,
  Lock,
  MapPin,
  Moon,
  Palette,
  Phone,
  Radio,
  RefreshCw,
  Save,
  Shield,
  Sliders,
  Sun,
  Upload,
  User,
  Users,
  Verified,
  Wifi,
} from 'lucide-react';
import { LanguageCode, ThemeMode } from '../types/profile';
import { CommunityProfile, UserRole } from '../types/water';

interface SettingsConfigProps {
  userRole: UserRole;
  communityProfile: CommunityProfile;
  onUpdateProfile: (updated: CommunityProfile) => void;
  currentTheme?: ThemeMode;
  onSelectTheme?: (theme: ThemeMode) => void;
  currentLanguage?: LanguageCode;
  onSelectLanguage?: (lang: LanguageCode) => void;
  onNavigateToProfile?: () => void;
}

export const SettingsConfig: React.FC<SettingsConfigProps> = ({
  userRole,
  communityProfile,
  onUpdateProfile,
  currentTheme = 'system',
  onSelectTheme = () => {},
  currentLanguage = 'en',
  onSelectLanguage = () => {},
  onNavigateToProfile = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<
    'theme' | 'user-profile' | 'profile' | 'resource' | 'units' | 'alerts' | 'roles' | 'telemetry' | 'supabase'
  >('theme');
  const [formData, setFormData] = useState<CommunityProfile>(communityProfile);
  const [hardCapEnabled, setHardCapEnabled] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<'liters' | 'kl' | 'm3' | 'gallons'>('liters');
  const [selectedCadence, setSelectedCadence] = useState('Monthly Cycle (1st – 31st Calendar Period)');
  const [criticalThreshold, setCriticalThreshold] = useState(100000);
  const [watchThreshold, setWatchThreshold] = useState(90000);
  const [nightLeakThreshold, setNightLeakThreshold] = useState(1000);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelSms, setChannelSms] = useState(true);
  const [dualAdminGuard, setDualAdminGuard] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    onUpdateProfile(formData);
    setToastMessage('System settings and hydrological constraints successfully updated.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDiscard = () => {
    setFormData(communityProfile);
    setToastMessage('Pending changes discarded.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3C5D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#00A6C7]/40 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#18A999]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero / Configuration Context Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold uppercase tracking-wider">
              System Node #09
            </span>
            <span className="text-xs text-[#62748A]">Firmware v4.8.2-Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tracking-tight">Settings & System Configuration</h1>
          <p className="text-sm text-[#62748A] mt-0.5">
            Configure community profiles, hydrological constraints, telemetry sensors, alert rules, and governance policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F4F8FB] hover:bg-[#EBF3F9] text-[#0B3C5D] text-xs font-semibold border border-[#DFE7EF] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Discard Changes</span>
          </button>
          {userRole === 'admin' ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0B3C5D] hover:bg-[#082C44] text-white text-xs font-bold shadow-xs transition-all active:scale-[0.99]"
            >
              <Save className="w-4 h-4 text-[#00A6C7]" />
              <span>Save Settings</span>
            </button>
          ) : (
            <span className="text-xs text-[#62748A] italic bg-[#F4F8FB] px-3 py-2 rounded-lg border border-[#DFE7EF]">
              Read-Only for Community Viewers
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left Tabs + Right Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sticky Left Navigation Rail (3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white p-3 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-1 sticky top-20">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#62748A] uppercase tracking-wider">
              Configuration Modules
            </div>

            {/* FEATURE 1: Theme & Appearance */}
            <button
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'theme'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-[#00A6C7]" />
                <span>Theme & Appearance</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#00A6C7]">{currentTheme}</span>
            </button>

            {/* FEATURE 2: User Profile Shortcut */}
            <button
              onClick={() => {
                if (onNavigateToProfile) onNavigateToProfile();
                else setActiveTab('user-profile');
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'user-profile'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <User className="w-4 h-4 text-[#00A6C7]" />
              <span>User Profile & ID</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <Building className="w-4 h-4 text-[#00A6C7]" />
              <span>Community Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('resource')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'resource'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-[#00A6C7]" />
                <span>Resource & Yield</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#E1F5FE] text-[#00677D] font-bold">100k L</span>
            </button>

            <button
              onClick={() => setActiveTab('units')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'units'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#00A6C7]" />
              <span>Units & Reporting</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'alerts'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#00A6C7]" />
                <span>Alert & Deficits</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#D64545]" />
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'roles'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#00A6C7]" />
              <span>Roles & Access</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-[#E1F5FE] text-[#00677D] shadow-xs'
                  : 'text-[#62748A] hover:bg-[#F4F8FB] hover:text-[#172B4D]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#00A6C7]" />
                <span>Telemetry & Sync</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#00A6C7] text-white font-bold">128/128</span>
            </button>

            {/* Compliance mini banner */}
            <div className="mt-4 p-3 bg-[#F4F8FB] rounded-lg border border-[#DFE7EF] space-y-1">
              <div className="flex items-center gap-1.5 text-[#00A6C7] text-xs font-bold">
                <Verified className="w-4 h-4" />
                <span>Maricopa Standard</span>
              </div>
              <p className="text-[11px] text-[#62748A] leading-tight">
                Hydrological compliance audited every 14 days. Current ledger: <strong className="text-[#172B4D]">Valid through Aug 2025</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Panes Container (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* FEATURE 1: THEME & APPEARANCE TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#0D1929] p-5 sm:p-6 rounded-xl border border-[#DFE7EF] dark:border-slate-800 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFE7EF]/60 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E1F5FE] dark:bg-cyan-950/60 text-[#00677D] dark:text-cyan-400 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-[#00A6C7]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0B3C5D] dark:text-slate-100">
                        Theme & Display Preferences
                      </h2>
                      <p className="text-xs text-[#62748A] dark:text-slate-400">
                        Select interface theme. Changes take effect immediately without reloading and persist across sessions.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold uppercase">
                    Active: {currentTheme}
                  </span>
                </div>

                {/* 3 Theme Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light */}
                  <div
                    onClick={() => onSelectTheme('light')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      currentTheme === 'light'
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-500/30 shadow-xs'
                        : 'border-[#DFE7EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#071220]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0B3C5D] dark:text-slate-100 flex items-center gap-1.5">
                          <Sun className="w-4 h-4 text-amber-500" />
                          Light Theme
                        </span>
                        {currentTheme === 'light' && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#62748A] dark:text-slate-400 leading-relaxed">
                        Crisp white main background, subtle light-gray card borders, dark charcoal text, and clean cyan accents.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#DFE7EF]/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                      <span>White Canvas</span>
                    </div>
                  </div>

                  {/* Dark */}
                  <div
                    onClick={() => onSelectTheme('dark')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      currentTheme === 'dark'
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-500/30 shadow-xs'
                        : 'border-[#DFE7EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#071220]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0B3C5D] dark:text-slate-100 flex items-center gap-1.5">
                          <Moon className="w-4 h-4 text-cyan-400" />
                          Dark Theme
                        </span>
                        {currentTheme === 'dark' && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#62748A] dark:text-slate-400 leading-relaxed">
                        Preserves the signature dark navy/black dashboard with glowing cyan highlights, high-contrast charts, and reduced eye strain.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#DFE7EF]/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                      <span className="w-3 h-3 rounded-full bg-[#071322] border border-cyan-800" />
                      <span>Dark Navy Canvas</span>
                    </div>
                  </div>

                  {/* System */}
                  <div
                    onClick={() => onSelectTheme('system')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      currentTheme === 'system'
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-500/30 shadow-xs'
                        : 'border-[#DFE7EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#071220]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0B3C5D] dark:text-slate-100 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-cyan-500" />
                          System Default
                        </span>
                        {currentTheme === 'system' && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#62748A] dark:text-slate-400 leading-relaxed">
                        Follows your operating system and browser preferences automatically via CSS media query detection.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#DFE7EF]/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-slate-900" />
                      <span>Automatic Sync</span>
                    </div>
                  </div>
                </div>

                {/* FEATURE 5: LANGUAGE PREFERENCES CARD IN SETTINGS */}
                <div className="pt-4 border-t border-[#DFE7EF]/60 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-[#00A6C7]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#0B3C5D] dark:text-slate-200">
                      Language & Localization
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { code: 'en' as const, title: 'English', desc: 'Standard Technical English' },
                      { code: 'hi' as const, title: 'हिंदी (Hindi)', desc: 'राष्ट्रीय भारतीय भाषा' },
                      { code: 'mr' as const, title: 'मराठी (Marathi)', desc: 'राज्य भाषा महाराष्ट्र' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => onSelectLanguage(l.code)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          currentLanguage === l.code
                            ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-900 dark:text-white font-bold ring-2 ring-cyan-500/20'
                            : 'border-[#DFE7EF] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[#172B4D] dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs">{l.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEATURE 2: USER PROFILE SHORTCUT TAB */}
          {activeTab === 'user-profile' && (
            <div className="bg-white dark:bg-[#0D1929] p-6 rounded-xl border border-[#DFE7EF] dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE7EF]/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F5FE] dark:bg-cyan-950/60 text-[#00677D] dark:text-cyan-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#00A6C7]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0B3C5D] dark:text-slate-100">
                      User Profile & Account
                    </h2>
                    <p className="text-xs text-[#62748A] dark:text-slate-400">
                      Manage administrator identity, avatars, contact verification, and personal preferences.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#62748A] dark:text-slate-400 leading-relaxed">
                AquaMind AI includes a comprehensive User Profile management page with photo uploads, camera snapshot support, phone OTP verification, and location preferences.
              </p>

              <button
                type="button"
                onClick={onNavigateToProfile}
                className="px-5 py-2.5 bg-[#0B3C5D] hover:bg-[#082C44] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Open Dedicated User Profile Page →</span>
              </button>
            </div>
          )}

          {/* TAB 1: COMMUNITY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Identity Header Card */}
              <div className="bg-white dark:bg-[#0D1929] p-5 sm:p-6 rounded-xl border border-[#DFE7EF] dark:border-slate-800 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFE7EF]/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E1F5FE] text-[#00677D] flex items-center justify-center">
                      <Building className="w-5 h-5 text-[#00A6C7]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0B3C5D]">Community Identity & Scope</h2>
                      <p className="text-xs text-[#62748A]">Geographic boundaries, municipal water authority registration, and zone metadata.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold flex items-center gap-1">
                    <Verified className="w-3.5 h-3.5" /> AZ-WTR-2024-8841
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider mb-1">
                      Community Legal Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={userRole !== 'admin'}
                      className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider mb-1">
                      Regulatory Jurisdiction Authority
                    </label>
                    <input
                      type="text"
                      value={formData.authority}
                      onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                      disabled={userRole !== 'admin'}
                      className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider mb-1">
                      Primary Hydrology Officer
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#62748A] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.officerName}
                        onChange={(e) => setFormData({ ...formData, officerName: e.target.value })}
                        disabled={userRole !== 'admin'}
                        className="w-full h-10 pl-9 pr-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider mb-1">
                      Emergency Operations Hotline
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#62748A] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        disabled={userRole !== 'admin'}
                        className="w-full h-10 pl-9 pr-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographics & Physical Scope Bento Card */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0B3C5D]">Hydrological Scale & Demographics</h3>
                    <p className="text-xs text-[#62748A]">Physical infrastructure and consumer profiles used to calibrate demand models.</p>
                  </div>
                  <span className="text-xs font-bold text-[#00A6C7] cursor-pointer hover:underline">
                    Recalculate Yield Basis ↻
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF]">
                    <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Residential Units</span>
                    <div className="my-1 text-xl font-bold text-[#0B3C5D] tabular-nums">{formData.units} Units</div>
                    <p className="text-[11px] text-[#62748A]">480 single household + 62 multi-tenant</p>
                  </div>

                  <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF]">
                    <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Estimated Population</span>
                    <div className="my-1 text-xl font-bold text-[#0B3C5D] tabular-nums">{formData.population} Capita</div>
                    <p className="text-[11px] text-[#62748A]">Calculated occupancy 3.39 res/unit</p>
                  </div>

                  <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF]">
                    <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Commercial Nodes</span>
                    <div className="my-1 text-xl font-bold text-[#0B3C5D] tabular-nums">{formData.commercialNodes} Nodes</div>
                    <p className="text-[11px] text-[#62748A]">Retail Plaza, 3 Cafes, 1 Co-working</p>
                  </div>

                  <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF]">
                    <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Irrigated Parkland</span>
                    <div className="my-1 text-xl font-bold text-[#0B3C5D] tabular-nums">{formData.parklandHectares} Ha</div>
                    <p className="text-[11px] text-[#62748A]">Drip + low-flow rotary coverage</p>
                  </div>
                </div>
              </div>

              {/* Spatial Cadastre & Pressure Zones Preview */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col md:flex-row gap-5 items-center">
                <div className="w-full md:w-1/3 rounded-xl overflow-hidden bg-[#F4F8FB] border border-[#DFE7EF] p-4 flex flex-col items-center justify-center text-center">
                  <MapPin className="w-10 h-10 text-[#00A6C7] mb-2" />
                  <span className="text-xs font-bold text-[#0B3C5D]">GIS Zone 09-North</span>
                  <span className="text-[11px] text-[#62748A]">Geo-polygon: Route 87 & Verde Wash</span>
                </div>
                <div className="w-full md:w-2/3 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#00A6C7] text-white font-bold text-[10px]">
                      Pressure Zones Dual-Active
                    </span>
                    <span className="text-[#62748A]">Hydrostatic PRV-A: 4.2 Bar • PRV-B: 3.8 Bar</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0B3C5D]">Spatial Cadastre & Pressure Zones</h4>
                  <p className="text-[#62748A] leading-relaxed">
                    Phase 1 through Phase 4 are partitioned across two independent hydrostatic pressure reduction zones. Updates
                    to boundary polygons require municipal hydrologist countersignature.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCE & YIELD */}
          {activeTab === 'resource' && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-5">
              <div className="pb-3 border-b border-[#DFE7EF]/60">
                <h2 className="text-lg font-bold text-[#0B3C5D]">Hydrological Yield & Capacity Constraints</h2>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Define statutory consumption limits, non-negotiable emergency floors, and dynamic weather multipliers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Daily Safe Cap */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B3C5D] uppercase">Licensed Daily Yield Cap</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#E1F5FE] text-[#00677D] font-bold">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.dailyYieldCap}
                      disabled={userRole !== 'admin'}
                      onChange={(e) => setFormData({ ...formData, dailyYieldCap: Number(e.target.value) })}
                      className="h-10 w-36 px-3 bg-white border border-[#DFE7EF] rounded-lg text-sm font-bold text-[#0B3C5D] tabular-nums"
                    />
                    <span className="text-xs text-[#62748A] font-semibold">Liters / Day</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-medium text-[#172B4D]">Enforce Hard Safe Ceiling</span>
                    <input
                      type="checkbox"
                      checked={hardCapEnabled}
                      disabled={userRole !== 'admin'}
                      onChange={(e) => setHardCapEnabled(e.target.checked)}
                      className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Statutory Floor */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B3C5D] uppercase">Emergency Reserve Floor</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B3C5D] text-white font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Rule 14-B
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 px-3 bg-[#E2E8F0] border border-[#CBD8E4] rounded-lg flex items-center text-sm font-bold text-[#0B3C5D] tabular-nums select-none">
                      10,000
                    </div>
                    <span className="text-xs text-[#62748A] font-semibold">Liters / Day (Locked)</span>
                  </div>
                  <div className="text-[11px] text-[#62748A] flex items-center gap-1">
                    <Verified className="w-3.5 h-3.5 text-[#00A6C7]" />
                    <span>Mandated by Maricopa Hydro-Codex 2024-C</span>
                  </div>
                </div>

                {/* Human Needs Baseline */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <span className="text-xs font-bold text-[#0B3C5D] uppercase block">Per Capita Minimum Human Needs</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#0B3C5D] tabular-nums">108</span>
                    <span className="text-xs text-[#62748A]">L / resident / day (WHO Standard)</span>
                  </div>
                  <p className="text-[11px] text-[#62748A]">
                    Aggregate non-curtailable domestic volume: <strong>198,720 L/day</strong>.
                  </p>
                </div>

                {/* Heat Advisory Factor */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <span className="text-xs font-bold text-[#0B3C5D] uppercase block">Summer Conservation Factor</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.05"
                      value={formData.heatAdvisoryMultiplier}
                      disabled={userRole !== 'admin'}
                      onChange={(e) => setFormData({ ...formData, heatAdvisoryMultiplier: Number(e.target.value) })}
                      className="h-10 w-24 px-3 bg-white border border-[#DFE7EF] rounded-lg text-sm font-bold text-[#0B3C5D] tabular-nums"
                    />
                    <span className="text-xs text-[#62748A] font-semibold">× Multiplier (Max 115,000 L)</span>
                  </div>
                  <p className="text-[11px] text-[#62748A]">
                    Applies automatically when local weather stations report &gt; 41°C for 48h.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNITS & REPORTING */}
          {activeTab === 'units' && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-5">
              <div className="pb-3 border-b border-[#DFE7EF]/60">
                <h2 className="text-lg font-bold text-[#0B3C5D]">Units & Reporting Preferences</h2>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Harmonize unit conversions, display standards, timezones, and billing cycle configurations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider mb-1.5">
                    Volumetric Display Unit
                  </label>
                  <div className="grid grid-cols-4 bg-[#F4F8FB] p-1 rounded-lg border border-[#DFE7EF] text-xs font-semibold">
                    <button
                      onClick={() => setSelectedUnit('liters')}
                      className={`py-1.5 rounded-md ${selectedUnit === 'liters' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'}`}
                    >
                      Liters (L)
                    </button>
                    <button
                      onClick={() => setSelectedUnit('kl')}
                      className={`py-1.5 rounded-md ${selectedUnit === 'kl' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'}`}
                    >
                      kL
                    </button>
                    <button
                      onClick={() => setSelectedUnit('m3')}
                      className={`py-1.5 rounded-md ${selectedUnit === 'm3' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'}`}
                    >
                      m³
                    </button>
                    <button
                      onClick={() => setSelectedUnit('gallons')}
                      className={`py-1.5 rounded-md ${selectedUnit === 'gallons' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'}`}
                    >
                      US Gal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider mb-1.5">
                    Default Reporting Cycle
                  </label>
                  <select
                    value={selectedCadence}
                    onChange={(e) => setSelectedCadence(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
                  >
                    <option>Monthly Cycle (1st – 31st Calendar Period)</option>
                    <option>Weekly Rolling Cadence (Mon 00:00 – Sun 23:59)</option>
                    <option>Daily 24-Hour Synced Window</option>
                  </select>
                </div>
              </div>

              {/* Surcharge Tariff Table */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-[#0B3C5D] mb-2">Tiered Water Overrun Tariff Model</h3>
                <div className="overflow-x-auto rounded-lg border border-[#DFE7EF]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F8FB] text-[#62748A] text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Usage Tier</th>
                        <th className="py-2.5 px-3">Threshold Span</th>
                        <th className="py-2.5 px-3">Base Tariff</th>
                        <th className="py-2.5 px-3">Conservation Overage Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE7EF]/60">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-[#0B3C5D]">Tier 1 (Base Domestic)</td>
                        <td className="py-2.5 px-3 text-[#62748A]">0 – 100,000 L / day</td>
                        <td className="py-2.5 px-3 text-[#172B4D]">$1.10 / 1,000 L</td>
                        <td className="py-2.5 px-3 text-[#18A999] font-bold">$0.00 (Standard)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-[#0B3C5D]">Tier 2 (Advisory Warning)</td>
                        <td className="py-2.5 px-3 text-[#62748A]">100,001 – 115,000 L / day</td>
                        <td className="py-2.5 px-3 text-[#172B4D]">$1.10 / 1,000 L</td>
                        <td className="py-2.5 px-3 text-[#F4B942] font-bold">+$2.50 / 1,000 L</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-[#0B3C5D]">Tier 3 (Emergency Curtailment)</td>
                        <td className="py-2.5 px-3 text-[#62748A]">&gt; 115,000 L / day</td>
                        <td className="py-2.5 px-3 text-[#172B4D]">$1.10 / 1,000 L</td>
                        <td className="py-2.5 px-3 text-[#D64545] font-bold">+$7.80 / 1,000 L</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALERT & DEFICITS */}
          {activeTab === 'alerts' && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-5">
              <div className="pb-3 border-b border-[#DFE7EF]/60">
                <h2 className="text-lg font-bold text-[#0B3C5D]">Alert Triggers & Automated Safeguards</h2>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Calibrate early-warning telemetry thresholds, leak-detection algorithms, and dispatch escalations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Critical Slider */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#D64545] uppercase text-[10px]">Critical Deficit Surge</span>
                    <span className="px-2 py-0.5 rounded bg-[#FFEBEE] text-[#D64545] text-[10px] font-bold">Tier 3</span>
                  </div>
                  <div className="text-base font-bold text-[#0B3C5D] tabular-nums">{criticalThreshold.toLocaleString()} L</div>
                  <input
                    type="range"
                    min="80000"
                    max="110000"
                    step="2000"
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                    className="w-full accent-[#D64545] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#62748A]">Triggers when forecasted demand exceeds safe yield.</p>
                </div>

                {/* Watch Slider */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#F4B942] uppercase text-[10px]">Early Watch Advisory</span>
                    <span className="px-2 py-0.5 rounded bg-[#FFF8E1] text-[#875E03] text-[10px] font-bold">Tier 2</span>
                  </div>
                  <div className="text-base font-bold text-[#0B3C5D] tabular-nums">{watchThreshold.toLocaleString()} L</div>
                  <input
                    type="range"
                    min="70000"
                    max="95000"
                    step="1000"
                    value={watchThreshold}
                    onChange={(e) => setWatchThreshold(Number(e.target.value))}
                    className="w-full accent-[#F4B942] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#62748A]">Proactive buffer alert at 90% allocation.</p>
                </div>

                {/* Night Baseflow Slider */}
                <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#00A6C7] uppercase text-[10px]">Night Baseflow Leak</span>
                    <span className="px-2 py-0.5 rounded bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">Acoustic</span>
                  </div>
                  <div className="text-base font-bold text-[#0B3C5D] tabular-nums">&gt; {nightLeakThreshold.toLocaleString()} L/hr</div>
                  <input
                    type="range"
                    min="400"
                    max="2500"
                    step="100"
                    value={nightLeakThreshold}
                    onChange={(e) => setNightLeakThreshold(Number(e.target.value))}
                    className="w-full accent-[#00A6C7] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#62748A]">Flags subsurface leakage between 02:00–04:00.</p>
                </div>
              </div>

              {/* Automated Dispatch Channels */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-[#0B3C5D]">Automated Dispatch Channels</h3>

                <label className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D] block">Weekly Executive Digest Email</span>
                    <span className="text-[11px] text-[#62748A]">Dispatched Mondays at 07:00 MST to HOA Board Members.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelEmail}
                    onChange={(e) => setChannelEmail(e.target.checked)}
                    className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D] block">Urgent SMS Operations Broadcast</span>
                    <span className="text-[11px] text-[#62748A]">Instant escalation for critical deficits or pipe bursts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelSms}
                    onChange={(e) => setChannelSms(e.target.checked)}
                    className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="p-3.5 bg-[#E1F5FE]/40 rounded-xl border border-[#00A6C7]/30 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D] block">
                      Dual-Admin Safeguard: Mandatory Curtailment
                    </span>
                    <span className="text-[11px] text-[#62748A]">
                      Requires cryptographic approval from both Admin 1 & 2 before valve closures.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dualAdminGuard}
                    onChange={(e) => setDualAdminGuard(e.target.checked)}
                    className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: ROLES & ACCESS */}
          {activeTab === 'roles' && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-5">
              <div className="pb-3 border-b border-[#DFE7EF]/60">
                <h2 className="text-lg font-bold text-[#0B3C5D]">User Roles & Access Governance</h2>
                <p className="text-xs text-[#62748A] mt-0.5">Role-based hydrological access control (RBAC) and user roster.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0B3C5D]">Community Admin</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0B3C5D] text-white text-[10px] font-bold">2 Active</span>
                  </div>
                  <p className="text-[11px] text-[#62748A]">Full read/write telemetry, budget caps approval, municipal filing.</p>
                  <span className="text-[11px] text-[#00A6C7] font-semibold block pt-1">David Adeleke, Sarah Jenkins</span>
                </div>

                <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0B3C5D]">Field Operator</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">4 Active</span>
                  </div>
                  <p className="text-[11px] text-[#62748A]">Record manual readings, acknowledge warnings, dispatch repair teams.</p>
                  <span className="text-[11px] text-[#00A6C7] font-semibold block pt-1">4 Field Techs (Zone 1-4)</span>
                </div>

                <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0B3C5D]">Community Resident</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F4F8FB] border border-[#DFE7EF] text-[10px] font-bold text-[#172B4D]">480 Units</span>
                  </div>
                  <p className="text-[11px] text-[#62748A]">Read-only household water quota, daily consumption insights.</p>
                  <span className="text-[11px] text-[#18A999] font-semibold block pt-1">Elena Rostova & Residents</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TELEMETRY & SYNC */}
          {activeTab === 'telemetry' && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE7EF]/60">
                <div>
                  <h2 className="text-lg font-bold text-[#0B3C5D]">Connected Telemetry Architecture</h2>
                  <p className="text-xs text-[#62748A] mt-0.5">Ultrasonic flow meter mesh, weather sensors, and SCADA gateway.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18A999] animate-pulse" />
                  All 128 Nodes Online
                </span>
              </div>

              {/* Drag-and-drop CSV Upload Area */}
              <div className="border-2 border-dashed border-[#CBD8E4] hover:border-[#00A6C7] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#FAFCFE] transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-[#E1F5FE] text-[#00677D] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-[#00A6C7]" />
                </div>
                <h4 className="text-sm font-bold text-[#0B3C5D]">Drag & drop meter ledger or utility billing batch</h4>
                <p className="text-xs text-[#62748A] mt-1 max-w-sm">
                  Supports CSV, XLSX up to 50MB. Timestamps must align with ISO 8601 or MST local format.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('Import dialog opened. Upload sample accepted.');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="mt-4 px-4 py-2 bg-[#0B3C5D] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Browse Files
                </button>
              </div>

              {/* Webhook Endpoint */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#62748A] uppercase tracking-wider">
                  SCADA Telemetry Ingress Webhook
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://telemetry.aquamind.ai/v1/maricopa/node-09/stream"
                  className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-mono text-[#0B3C5D]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

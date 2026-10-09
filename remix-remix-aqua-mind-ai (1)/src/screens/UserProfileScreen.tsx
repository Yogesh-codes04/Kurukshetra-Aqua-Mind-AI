import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Edit3,
  Globe,
  HardDrive,
  Key,
  Languages,
  Lock,
  Mail,
  MapPin,
  Moon,
  Phone,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';
import { AvatarPickerModal } from '../components/profile/AvatarPickerModal';
import { PhoneVerificationModal } from '../components/profile/PhoneVerificationModal';
import { UserAvatar } from '../components/profile/UserAvatar';
import { LanguageCode, ThemeMode, UserProfile } from '../types/profile';
import { t } from '../utils/i18n';
import { validateProfile } from '../utils/profileStorage';

interface UserProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNavigateToSimulator: () => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  currentTheme,
  onSelectTheme,
  currentLanguage,
  onSelectLanguage,
  onNavigateToSimulator,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Modals state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectMsg, setLocationDetectMsg] = useState<string | null>(null);

  // Check if form has unsaved changes
  const isDirty = JSON.stringify(formData) !== JSON.stringify(profile);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartEdit = () => {
    setFormData(profile);
    setValidationErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      setIsEditing(false);
      setValidationErrors({});
    }
  };

  const handleConfirmDiscard = () => {
    setFormData(profile);
    setValidationErrors({});
    setIsEditing(false);
    setShowDiscardConfirm(false);
    showToast('Unsaved edits discarded.', 'success');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfile(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast(t('profileSavedError', currentLanguage), 'error');
      return;
    }

    setValidationErrors({});
    setIsSaving(true);

    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
      setIsEditing(false);
      showToast(t('profileSavedSuccess', currentLanguage), 'success');
    }, 450);
  };

  const handleAvatarSelected = (newAvatarUrl: string, newAvatarType: 'preset' | 'upload' | 'camera') => {
    const updated = {
      ...formData,
      avatarUrl: newAvatarUrl,
      avatarType: newAvatarType,
    };
    setFormData(updated);
    if (!isEditing) {
      onUpdateProfile(updated);
      showToast('Avatar updated successfully.', 'success');
    }
  };

  const handlePhoneVerified = () => {
    const updated = {
      ...formData,
      isPhoneVerified: true,
      phoneVerificationStatus: 'verified' as const,
    };
    setFormData(updated);
    onUpdateProfile(updated);
    showToast(t('phoneVerifiedSuccess', currentLanguage), 'success');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationDetectMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationDetectMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const lat = pos.coords.latitude.toFixed(2);
        const lng = pos.coords.longitude.toFixed(2);

        // Approximate timezone from browser
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

        setFormData((prev) => ({
          ...prev,
          timezone: `${tz} (Lat ${lat}, Lng ${lng})`,
          city: prev.city || 'Pune',
          state: prev.state || 'Maharashtra',
          country: prev.country || 'India',
        }));
        setLocationDetectMsg(`Coordinates detected (${lat}, ${lng}). Timezone: ${tz}`);
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationDetectMsg('Location access denied by user. Enter location manually.');
        } else {
          setLocationDetectMsg('Could not detect location. Please enter manually.');
        }
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-4 ${
            toastType === 'success'
              ? 'bg-[#0B3C5D] dark:bg-[#071220] text-white border-cyan-500/40'
              : 'bg-rose-900 text-white border-rose-500/40'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0D1929] rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Discard Unsaved Changes?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t('unsavedChangesWarning', currentLanguage)}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs"
              >
                Discard Edits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-200 dark:border-cyan-800">
              Identity & Access
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              AquaMind Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('profileTitle', currentLanguage)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('profileSubtitle', currentLanguage)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
            >
              <Edit3 className="w-4 h-4 text-cyan-400 dark:text-white" />
              <span>{t('editProfile', currentLanguage)}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {t('cancel', currentLanguage)}
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('saving', currentLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-cyan-400 dark:text-white" />
                    <span>{t('saveChanges', currentLanguage)}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FEATURE 2 & 7: PROFILE SUMMARY CARD */}
      <div className="bg-white dark:bg-[#0D1929] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar with change overlay */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <UserAvatar
                avatarUrl={formData.avatarUrl}
                avatarType={formData.avatarType}
                name={formData.displayName}
                size="xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formData.displayName || 'Water Administrator'}
                </h2>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
                  @{formData.username || 'username'}
                </span>
                {formData.isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('verified', currentLanguage)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t('unverified', currentLanguage)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {formData.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {formData.city}, {formData.country}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {new Date(formData.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </span>
              </p>

              {formData.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 line-clamp-2 max-w-2xl">
                  {formData.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t('chooseAvatar', currentLanguage)}</span>
            </button>

            {!formData.isPhoneVerified && (
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('verifyPhone', currentLanguage)}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / CENTER: USER PROFILE FORM (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#0D1929] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {t('personalInformation', currentLanguage)}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {isEditing ? 'Editing Mode' : 'Read-only Mode'}
              </span>
            </div>

            {/* Field 1 & 2: Username & Display Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('username', currentLanguage)} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. yash_damle"
                  className={`w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
                    validationErrors.username
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] focus:border-cyan-500'
                  } disabled:opacity-75 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100 font-mono`}
                />
                {validationErrors.username && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {validationErrors.username}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('displayName', currentLanguage)} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Yash Damle"
                  className={`w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
                    validationErrors.displayName
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] focus:border-cyan-500'
                  } disabled:opacity-75 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100`}
                />
                {validationErrors.displayName && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {validationErrors.displayName}
                  </span>
                )}
              </div>
            </div>

            {/* Field 3 & 4: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('fullName', currentLanguage)}
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Yash Damle"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-sm text-slate-900 dark:text-slate-100 disabled:opacity-75 disabled:cursor-not-allowed focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('email', currentLanguage)}
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.gov"
                  className={`w-full h-10 px-3 rounded-xl border text-sm transition-all ${
                    validationErrors.email
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] focus:border-cyan-500'
                  } disabled:opacity-75 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100`}
                />
                {validationErrors.email && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {validationErrors.email}
                  </span>
                )}
              </div>
            </div>

            {/* Field 5 & 6: Phone & DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {t('phoneNumber', currentLanguage)}
                  </label>
                  <span
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold cursor-pointer hover:underline"
                  >
                    {formData.isPhoneVerified ? 'Verified' : 'Verify Now'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    disabled={!isEditing}
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-sm text-slate-900 dark:text-slate-100 disabled:opacity-75"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-sm text-slate-900 dark:text-slate-100 tabular-nums disabled:opacity-75 disabled:cursor-not-allowed focus:border-cyan-500"
                  />
                </div>
                {validationErrors.phone && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {validationErrors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('dateOfBirth', currentLanguage)}
                </label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-sm text-slate-900 dark:text-slate-100 disabled:opacity-75 disabled:cursor-not-allowed focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Field 7, 8, 9: Country, State, City */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Location & Jurisdiction
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation || !isEditing}
                  className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline disabled:opacity-50"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isDetectingLocation ? t('detectingLocation', currentLanguage) : t('detectLocation', currentLanguage)}</span>
                </button>
              </div>

              {locationDetectMsg && (
                <div className="mb-3 p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 text-xs">
                  {locationDetectMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('country', currentLanguage)}
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('state', currentLanguage)}
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('city', currentLanguage)}
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Pune"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t('timezone', currentLanguage)}
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="Asia/Kolkata (IST • UTC+05:30)"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071220] text-xs text-slate-900 dark:text-slate-100 disabled:opacity-75"
                />
              </div>
            </div>

            {/* Save / Cancel Bar in Edit Mode */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  {t('cancel', currentLanguage)}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('saving', currentLanguage)}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 dark:text-white" />
                      <span>{t('saveChanges', currentLanguage)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* FEATURE 6: DATA PERSISTENCE & SECURITY DOCUMENTATION */}
          <div className="bg-white dark:bg-[#0D1929] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Database className="w-5 h-5 text-cyan-500" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {t('securityAndStorage', currentLanguage)}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Storage architecture, Row-Level Security (RLS), and verification secrets
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <HardDrive className="w-4 h-4 text-cyan-500" />
                  <span>Current Applet Persistence</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Active storage: Browser localStorage fallback. User profile edits, theme choices, and language preferences remain persistent across browser reloads without external cloud dependencies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Supabase Cloud Integration Steps</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  To activate Supabase cloud persistence: Provision `profiles` table with user UUID, enable Row Level Security (`auth.uid() = id`), and connect Supabase Storage bucket `avatars` for photo uploads.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: THEME SELECTOR & PREFERENCES (1 COL) */}
        <div className="space-y-6">
          {/* FEATURE 1: THEME SELECTOR CARD */}
          <div className="bg-white dark:bg-[#0D1929] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500 dark:hidden" />
              <Moon className="w-4 h-4 text-cyan-400 hidden dark:block" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {t('theme', currentLanguage)}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('themeDescription', currentLanguage)}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Light */}
              <button
                type="button"
                onClick={() => onSelectTheme('light')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  currentTheme === 'light'
                    ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/50 ring-2 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Sun className={`w-5 h-5 ${currentTheme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('themeLight', currentLanguage).split(' ')[0]}
                </span>
              </button>

              {/* Dark */}
              <button
                type="button"
                onClick={() => onSelectTheme('dark')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  currentTheme === 'dark'
                    ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/50 ring-2 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Moon className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('themeDark', currentLanguage).split(' ')[0]}
                </span>
              </button>

              {/* System */}
              <button
                type="button"
                onClick={() => onSelectTheme('system')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  currentTheme === 'system'
                    ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/50 ring-2 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Compass className={`w-5 h-5 ${currentTheme === 'system' ? 'text-cyan-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Auto
                </span>
              </button>
            </div>
          </div>

          {/* FEATURE 5: LANGUAGE PREFERENCE CARD */}
          <div className="bg-white dark:bg-[#0D1929] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-cyan-500" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {t('preferredLanguage', currentLanguage)}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select interface language with instant real-time translation:
            </p>

            <div className="space-y-2 pt-1">
              {[
                { code: 'en' as const, label: 'English', sub: 'Default' },
                { code: 'hi' as const, label: 'हिंदी (Hindi)', sub: 'भारतीय भाषा' },
                { code: 'mr' as const, label: 'मराठी (Marathi)', sub: 'प्रादेशिक भाषा' },
              ].map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setFormData({ ...formData, preferredLanguage: lang.code });
                      showToast(`Language set to ${lang.label}`, 'success');
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/50 ring-2 ring-cyan-500/30 text-slate-900 dark:text-white font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{lang.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{lang.sub}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Return to Simulator */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B3C5D] to-[#072840] text-white space-y-2.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
              Navigation Shortcut
            </span>
            <h4 className="text-sm font-bold">Return to Water Scarcity Simulator</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Run deterministic allocation models, inspect minimum deficits, and adjust scarcity scenarios.
            </p>
            <button
              onClick={onNavigateToSimulator}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Open Simulator Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        currentAvatarUrl={formData.avatarUrl}
        currentAvatarType={formData.avatarType}
        userName={formData.displayName}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={handleAvatarSelected}
      />

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        phone={formData.phone}
        countryCode={formData.countryCode}
        isVerified={formData.isPhoneVerified}
        onClose={() => setIsPhoneModalOpen(false)}
        onVerifySuccess={handlePhoneVerified}
      />
    </div>
  );
};

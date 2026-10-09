export type ThemeMode = 'light' | 'dark' | 'system';

export type LanguageCode = 'en' | 'hi' | 'mr';

export type PhoneVerificationStatus = 'verified' | 'unverified';

export interface UserProfile {
  id: string;
  username: string; // Required, unique format
  displayName: string; // Required
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  isPhoneVerified: boolean;
  phoneVerificationStatus: PhoneVerificationStatus;
  dateOfBirth: string; // YYYY-MM-DD
  country: string;
  state: string;
  city: string;
  timezone: string;
  preferredLanguage: LanguageCode;
  avatarUrl: string;
  avatarType: 'preset' | 'upload' | 'camera';
  createdAt: string; // Account creation date ISO
  updatedAt?: string;
  bio?: string;
}

export interface BuiltInAvatar {
  id: string;
  name: string;
  role: string;
  svgIcon: string;
  backgroundColor: string;
  borderColor: string;
}

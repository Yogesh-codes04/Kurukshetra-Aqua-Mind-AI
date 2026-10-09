import { BuiltInAvatar, UserProfile } from '../types/profile';

export const BUILT_IN_AVATARS: BuiltInAvatar[] = [
  {
    id: 'avatar-hydro-lead',
    name: 'Hydro Officer',
    role: 'Water Grid Director',
    backgroundColor: '#E0F7FA',
    borderColor: '#00A6C7',
    svgIcon: 'hydro_lead',
  },
  {
    id: 'avatar-conservationist',
    name: 'Eco Specialist',
    role: 'Watershed Conservation',
    backgroundColor: '#E8F5E9',
    borderColor: '#18A999',
    svgIcon: 'conservationist',
  },
  {
    id: 'avatar-civil-eng',
    name: 'Civil Engineer',
    role: 'Municipal Infrastructure',
    backgroundColor: '#EDE7F6',
    borderColor: '#7E57C2',
    svgIcon: 'civil_eng',
  },
  {
    id: 'avatar-analyst',
    name: 'Data Hydrologist',
    role: 'Allocation Modeling',
    backgroundColor: '#FFF3E0',
    borderColor: '#FB8C00',
    svgIcon: 'analyst',
  },
  {
    id: 'avatar-technician',
    name: 'Field Technician',
    role: 'Telemetry & Ultrasonic Meters',
    backgroundColor: '#E1F5FE',
    borderColor: '#0288D1',
    svgIcon: 'technician',
  },
  {
    id: 'avatar-governance',
    name: 'District Trustee',
    role: 'Community Water Board',
    backgroundColor: '#FCE4EC',
    borderColor: '#E91E63',
    svgIcon: 'governance',
  },
  {
    id: 'avatar-aquifer',
    name: 'Groundwater Guard',
    role: 'Aquifer Recharging',
    backgroundColor: '#E0F2F1',
    borderColor: '#00897B',
    svgIcon: 'aquifer',
  },
  {
    id: 'avatar-sentinel',
    name: 'Drought Sentinel',
    role: 'Emergency Response Lead',
    backgroundColor: '#FFF8E1',
    borderColor: '#FBC02D',
    svgIcon: 'sentinel',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_aquamind_01',
  username: 'yash_damle',
  displayName: 'Yash Damle',
  fullName: 'Yash Damle',
  email: 'yashdamle9141@gmail.com',
  phone: '9876543210',
  countryCode: '+91',
  isPhoneVerified: false,
  phoneVerificationStatus: 'unverified',
  dateOfBirth: '1995-04-12',
  country: 'India',
  state: 'Maharashtra',
  city: 'Pune',
  timezone: 'Asia/Kolkata (IST • UTC+05:30)',
  preferredLanguage: 'en',
  avatarUrl: 'avatar-hydro-lead',
  avatarType: 'preset',
  createdAt: '2025-01-15T08:30:00.000Z',
  bio: 'Water resources administrator evaluating municipal rationing policies and drought contingency simulations.',
};

const PROFILE_STORAGE_KEY = 'aquamind_user_profile_v1';

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
      };
    }
  } catch {
    // Fallback on corrupt JSON
  }
  return DEFAULT_USER_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage quota fallback
  }
}

export function validateProfile(profile: UserProfile): Record<string, string> {
  const errors: Record<string, string> = {};

  const cleanUsername = profile.username.trim();
  if (!cleanUsername) {
    errors.username = 'Username is required.';
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
    errors.username = 'Username must be 3-30 characters (letters, numbers, underscores only).';
  }

  const cleanDisplay = profile.displayName.trim();
  if (!cleanDisplay) {
    errors.displayName = 'Display name is required.';
  }

  const cleanEmail = profile.email.trim();
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  const cleanPhone = profile.phone.trim();
  if (cleanPhone && !/^\d{6,15}$/.test(cleanPhone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Please enter a valid phone number (6-15 digits).';
  }

  return errors;
}

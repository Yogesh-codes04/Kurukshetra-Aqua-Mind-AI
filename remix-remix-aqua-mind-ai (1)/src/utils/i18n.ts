import { LanguageCode } from '../types/profile';

export interface TranslationDictionary {
  // Navigation
  navOverview: string;
  navFacilities: string;
  navBudget: string;
  navForecasts: string;
  navAiInsights: string;
  navReports: string;
  navSettings: string;
  navProfile: string;

  // Actions
  saveChanges: string;
  editProfile: string;
  cancel: string;
  discard: string;
  saving: string;
  simulate: string;
  recordReading: string;
  uploadPhoto: string;
  takePhoto: string;
  chooseAvatar: string;
  removePhoto: string;
  detectLocation: string;
  detectingLocation: string;
  verifyPhone: string;
  requestOtp: string;
  enterOtp: string;
  verifyCode: string;
  resendOtp: string;

  // Profile Fields
  username: string;
  displayName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  preferredLanguage: string;
  accountCreated: string;
  phoneVerificationStatus: string;
  verified: string;
  unverified: string;

  // Themes
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  themeDescription: string;

  // Headings & Sections
  profileTitle: string;
  profileSubtitle: string;
  personalInformation: string;
  locationAndLanguage: string;
  phoneVerification: string;
  securityAndStorage: string;
  avatarSelection: string;
  unsavedChangesWarning: string;

  // Notifications
  profileSavedSuccess: string;
  profileSavedError: string;
  phoneVerifiedSuccess: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    navOverview: 'Allocation Simulator',
    navFacilities: 'Facilities',
    navBudget: 'Water Budget',
    navForecasts: 'Forecasts',
    navAiInsights: 'AI Insights',
    navReports: 'Reports',
    navSettings: 'Settings',
    navProfile: 'User Profile',

    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    cancel: 'Cancel',
    discard: 'Discard Changes',
    saving: 'Saving...',
    simulate: 'SIMULATE ALLOCATION',
    recordReading: 'Record Reading',
    uploadPhoto: 'Upload Photo',
    takePhoto: 'Take Photo',
    chooseAvatar: 'Choose Avatar',
    removePhoto: 'Remove Photo',
    detectLocation: 'Detect My Location',
    detectingLocation: 'Detecting...',
    verifyPhone: 'Verify Phone',
    requestOtp: 'Request OTP',
    enterOtp: 'Enter 6-Digit Code',
    verifyCode: 'Verify Code',
    resendOtp: 'Resend Code',

    username: 'Username',
    displayName: 'Display Name',
    fullName: 'Full Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    countryCode: 'Country Code',
    dateOfBirth: 'Date of Birth',
    country: 'Country',
    state: 'State / Province',
    city: 'City',
    timezone: 'Time Zone',
    preferredLanguage: 'Preferred Language',
    accountCreated: 'Account Created',
    phoneVerificationStatus: 'Phone Status',
    verified: 'Verified',
    unverified: 'Unverified',

    theme: 'Theme Preference',
    themeLight: 'Light Theme',
    themeDark: 'Dark Theme',
    themeSystem: 'System Default',
    themeDescription: 'Select interface appearance or synchronize with operating system.',

    profileTitle: 'User Profile & Identity',
    profileSubtitle: 'Manage administrative identity, contact verification, locale, and theme preferences.',
    personalInformation: 'Personal Information',
    locationAndLanguage: 'Location & Language Preferences',
    phoneVerification: 'Phone Number Verification',
    securityAndStorage: 'Data Persistence & Supabase Connection',
    avatarSelection: 'Select Profile Picture',
    unsavedChangesWarning: 'You have unsaved changes. Discard them or save before leaving.',

    profileSavedSuccess: 'Profile changes saved successfully.',
    profileSavedError: 'Please correct the validation errors in the form.',
    phoneVerifiedSuccess: 'Phone number verified successfully.',
  },

  hi: {
    navOverview: 'जल आवंटन सिम्युलेटर',
    navFacilities: 'सुविधाएं व केंद्र',
    navBudget: 'जल बजट',
    navForecasts: 'मांग पूर्वानुमान',
    navAiInsights: 'एआई अंतर्दृष्टि',
    navReports: 'रिपोर्ट व आंकड़े',
    navSettings: 'सेटिंग्स',
    navProfile: 'उपयोगकर्ता प्रोफ़ाइल',

    saveChanges: 'बदलाव सहेजें',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    cancel: 'रद्द करें',
    discard: 'बदलाव हटाएं',
    saving: 'सहेजा जा रहा है...',
    simulate: 'आवंटन सिमुलेट करें',
    recordReading: 'रीडिंग दर्ज करें',
    uploadPhoto: 'फ़ोटो अपलोड करें',
    takePhoto: 'फ़ोटो खींचें',
    chooseAvatar: 'अवतार चुनें',
    removePhoto: 'फ़ोटो हटाएं',
    detectLocation: 'मेरा स्थान पहचानें',
    detectingLocation: 'स्थान खोजा जा रहा है...',
    verifyPhone: 'फ़ोन सत्यापित करें',
    requestOtp: 'ओटीपी अनुरोध करें',
    enterOtp: '६ अंकों का कोड दर्ज करें',
    verifyCode: 'सत्यापित करें',
    resendOtp: 'पुनः कोड भेजें',

    username: 'उपयोगकर्ता नाम (Username)',
    displayName: 'प्रदर्शित नाम (Display Name)',
    fullName: 'पूरा नाम',
    email: 'ईमेल पता',
    phoneNumber: 'फ़ोन नंबर',
    countryCode: 'देश कोड',
    dateOfBirth: 'जन्म तिथि',
    country: 'देश',
    state: 'राज्य',
    city: 'शहर',
    timezone: 'समय क्षेत्र (Timezone)',
    preferredLanguage: 'पसंदीदा भाषा',
    accountCreated: 'खाता निर्माण तिथि',
    phoneVerificationStatus: 'फ़ोन सत्यापन स्थिति',
    verified: 'सत्यापित',
    unverified: 'असत्यापित',

    theme: 'थीम प्राथमिकता',
    themeLight: 'लाइट थीम',
    themeDark: 'डार्क थीम',
    themeSystem: 'सिस्टम डिफ़ॉल्ट',
    themeDescription: 'इंटरफ़ेस का स्वरूप चुनें या अपने डिवाइस की सेटिंग के अनुसार रखें।',

    profileTitle: 'उपयोगकर्ता प्रोफ़ाइल और पहचान',
    profileSubtitle: 'प्रशासनिक पहचान, संपर्क सत्यापन, भाषा और थीम वरीयताएं प्रबंधित करें।',
    personalInformation: 'व्यक्तिगत जानकारी',
    locationAndLanguage: 'स्थान और भाषा वरीयताएं',
    phoneVerification: 'फ़ोन नंबर सत्यापन (OTP)',
    securityAndStorage: 'डेटा भंडारण और सुपबेस कनेक्शन',
    avatarSelection: 'प्रोफ़ाइल चित्र चुनें',
    unsavedChangesWarning: 'आपके पास बिना सहेजे बदलाव हैं। क्या आप उन्हें रद्द करना चाहते हैं?',

    profileSavedSuccess: 'प्रोफ़ाइल सफलतापूर्वक सहेजी गई।',
    profileSavedError: 'कृपया फ़ॉर्म में त्रुटियों को ठीक करें।',
    phoneVerifiedSuccess: 'फ़ोन नंबर सफलतापूर्वक सत्यापित हुआ।',
  },

  mr: {
    navOverview: 'पाणी वाटप सिम्युलेटर',
    navFacilities: 'सुविधा आणि केंद्रे',
    navBudget: 'पाणी बजेट',
    navForecasts: 'मागणी अंदाज',
    navAiInsights: 'एआय माहिती',
    navReports: 'अहवाल आणि विश्लेषण',
    navSettings: 'सेटिंग्ज',
    navProfile: 'वापरकर्ता प्रोफाइल',

    saveChanges: 'बदल जतन करा',
    editProfile: 'प्रोफाइल संपादित करा',
    cancel: 'रद्द करा',
    discard: 'बदल नाकारा',
    saving: 'जतन करत आहे...',
    simulate: 'वाटप सिम्युलेट करा',
    recordReading: 'रीडिंग नोंदवा',
    uploadPhoto: 'फोटो अपलोड करा',
    takePhoto: 'फोटो काढा',
    chooseAvatar: 'अवतार निवडा',
    removePhoto: 'फोटो काढा',
    detectLocation: 'माझे स्थान शोधा',
    detectingLocation: 'स्थान शोधत आहे...',
    verifyPhone: 'फोन पडताळणी करा',
    requestOtp: 'ओटीपी मागवा',
    enterOtp: '६ अंकी कोड टाका',
    verifyCode: 'पडताळणी करा',
    resendOtp: 'पुन्हा कोड पाठवा',

    username: 'वापरकर्ता नाव (Username)',
    displayName: 'प्रदर्शित नाव (Display Name)',
    fullName: 'पूर्ण नाव',
    email: 'ईमेल पत्ता',
    phoneNumber: 'फोन नंबर',
    countryCode: 'देश कोड',
    dateOfBirth: 'जन्मतारीख',
    country: 'देश',
    state: 'राज्य',
    city: 'शहर',
    timezone: 'वेळ क्षेत्र (Timezone)',
    preferredLanguage: 'पसंतीची भाषा',
    accountCreated: 'खाते तयार दिनांक',
    phoneVerificationStatus: 'फोन पडताळणी स्थिती',
    verified: 'पडताळलेले',
    unverified: 'अपडताळलेले',

    theme: 'थीम प्राधान्य',
    themeLight: 'लाइट थीम',
    themeDark: 'डार्क थीम',
    themeSystem: 'सिस्टम डीफॉल्ट',
    themeDescription: 'इंटरफेस स्वरूप निवडा किंवा आपल्या ऑपरेटिंग सिस्टमशी सुसंगत ठेवा.',

    profileTitle: 'वापरकर्ता प्रोफाइल आणि ओळख',
    profileSubtitle: 'प्रशासकीय ओळख, संपर्क पडताळणी, भाषा आणि थीम प्राधान्ये व्यवस्थापित करा.',
    personalInformation: 'वैयक्तिक माहिती',
    locationAndLanguage: 'स्थान आणि भाषा प्राधान्ये',
    phoneVerification: 'फोन नंबर पडताळणी (OTP)',
    securityAndStorage: 'डेटा संचयन आणि सुपबेस जोडणी',
    avatarSelection: 'प्रोफाइल चित्र निवडा',
    unsavedChangesWarning: 'तुमचे बदल जतन केलेले नाहीत. सोडण्यापूर्वी ते जतन करा.',

    profileSavedSuccess: 'प्रोफाइल यशस्वीरित्या जतन केली.',
    profileSavedError: 'कृपया फॉर्ममधील त्रुटी दुरुस्त करा.',
    phoneVerifiedSuccess: 'फोन नंबर यशस्वीरित्या पडताळला गेला.',
  },
};

export function t(key: keyof TranslationDictionary, lang: LanguageCode = 'en'): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

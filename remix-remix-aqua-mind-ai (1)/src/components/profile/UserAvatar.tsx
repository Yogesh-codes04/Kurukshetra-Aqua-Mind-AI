import React from 'react';
import { Droplets, Shield, User } from 'lucide-react';
import { BUILT_IN_AVATARS } from '../../utils/profileStorage';

interface UserAvatarProps {
  avatarUrl: string;
  avatarType?: 'preset' | 'upload' | 'camera';
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-24 h-24 text-2xl',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-12 h-12',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  avatarType = 'preset',
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const containerSize = sizeClasses[size];
  const iconSize = iconSizes[size];

  // If user uploaded a custom photo or took camera snapshot (data:image or http)
  if (avatarUrl && (avatarUrl.startsWith('data:image') || avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
    return (
      <div
        className={`${containerSize} rounded-full overflow-hidden border-2 border-[#00A6C7] shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800 ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback on broken image
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Check if it matches a preset avatar
  const preset = BUILT_IN_AVATARS.find((a) => a.id === avatarUrl);

  if (preset) {
    return (
      <div
        className={`${containerSize} rounded-full flex items-center justify-center font-bold shrink-0 border-2 shadow-xs transition-transform ${className}`}
        style={{
          backgroundColor: preset.backgroundColor,
          borderColor: preset.borderColor,
          color: preset.borderColor,
        }}
        title={`${preset.name} (${preset.role})`}
      >
        <Droplets className={iconSize} />
      </div>
    );
  }

  // Fallback: Initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div
      className={`${containerSize} rounded-full bg-[#0B3C5D] text-white flex items-center justify-center font-bold shrink-0 border-2 border-[#00A6C7] shadow-xs ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
};

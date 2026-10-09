import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Droplets,
  HardDrive,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Upload,
  VideoOff,
  X,
} from 'lucide-react';
import { BuiltInAvatar } from '../../types/profile';
import { BUILT_IN_AVATARS } from '../../utils/profileStorage';
import { UserAvatar } from './UserAvatar';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  currentAvatarType: 'preset' | 'upload' | 'camera';
  userName: string;
  onClose: () => void;
  onSelectAvatar: (avatarUrl: string, avatarType: 'preset' | 'upload' | 'camera') => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  currentAvatarType,
  userName,
  onClose,
  onSelectAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'camera'>('presets');
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl);
  const [previewType, setPreviewType] = useState<'preset' | 'upload' | 'camera'>(currentAvatarType);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentAvatarUrl);
      setPreviewType(currentAvatarType);
      setErrorMsg(null);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, currentAvatarUrl, currentAvatarType]);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
  }, [activeTab]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your current browser or device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera hardware was found on your device.');
      } else {
        setCameraError(`Unable to start camera: ${err.message || 'Unknown error'}`);
      }
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setPreviewUrl(dataUrl);
    setPreviewType('camera');
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WebP, or SVG).');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        setPreviewType('upload');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: BuiltInAvatar) => {
    setPreviewUrl(preset.id);
    setPreviewType('preset');
    setErrorMsg(null);
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('avatar-hydro-lead');
    setPreviewType('preset');
    setErrorMsg(null);
  };

  const handleSave = () => {
    stopCamera();
    onSelectAvatar(previewUrl, previewType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C5D]/60 dark:bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0D1929] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Choose Profile Avatar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a built-in avatar, upload a photo, or capture from camera
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Active Preview Strip */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <UserAvatar
                avatarUrl={previewUrl}
                avatarType={previewType}
                name={userName}
                size="lg"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Current Selection Preview
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                  Source: {previewType} avatar
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-[#0B3C5D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span>Built-in Avatars</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-[#0B3C5D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 text-cyan-500" />
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'camera'
                  ? 'bg-white dark:bg-[#0B3C5D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4 text-cyan-500" />
              <span>Take Photo</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PRESETS GRID */}
          {activeTab === 'presets' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Choose Environmental & Water Grid Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BUILT_IN_AVATARS.map((avatar) => {
                  const isSelected = previewUrl === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectPreset(avatar)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 relative ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-2 ring-cyan-500/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071220] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold border-2"
                        style={{
                          backgroundColor: avatar.backgroundColor,
                          borderColor: avatar.borderColor,
                          color: avatar.borderColor,
                        }}
                      >
                        <Droplets className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                          {avatar.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                          {avatar.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-[#071220] transition-colors"
              >
                <Upload className="w-10 h-10 text-cyan-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Click to select photo from device
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Supports JPEG, PNG, WebP or SVG up to 5MB. Photo is previewed and cropped to a circular avatar.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Browse Files
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <HardDrive className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>
                  Storage Note: Uploaded photos are stored locally in the browser. When Supabase Storage bucket (`avatars`) is connected, images will upload directly to cloud storage.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: CAMERA CAPTURE */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 space-y-3">
                  <VideoOff className="w-10 h-10 text-rose-500 mx-auto" />
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium max-w-sm mx-auto">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-900 dark:bg-cyan-600 text-white rounded-xl text-xs font-semibold hover:opacity-90"
                  >
                    Retry Camera Access
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-64 flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Circular target guide overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-2 border-dashed border-cyan-400 shadow-2xl opacity-80" />
                  </div>

                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Snapshot</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                Position your face inside the circle. The photo will be cropped into your profile avatar.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-[#071220]">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Selected: <strong className="text-slate-900 dark:text-slate-100 capitalize">{previewType}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

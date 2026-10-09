import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  Phone,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  phone: string;
  countryCode: string;
  isVerified: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  phone,
  countryCode,
  isVerified,
  onClose,
  onVerifySuccess,
}) => {
  const [step, setStep] = useState<'request' | 'enter_code'>('request');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpDigits(['', '', '', '', '', '']);
      if (!isVerified) {
        setStep('request');
      }
    }
  }, [isOpen, isVerified]);

  const fullNumber = `${countryCode} ${phone}`;

  const handleRequestOtp = () => {
    if (!phone || phone.trim().length < 6) {
      setErrorMsg('Please enter a valid phone number before requesting OTP.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulated sandbox OTP request with production notice
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('enter_code');
      setCooldown(30);
      setSuccessMsg('Verification code requested. Use test code 749201 in development mode.');
    }, 700);
  };

  const handleDigitChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      e.preventDefault();
      setOtpDigits(paste.split(''));
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsSubmitting(false);
      // In sandbox mode without live Supabase Twilio SMS credentials,
      // code 749201 is the designated test verification code
      if (enteredCode === '749201') {
        onVerifySuccess();
        onClose();
      } else {
        setErrorMsg('Invalid verification code. Please check the digits or request a new code.');
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C5D]/60 dark:bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0D1929] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Phone Number Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Two-factor SMS verification for emergency alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Target Number Display */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-cyan-500" />
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Verification Target:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {fullNumber}
                </span>
              </div>
            </div>

            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <ShieldAlert className="w-3.5 h-3.5" />
                Unverified
              </span>
            )}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Request OTP */}
          {step === 'request' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click below to request a 6-digit one-time verification passcode (OTP) for your registered mobile number.
              </p>

              {/* Supabase Notice */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-200">
                  <Shield className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Authentication Provider Architecture</span>
                </div>
                <p>
                  Production requires Supabase Phone Auth connected to an SMS gateway (Twilio, MessageBird, or Vonage). For immediate local testing, use development verification code <strong>749201</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Requesting Code...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Request 6-Digit OTP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Enter 6-digit Code */}
          {step === 'enter_code' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 tabular-nums"
                    />
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-[11px] text-cyan-800 dark:text-cyan-300 text-center">
                Sandbox Test Passcode: <strong className="font-mono text-xs">749201</strong>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Didn't receive code?
                </span>
                {cooldown > 0 ? (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || otpDigits.join('').length !== 6}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0B3C5D] hover:bg-[#072840] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    'Verifying...'
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Verify Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

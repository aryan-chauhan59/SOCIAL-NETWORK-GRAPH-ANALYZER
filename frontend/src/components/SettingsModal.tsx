import React, { useState } from "react";
import { X, Camera, Lock, User, Mail, Phone, ShieldCheck, RefreshCw } from "lucide-react";

// Preset avatars from App.tsx
const DEFAULT_AVATARS = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ec4899'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%2310b981'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23f59e0b'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    email: string;
    phone: string;
    avatarUrl: string;
  } | null;
  onUpdateUser: (updatedUser: {
    username: string;
    email: string;
    phone: string;
    avatarUrl: string;
  }) => void;
  theme: "light" | "dark";
  language: "en" | "hi";
}

const SETTINGS_TRANSLATIONS = {
  en: {
    title: "Account Settings",
    subtitle: "Update your social profile and password details",
    username: "Username",
    email: "Email Address",
    phone: "Phone Number",
    password: "Change Password (optional)",
    passwordPlaceholder: "Enter new password if updating...",
    avatar: "Profile Picture",
    presetLabel: "Select pre-designed avatar",
    uploadBtn: "Upload Custom Photo",
    cancelBtn: "Cancel",
    saveBtn: "Save Profile Changes",
    errorHeader: "Update Failed",
    successHeader: "Success",
  },
  hi: {
    title: "खाता सेटिंग",
    subtitle: "अपने सोशल प्रोफाइल और पासवर्ड विवरण अपडेट करें",
    username: "उपयोगकर्ता नाम",
    email: "ईमेल पता",
    phone: "फ़ोन नंबर",
    password: "पासवर्ड बदलें (वैकल्पिक)",
    passwordPlaceholder: "यदि अपडेट कर रहे हैं तो नया पासवर्ड दर्ज करें...",
    avatar: "प्रोफ़ाइल चित्र",
    presetLabel: "पूर्व-डिज़ाइन किया गया अवतार चुनें",
    uploadBtn: "कस्टम फोटो अपलोड करें",
    cancelBtn: "रद्द करें",
    saveBtn: "प्रोफ़ाइल परिवर्तन सहेजें",
    errorHeader: "अपडेट विफल",
    successHeader: "सफलता",
  },
};

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  theme,
  language,
}: SettingsModalProps) {
  if (!isOpen || !currentUser) return null;

  const t = SETTINGS_TRANSLATIONS[language];

  // Local Form state
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle local custom picture upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit profile updates to server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("All core fields are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldUsername: currentUser.username,
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password || undefined,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onUpdateUser(data.user);
        setSuccessMsg(data.message || "Profile updated successfully!");
        setPassword(""); // reset password input
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMsg("Failed to communicate with authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 md:p-8 shadow-2xl relative transition-all max-h-[90vh] overflow-y-auto ${
          theme === "light"
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-slate-900 border-slate-800 text-slate-100"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-full border transition-colors cursor-pointer ${
            theme === "light"
              ? "hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
              : "hover:bg-slate-800 border-slate-750 text-slate-400 hover:text-white"
          }`}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-base font-black tracking-wider uppercase flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-500" />
            <span>{t.title}</span>
          </h2>
          <p className={`text-[11px] mt-1 font-mono uppercase ${theme === "light" ? "text-slate-500" : "text-slate-450"}`}>
            {t.subtitle}
          </p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded p-3 text-xs font-mono">
            ⚠️ <strong>{t.errorHeader}:</strong> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded p-3 text-xs font-mono animate-pulse">
            ✅ <strong>{t.successHeader}:</strong> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                {t.username}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={13} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full border rounded-lg pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light"
                      ? "bg-white border-slate-300 text-slate-900"
                      : "bg-slate-800 border-slate-700 text-white"
                  }`}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                {t.email}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={13} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-lg pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light"
                      ? "bg-white border-slate-300 text-slate-900"
                      : "bg-slate-800 border-slate-700 text-white"
                  }`}
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                {t.phone}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Phone size={13} />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded-lg pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light"
                      ? "bg-white border-slate-300 text-slate-900"
                      : "bg-slate-800 border-slate-700 text-white"
                  }`}
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                {t.password}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={13} />
                </span>
                <input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-lg pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light"
                      ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                      : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Avatar Area */}
          <div className={`border-t pt-4 space-y-3 ${theme === "light" ? "border-slate-100" : "border-slate-800"}`}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
              {t.avatar}
            </label>

            <div className="flex items-center gap-4">
              {/* Picture Preview */}
              <div className="w-14 h-14 rounded-full overflow-hidden border border-indigo-500 bg-slate-950 flex-shrink-0 shadow-md">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-bold transition-all cursor-pointer w-fit ${
                    theme === "light"
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  <Camera size={13} />
                  <span>{t.uploadBtn}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.presetLabel}
              </span>
              <div className="flex gap-2">
                {DEFAULT_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(avatar)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                      avatarUrl === avatar
                        ? "border-indigo-500 scale-105 ring-2 ring-indigo-500/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={avatar} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`border-t pt-5 flex items-center justify-end gap-3 ${
            theme === "light" ? "border-slate-100" : "border-slate-800"
          }`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                theme === "light"
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
              <span>{t.saveBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

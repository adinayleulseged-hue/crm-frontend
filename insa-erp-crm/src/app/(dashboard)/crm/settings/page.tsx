"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Bell, Globe, Settings, Save, LogOut, Trash2, Shield, CheckCircle2 } from "lucide-react";
import apiClient from "@/services/apiClient";

export default function SettingsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState({
    fullName: "Salam Haile",
    username: "salam.haile",
    email: "salam.haile@insa.gov.et",
    phone: "",
    department: "",
    role: "Sales Officer",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    weeklyReport: false,
  });

  const [systemPrefs, setSystemPrefs] = useState({
    language: "English",
    timezone: "Africa/Addis_Ababa",
    dateFormat: "DD/MM/YYYY",
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUserId(parsed.id ?? null);
        setProfile((prev) => ({
          ...prev,
          fullName: parsed.name || parsed.fullName || prev.fullName,
          username: parsed.username || prev.username,
          email: parsed.email || prev.email,
          role: parsed.role || prev.role,
          phone: parsed.phone || prev.phone,
          department: parsed.department || prev.department,
        }));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      setProfileError("No authenticated user found. Please log in again.");
      return;
    }
    setProfileError("");
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await apiClient.put(`/api/users/${userId}`, {
        username: profile.username,
        email: profile.email,
      });
      // Persist updated user locally
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...parsed, username: profile.username, email: profile.email, name: profile.fullName })
        );
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile.";
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handleUpdatePassword = async () => {
    if (!userId) {
      setPasswordError("No authenticated user found. Please log in again.");
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length > 0 && passwords.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (!passwords.newPassword) {
      setPasswordError("New password cannot be empty");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await apiClient.put(`/api/users/${userId}/password`, {
        password: passwords.newPassword,
      });
      setPasswords({ current: "", newPassword: "", confirm: "" });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password.";
      setPasswordError(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSystemPrefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSystemPrefs({ ...systemPrefs, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071d3a] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#c8102e]" />
          Settings & Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
            <h2 className="text-lg font-semibold text-[#071d3a] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={profile.department}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Role</label>
                <input
                  type="text"
                  name="role"
                  value={profile.role}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              {profileSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mr-4 self-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
                </span>
              )}
              {profileError && (
                <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mr-4 self-center">
                  {profileError}
                </span>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a80d26] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
            <h2 className="text-lg font-semibold text-[#071d3a] mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              Security & Password
            </h2>
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 ${
                    passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#c8102e] focus:ring-[#c8102e]'
                  }`}
                />
                {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              </div>
              <div className="pt-2 space-y-2">
                {passwordSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Password updated successfully
                  </div>
                )}
                <button
                  onClick={handleUpdatePassword}
                  disabled={passwordSaving}
                  className="bg-white border border-slate-200 hover:border-[#c8102e] hover:text-[#c8102e] text-[#071d3a] px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {passwordSaving ? "Updating…" : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notification Preferences Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
            <h2 className="text-lg font-semibold text-[#071d3a] mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-700 group-hover:text-[#071d3a]">Email Notifications</span>
                <button 
                  onClick={() => toggleNotification('email')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.email ? 'bg-[#c8102e]' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-700 group-hover:text-[#071d3a]">SMS Alerts</span>
                <button 
                  onClick={() => toggleNotification('sms')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.sms ? 'bg-[#c8102e]' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.sms ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-700 group-hover:text-[#071d3a]">Browser Push</span>
                <button 
                  onClick={() => toggleNotification('push')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.push ? 'bg-[#c8102e]' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.push ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-700 group-hover:text-[#071d3a]">Weekly Report</span>
                <button 
                  onClick={() => toggleNotification('weeklyReport')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.weeklyReport ? 'bg-[#c8102e]' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.weeklyReport ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
            </div>
          </div>

          {/* System Preferences Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
            <h2 className="text-lg font-semibold text-[#071d3a] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-400" />
              System Preferences
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Language</label>
                <select
                  name="language"
                  value={systemPrefs.language}
                  onChange={handleSystemPrefChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] bg-white"
                >
                  <option value="English">English</option>
                  <option value="Amharic">Amharic</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Timezone</label>
                <select
                  name="timezone"
                  value={systemPrefs.timezone}
                  onChange={handleSystemPrefChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] bg-white"
                >
                  <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Date Format</label>
                <select
                  name="dateFormat"
                  value={systemPrefs.dateFormat}
                  onChange={handleSystemPrefChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] bg-white"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 border-t-4 border-t-red-500">
            <h2 className="text-lg font-semibold text-[#071d3a] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              Account Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#071d3a] px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sign Out of All Devices
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

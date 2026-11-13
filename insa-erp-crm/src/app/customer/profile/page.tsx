"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { putProfile } from "@/lib/api";
import { CheckCircle2, X, Settings } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: any = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        password: password || undefined,
      };
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      const result = await putProfile(payload);
      const updated = result.data || result;
      const updatedUser = { ...user, name: `${updated.firstName || ''} ${updated.lastName || ''}`.trim(), email: updated.email };
      refreshUser(updatedUser as any);
      setNotification("Profile updated successfully");
      setPassword("");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-[#c8102e]" />
          <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
        </div>
        {notification && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-bold text-red-800 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#c8102e] hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

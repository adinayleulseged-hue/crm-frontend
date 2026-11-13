"use client";

import React, { useState } from "react";
import { X, Mail, Send, User, Building2, Phone, CheckCircle, Copy } from "lucide-react";

interface InviteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteCustomerModal({ isOpen, onClose, onSuccess }: InviteCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    customerType: "PRIVATE",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8082/api/customers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCustomerEmail(data.email);
        setEmailSent(data.emailSent || false);
        
        // Only show password if email wasn't sent
        if (data.temporaryPassword) {
          setTemporaryPassword(data.temporaryPassword);
        }
        
        setInvitationSent(true);
        onSuccess();
      } else {
        const errorMsg = data.error || data.message || "Failed to invite customer";
        console.error("Invite customer error:", data);
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Invite customer exception:", error);
      alert("Network error. Please check if the backend is running on port 8082.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    alert("Password copied to clipboard!");
  };

  const handleClose = () => {
    setForm({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      customerType: "PRIVATE",
    });
    setInvitationSent(false);
    setEmailSent(false);
    setTemporaryPassword("");
    setCustomerEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Invite New Customer</h2>
                <p className="text-sm text-blue-100 mt-1">Send login credentials via email</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {!invitationSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g., Ministry of Finance"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="e.g., Abebe Bekele"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+251 911 000000"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Customer Type</label>
                <select
                  value={form.customerType}
                  onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="GOVERNMENT">Government</option>
                  <option value="PRIVATE">Private Company</option>
                  <option value="ORGANIZATION">Organization</option>
                  <option value="NGO">NGO</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 mb-1">Invitation Sent Successfully!</h3>
                  <p className="text-sm text-green-700">
                    Customer account created for <strong>{customerEmail}</strong>
                  </p>
                </div>
              </div>

              {emailSent ? (
                // Email was sent successfully
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-900 mb-1">Email Sent!</h4>
                      <p className="text-sm text-blue-700">
                        Login credentials have been sent to <strong>{customerEmail}</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Customer can login at: <strong>http://localhost:3000/customer-login</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Email failed - show password manually
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-amber-900 mb-3">
                    ⚠️ Email service error. Please share these credentials manually:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Email:</p>
                      <p className="text-sm font-mono text-slate-900">{customerEmail}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-600">Temporary Password:</p>
                        <button
                          onClick={handleCopyPassword}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <p className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                        {temporaryPassword}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-amber-800 mt-3">
                    Customer can login at: <strong>http://localhost:3000/customer-login</strong>
                  </p>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

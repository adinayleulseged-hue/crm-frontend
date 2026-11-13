"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import leadService from "@/services/leadService";
import InsaLogo from "@/components/ui/InsaLogo";

export default function ContactUsPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    jobTitle: "",
    industry: "",
    services: [] as string[],
    budget: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate step 1
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      setError("Please fill in all required fields");
      return;
    }
    
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const servicesText = formData.services.length > 0 
        ? formData.services.join(", ") 
        : "General inquiry";
      
      const budgetText = formData.budget ? `Budget: ${formData.budget}` : "";
      
      const notesText = [
        `Services interested: ${servicesText}`,
        budgetText,
        formData.message,
      ].filter(Boolean).join("\n");

      // Create lead with NEW status (unqualified) - using public endpoint
      await leadService.createLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        industry: formData.industry,
        source: "WEBSITE",
        notes: notesText,
        internalNotes: "Lead submitted via public Contact Us form - pending admin qualification",
      }, true); // Pass true to use public endpoint

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        phone: "",
        jobTitle: "",
        industry: "",
        services: [],
        budget: "",
        message: "",
      });
      setStep(1);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit. Please try again or contact us directly.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071d3a] via-[#0a2744] to-[#071d3a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#071d3a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-lg">
              <InsaLogo size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-white leading-tight">INSA</span>
              <span className="text-[9px] font-semibold text-blue-300 leading-tight uppercase tracking-wide">CRM System</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-[#c8102e] text-white text-sm font-semibold rounded-xl hover:bg-[#a80d26] transition"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {success ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Thank You!
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              We've received your inquiry and our team will review it shortly.
            </p>
            <p className="text-slate-500 mb-8">
              You can expect to hear from us within 1 business day.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-8 py-3 bg-[#c8102e] text-white font-semibold rounded-xl hover:bg-[#a80d26] transition"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#071d3a] to-[#0c2b5b] px-8 py-8 text-center">
              <h1 className="text-3xl font-black text-white mb-2">
                Interested in INSA's Services?
              </h1>
              <p className="text-slate-300">
                Fill in your details and our team will reach out within 1 business day. No commitment required.
              </p>
            </div>

            {/* Step Indicator */}
            <div className="bg-slate-50 px-8 py-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 1 ? "bg-[#c8102e] text-white" : "bg-emerald-500 text-white"
                }`}>
                  {step > 1 ? "✓" : "1"}
                </div>
                <span className={`text-sm font-semibold ${step === 1 ? "text-slate-900" : "text-slate-500"}`}>
                  Your Contact Information
                </span>
              </div>
              <div className="w-12 h-0.5 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 2 ? "bg-[#c8102e] text-white" : "bg-slate-300 text-slate-500"
                }`}>
                  2
                </div>
                <span className={`text-sm font-semibold ${step === 2 ? "text-slate-900" : "text-slate-500"}`}>
                  What are you interested in?
                </span>
              </div>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold">
                  {error}
                </div>
              )}

              {/* Step 1: Contact Information */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <p className="text-sm text-slate-600 mb-6">
                    <strong>Step 1 of 2</strong> — Tell us who you are
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                        placeholder="+251 911 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Organization / Company Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                      placeholder="Your company name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Your Job Title
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                        placeholder="e.g. IT Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Industry
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                      >
                        <option value="">Select...</option>
                        <option value="Government">Government</option>
                        <option value="Banking">Banking & Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#c8102e] text-white font-bold rounded-xl hover:bg-[#a80d26] transition"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Service Interest */}
              {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <p className="text-sm text-slate-600 mb-6">
                    <strong>Step 2 of 2</strong> — Help us understand your needs
                  </p>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Select all that apply
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Network Security Solutions",
                        "Biometric Access Control",
                        "Cybersecurity Audit & Consulting",
                        "Enterprise Software & ERP",
                        "IT Hardware & Infrastructure",
                        "Security Training & Certification",
                      ].map((service) => (
                        <label
                          key={service}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                            formData.services.includes(service)
                              ? "border-[#c8102e] bg-red-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="w-4 h-4 text-[#c8102e] rounded"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {service}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Estimated Budget (ETB)
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                      >
                        <option value="">Not sure yet</option>
                        <option value="Under 500,000">Under 500,000 ETB</option>
                        <option value="500,000 - 1,000,000">500,000 - 1,000,000 ETB</option>
                        <option value="1,000,000 - 5,000,000">1,000,000 - 5,000,000 ETB</option>
                        <option value="Over 5,000,000">Over 5,000,000 ETB</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        When do you need this?
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition"
                      >
                        <option value="">Not sure yet</option>
                        <option value="Immediately">Immediately</option>
                        <option value="Within 1 month">Within 1 month</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3+ months">3+ months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message (optional)
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#c8102e] focus:bg-white transition resize-none"
                      placeholder="Tell us more about what you're looking for, any specific requirements, or questions you have..."
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#c8102e] text-white font-bold rounded-xl hover:bg-[#a80d26] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Interest
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

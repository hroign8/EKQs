"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ChevronLeft, Crown, Check, Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset({ email, redirectTo: "/signin" });
      setSubmitted(true);
    } catch {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold-500"></div>
            <Crown className="w-6 h-6 text-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {submitted ? "Check Your Email" : "Forgot Password?"}
          </h1>
          <p className="text-burgundy-200">
            {submitted 
              ? "We've sent you a reset link" 
              : "We'll help you reset it"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            {!submitted ? (
              <>
                <p className="text-gray-600 text-center mb-6">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-burgundy-900 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    {error && (
                      <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mt-3">
                        {error}
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-burgundy-900 py-4 rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link 
                    href="/signin" 
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-burgundy-900 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                </div>
                <p className="text-gray-600 mb-2">
                  We've sent a password reset link to
                </p>
                <p className="font-semibold text-burgundy-900 mb-6">{email}</p>
                <p className="text-sm text-gray-500 mb-8">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-burgundy-900 py-3 rounded-full font-bold transition-colors"
                  >
                    Try Another Email
                  </button>
                  <Link 
                    href="/signin" 
                    className="block w-full py-3 bg-gray-50 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-all text-center"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

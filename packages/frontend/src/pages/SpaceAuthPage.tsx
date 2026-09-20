import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface SpaceAuthPageProps {
  onAuthSuccess?: (email: string, mode: 'signin' | 'signup') => void;
  onBack?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const SpaceAuthPage: React.FC<SpaceAuthPageProps> = ({
  onAuthSuccess,
  onBack,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSession, setKeepSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { setActive } = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (!signInLoaded || !signUpLoaded) return;
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          onAuthSuccess?.(email, 'signin');
        } else {
          setErrorMsg('Sign in could not be completed. Please try again.');
        }
      } else {
        const result = await signUp.create({ emailAddress: email, password });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          onAuthSuccess?.(email, 'signup');
        } else if (result.status === 'missing_requirements') {
          // Email verification required — send code
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setErrorMsg('Check your email for a verification code. (Email verification flow coming soon)');
        } else {
          setErrorMsg('Account creation could not be completed. Please try again.');
        }
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'An error occurred. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    if (!signInLoaded) return;
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_github',
        redirectUrl: window.location.origin,
        redirectUrlComplete: window.location.origin,
      });
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || 'OAuth sign-in failed. Please try again.';
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-[#030308] text-[#e4e1ec] font-sans selection:bg-[#38bdf8] selection:text-[#00354a] overflow-x-hidden">
      {/* Dynamic Cosmic Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full opacity-60 filter blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(76, 29, 149, 0.4) 0%, rgba(30, 27, 75, 0.15) 70%, transparent 100%)'
          }}
        />
        <div 
          className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full opacity-50 filter blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.08) 60%, transparent 100%)'
          }}
        />
        <div 
          className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] rounded-full opacity-40 filter blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(76, 29, 149, 0.35) 0%, rgba(30, 27, 75, 0.1) 70%, transparent 100%)'
          }}
        />
        
        {/* Starfield simulation */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 40px 60px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 120px 180px, rgba(142, 213, 255, 0.8), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 280px 90px, rgba(211, 187, 255, 0.9), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 450px 320px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 620px 140px, rgba(123, 208, 255, 0.7), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 800px 240px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 950px 380px, rgba(203, 199, 255, 0.6), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 1120px 80px, rgba(56, 189, 248, 0.9), rgba(0,0,0,0))
            `,
            backgroundRepeat: 'repeat',
            backgroundSize: '1200px 500px'
          }}
        />

        {/* Fine observatory instrument matrix grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative z-10 flex flex-col flex-1 w-full">
        {/* Top Observatory Header */}
        <header className="w-full px-6 md:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
          {/* Back Navigation */}
          <button
            onClick={onBack}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0a14]/80 border border-white/10 hover:border-[#38bdf8]/50 text-[#94a3b8] hover:text-[#38bdf8] transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="text-xs font-medium tracking-wide">Back</span>
          </button>

          {/* Brand Identity & Versioning */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
                Research Paper Analyzer
              </span>

            </div>
          </div>
        </header>

        {/* Center Analytical Authentication Container */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[480px]">
            {/* Starlight Glassmorphic Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative rounded-3xl p-8 md:p-10 transition-all duration-300 backdrop-blur-2xl bg-[#0a0a14]/75 border border-white/10 shadow-[0_0_50px_-10px_rgba(56,189,248,0.15),0_25px_50px_-12px_rgba(0,0,0,0.8)]"
            >
              {/* Top Hairline Starlight Accent */}
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/80 to-transparent pointer-events-none" />

              {/* Mode Switcher Pill */}
              <div className="flex p-1 mb-8 rounded-full bg-black/60 border border-white/10 relative">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(''); }}
                  className={`flex-1 py-2 text-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    mode === 'signin'
                      ? 'bg-[#38bdf8] text-[#00354a] shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(''); }}
                  className={`flex-1 py-2 text-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    mode === 'signup'
                      ? 'bg-[#38bdf8] text-[#00354a] shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Headline & Contextual Subtext */}
              <div className="mb-8 text-center sm:text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                      {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">
                      {mode === 'signin'
                        ? 'Sign in to access your papers and analysis history.'
                        : 'Get started with AuraScholar. It only takes a moment.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Federated Social Logins */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                  className="group flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 transition-all duration-200 active:scale-[0.98] text-white text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" fill="#EA4335" />
                    <path d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" fill="#4285F4" />
                    <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" fill="#FBBC05" />
                    <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" fill="#34A853" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('github')}
                  disabled={isLoading}
                  className="group flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 transition-all duration-200 active:scale-[0.98] text-white text-xs font-medium"
                >
                  <svg className="w-4 h-4 fill-white group-hover:fill-[#38bdf8] transition-colors" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#080812] px-3 font-mono text-[10px] text-[#64748b] tracking-wider uppercase">
                  Or Continue With Email
                </span>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs text-[#cbd5e1] font-medium mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-[#64748b] w-4 h-4 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-[#64748b] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs text-[#cbd5e1] font-medium">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <a href="#" className="text-xs text-[#38bdf8] hover:underline transition-colors">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-[#64748b] w-4 h-4 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-[#64748b] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#64748b] hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Session persistence checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepSession}
                      onChange={(e) => setKeepSession(e.target.checked)}
                      className="w-4 h-4 rounded bg-black/40 border border-white/20 text-[#38bdf8] focus:ring-0 focus:ring-offset-0 focus:border-[#38bdf8] cursor-pointer"
                    />
                    <span className="text-xs text-[#cbd5e1]">Keep me signed in</span>
                  </label>
                </div>

                {/* Primary Celestial CTA */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-[#00354a] bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00354a]" />
                    ) : (
                      <Sparkles className="w-4 h-4 fill-current" />
                    )}
                    <span>
                      {isLoading
                        ? 'Signing in...'
                        : mode === 'signin'
                        ? 'Sign In'
                        : 'Create Account'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Security & Integrity Protocol Footer */}
              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[#94a3b8]">
                <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                <span className="text-[11px] font-medium tracking-tight">
                  Encrypted • No data sold or shared
                </span>
              </div>
            </motion.div>

            {/* Analytical Ingestion Metadata Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#592da2]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                <span>arXiv, PubMed &amp; IEEE</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#592da2]/20 border border-[#c4c1fb]/30 text-[#c4c1fb] text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c4c1fb] animate-pulse" />
                <span>Multi-model AI analysis</span>
              </div>
            </div>
          </div>
        </main>

        {/* Institutional Footer Anchor */}
        <footer className="w-full relative border-t border-white/10 bg-[#06060c]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
              <span>© 2025 AuraScholar. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[11px]">
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span>API Status: Operational</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SpaceAuthPage;

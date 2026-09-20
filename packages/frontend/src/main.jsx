import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Match Clerk's built-in UI (email verification, error screens, etc.)
// to AuraScholar's dark cosmic theme.
const clerkAppearance = {
  layout: {
    logoPlacement: 'none',
    showOptionalFields: false,
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    colorPrimary: '#38bdf8',
    colorBackground: '#0a0a14',
    colorInputBackground: '#0d0d1a',
    colorInputText: '#e4e1ec',
    colorText: '#e4e1ec',
    colorTextSecondary: '#94a3b8',
    colorDanger: '#f87171',
    colorSuccess: '#34d399',
    colorNeutral: '#1e1b4b',
    borderRadius: '0.75rem',
    fontFamily: '"Hanken Grotesk", sans-serif',
    fontFamilyButtons: '"Space Grotesk", sans-serif',
    fontSize: '14px',
  },
  elements: {
    card: 'bg-[#0a0a14] border border-white/10 shadow-2xl rounded-2xl',
    headerTitle: 'text-white font-display font-bold',
    headerSubtitle: 'text-slate-400',
    formButtonPrimary:
      'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-[#00354a] font-bold uppercase tracking-wider hover:brightness-110 transition-all',
    formFieldInput:
      'bg-black/40 border-white/10 text-white placeholder-slate-600 focus:border-[#38bdf8] rounded-xl',
    formFieldLabel: 'text-slate-300 text-xs font-medium',
    footerActionLink: 'text-[#38bdf8] hover:text-white',
    identityPreviewText: 'text-slate-300',
    identityPreviewEditButton: 'text-[#38bdf8]',
    dividerLine: 'bg-white/10',
    dividerText: 'text-slate-500',
    socialButtonsBlockButton:
      'bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all',
    socialButtonsBlockButtonText: 'text-white text-sm font-medium',
    alert: 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl',
    alertText: 'text-red-300 text-xs',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        // Navigation — keep all auth flows inside the app, never bounce to accounts.dev
        signInUrl="/"
        signUpUrl="/"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        afterSignOutUrl="/"
        // Security — only allow redirects to our own origins
        allowedRedirectOrigins={[
          'http://localhost:5173',
          'http://localhost:3000',
          import.meta.env.VITE_FRONTEND_URL,
        ].filter(Boolean)}
        // Appearance — match the cosmic dark theme
        appearance={clerkAppearance}
      >
        <App isGuestMode={false} />
      </ClerkProvider>
    ) : (
      <App isGuestMode={true} />
    )}
  </React.StrictMode>
);

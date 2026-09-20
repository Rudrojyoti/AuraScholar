import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { HeroSection } from './components/ui/hero-section';
import Dashboard from './pages/Dashboard';
import SpaceAuthPage from './pages/SpaceAuthPage';
import SettingsModal from './components/ui/SettingsModal';

// Detect if this page load is a Clerk OAuth callback
// We add ?clerk_callback=1 to the redirectUrl so we can reliably detect it
const isSSOCallback = () => new URLSearchParams(window.location.search).has('clerk_callback');

// Sub-component for Clerk Authenticated Flow
function ClerkAppContent({ onOpenSettings }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  // Prevent flash of landing page while Clerk resolves session state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#030308] flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin shadow-[0_0_20px_rgba(56,189,248,0.3)]" />
          <div className="absolute w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <Dashboard 
        user={user}
        userEmail={user?.primaryEmailAddress?.emailAddress}
        onLogout={handleLogout}
        onOpenSettings={onOpenSettings}
        getToken={getToken}
      />
    );
  }

  return (
    <>
      {!showSignIn ? (
        <HeroSection onGetStarted={() => setShowSignIn(true)} />
      ) : (
        <SpaceAuthPage 
          onBack={() => setShowSignIn(false)} 
          onAuthSuccess={() => setShowSignIn(false)} 
        />
      )}
    </>
  );
}

// Sub-component for Standalone / Guest Mode (Zero-Config)
function GuestAppContent({ onOpenSettings }) {
  const [currentView, setCurrentView] = useState('landing'); // landing, auth, dashboard
  const [guestEmail, setGuestEmail] = useState('researcher@demo.com');

  return (
    <>
      {currentView === 'landing' && (
        <HeroSection onGetStarted={() => setCurrentView('auth')} />
      )}

      {currentView === 'auth' && (
        <SpaceAuthPage 
          onBack={() => setCurrentView('landing')}
          onAuthSuccess={(email) => {
            if (email) setGuestEmail(email);
            setCurrentView('dashboard');
          }}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          userEmail={guestEmail}
          onLogout={() => setCurrentView('landing')}
          onOpenSettings={onOpenSettings}
          getToken={async () => null}
        />
      )}
    </>
  );
}

// Seamless OAuth Callback Handler
// Completes token exchange, cleans URL params via replaceState, and transitions straight to the dashboard
function SSOCallbackHandler({ onComplete }) {
  const clerk = useClerk();

  useEffect(() => {
    let active = true;

    async function processCallback() {
      try {
        if (clerk && typeof clerk.handleRedirectCallback === 'function') {
          await clerk.handleRedirectCallback({
            afterSignInUrl: window.location.origin,
            afterSignUpUrl: window.location.origin,
            signInFallbackRedirectUrl: window.location.origin,
            signUpFallbackRedirectUrl: window.location.origin,
          });
        }
      } catch (err) {
        console.error('SSO Callback error:', err);
      } finally {
        if (active) {
          // Clean the OAuth callback query param from the address bar
          window.history.replaceState(null, '', window.location.origin);
          // Small buffer to let Clerk's reactive state propagate isSignedIn=true
          setTimeout(() => {
            if (active) onComplete();
          }, 100);
        }
      }
    }

    processCallback();

    return () => {
      active = false;
    };
  }, [clerk, onComplete]);

  return (
    <div className="min-h-screen bg-[#030308] flex flex-col items-center justify-center text-white font-sans selection:bg-[#38bdf8]">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin shadow-[0_0_25px_rgba(56,189,248,0.4)]" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
      </div>
      <div className="text-center space-y-1.5 px-4">
        <h2 className="text-base font-semibold tracking-tight text-white font-display">
          Authenticating Research Session
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Finalizing credentials and loading dashboard...
        </p>
      </div>
    </div>
  );
}

function App({ isGuestMode = false }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCallback, setIsCallback] = useState(() => !isGuestMode && isSSOCallback());

  // Handle OAuth redirect from Clerk (Google, GitHub, etc.)
  // Automatically completes token exchange and cleanly enters the dashboard without any manual page reload
  if (!isGuestMode && isCallback) {
    return <SSOCallbackHandler onComplete={() => setIsCallback(false)} />;
  }

  return (
    <div className="w-full min-h-screen">
      {isGuestMode ? (
        <GuestAppContent onOpenSettings={() => setIsSettingsOpen(true)} />
      ) : (
        <ClerkAppContent onOpenSettings={() => setIsSettingsOpen(true)} />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userEmail={isGuestMode ? "researcher@demo.com" : undefined} 
      />
    </div>
  );
}

export default App;

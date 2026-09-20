import React, { useState } from 'react';
import { SignedIn, SignedOut, useUser, useClerk, useAuth, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
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
  const { getToken } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <SignedOut>
        {!showSignIn ? (
          <HeroSection onGetStarted={() => setShowSignIn(true)} />
        ) : (
          <SpaceAuthPage 
            onBack={() => setShowSignIn(false)} 
            onAuthSuccess={() => setShowSignIn(false)} 
          />
        )}
      </SignedOut>

      <SignedIn>
        <Dashboard 
          userEmail={user?.primaryEmailAddress?.emailAddress}
          onLogout={handleLogout}
          onOpenSettings={onOpenSettings}
          getToken={getToken}
        />
      </SignedIn>
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

function App({ isGuestMode = false }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle OAuth redirect from Clerk (Google, GitHub, etc.)
  // Clerk sends the user back to /#/sso-callback — this component
  // completes the token exchange and then redirects to the root.
  if (!isGuestMode && isSSOCallback()) {
    return (
      <AuthenticateWithRedirectCallback
        afterSignInUrl={window.location.origin}
        afterSignUpUrl={window.location.origin}
      />
    );
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

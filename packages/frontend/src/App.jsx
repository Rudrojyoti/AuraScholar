import React, { useState } from 'react';
import { SignedIn, SignedOut, SignIn, useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { HeroSection } from './components/ui/hero-section';
import PaperAnalyzer from './pages/PaperAnalyzer';
import Dashboard from './pages/Dashboard';
import SettingsModal from './components/ui/SettingsModal';
import { Click } from './components/ui/click';
import { CursorProvider, Cursor, CursorFollow } from './components/ui/cursor';

// Sub-component for Clerk Authenticated Flow
function ClerkAppContent({ onOpenSettings }) {
  const [currentView, setCurrentView] = useState('dashboard');
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
          <div className="flex items-center justify-center min-h-screen bg-black/95">
            <SignIn fallbackRedirectUrl="/" />
          </div>
        )}
      </SignedOut>

      <SignedIn>
        {currentView === 'dashboard' && (
          <Dashboard 
            userEmail={user?.primaryEmailAddress?.emailAddress}
            onLogout={handleLogout}
            onUploadNew={() => setCurrentView('app')}
            onOpenPaper={() => setCurrentView('app')} 
            onOpenSettings={onOpenSettings}
          />
        )}
        
        {currentView === 'app' && (
          <PaperAnalyzer 
            userEmail={user?.primaryEmailAddress?.emailAddress} 
            onLogout={handleLogout} 
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenSettings={onOpenSettings}
            getToken={getToken}
          />
        )}
      </SignedIn>
    </>
  );
}

// Sub-component for Standalone / Guest Mode (Zero-Config)
function GuestAppContent({ onOpenSettings }) {
  const [currentView, setCurrentView] = useState('landing'); // landing, dashboard, app
  const [guestEmail, setGuestEmail] = useState('researcher@demo.com');

  return (
    <>
      {currentView === 'landing' && (
        <HeroSection onGetStarted={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          userEmail={guestEmail}
          onLogout={() => setCurrentView('landing')}
          onUploadNew={() => setCurrentView('app')}
          onOpenPaper={() => setCurrentView('app')} 
          onOpenSettings={onOpenSettings}
        />
      )}

      {currentView === 'app' && (
        <PaperAnalyzer 
          userEmail={guestEmail} 
          onLogout={() => setCurrentView('landing')} 
          onBackToDashboard={() => setCurrentView('dashboard')}
          onOpenSettings={onOpenSettings}
          getToken={async () => null}
        />
      )}
    </>
  );
}

function App({ isGuestMode = false }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <CursorProvider global={true}>
      <Cursor />
      <CursorFollow />
      <Click variant="particles" color="rgba(56, 189, 248, 0.6)" size={80} duration={600}>
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
      </Click>
    </CursorProvider>
  );
}

export default App;

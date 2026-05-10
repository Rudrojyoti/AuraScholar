import React, { useState } from 'react';
import { SignedIn, SignedOut, SignIn, useUser, useClerk } from "@clerk/clerk-react";
import { HeroSection } from './components/ui/hero-section';
import PaperAnalyzer from './pages/PaperAnalyzer';
import Dashboard from './pages/Dashboard';
import SettingsModal from './components/ui/SettingsModal';
import { Click } from './components/ui/click';
import { CursorProvider, Cursor, CursorFollow } from './components/ui/cursor';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, app
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut();
  };

  return (
    <CursorProvider global={true}>
      <Cursor />
      <CursorFollow />
      <Click variant="particles" color="rgba(56, 189, 248, 0.6)" size={80} duration={600}>
        <div className="w-full min-h-screen">
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
                onOpenPaper={(paper) => setCurrentView('app')} 
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}
            
            {currentView === 'app' && (
              <PaperAnalyzer 
                userEmail={user?.primaryEmailAddress?.emailAddress} 
                onLogout={handleLogout} 
                onBackToDashboard={() => setCurrentView('dashboard')}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
              userEmail={user?.primaryEmailAddress?.emailAddress} 
            />
          </SignedIn>
        </div>
      </Click>
    </CursorProvider>
  );
}

export default App;

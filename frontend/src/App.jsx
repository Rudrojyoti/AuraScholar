import React, { useState } from 'react';
import { HeroSection } from './components/ui/hero-section';
import { SignInPage } from './components/ui/sign-in-flow-1';
import { SignInPageNew } from './components/ui/sign-in-flow-new';
import PaperAnalyzer from './pages/PaperAnalyzer';
import Dashboard from './pages/Dashboard';
import SettingsModal from './components/ui/SettingsModal';
import { Click } from './components/ui/click';
import { CursorProvider, Cursor, CursorFollow } from './components/ui/cursor';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, signin, dashboard, app
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [signInVersion, setSignInVersion] = useState('old');

  const handleSignInSuccess = (email) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setCurrentView('landing');
  };

  const handleGetStarted = () => {
    setCurrentView('signin');
  };

  return (
    <CursorProvider global={true}>
      <Cursor />
      <CursorFollow />
      <Click variant="particles" color="rgba(56, 189, 248, 0.6)" size={80} duration={600}>
        <div className="w-full h-screen">
          {currentView === 'landing' && (
        <HeroSection onGetStarted={handleGetStarted} />
      )}
      
      {currentView === 'signin' && (
        <div className="relative">
          {/* Version Selector */}
          <div className="absolute top-4 left-4 z-30 bg-black/50 backdrop-blur-md rounded-lg p-2 border border-white/10">
            <div className="flex gap-2">
              <button
                onClick={() => setSignInVersion('old')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  signInVersion === 'old' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setSignInVersion('new')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  signInVersion === 'new' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                New
              </button>
            </div>
          </div>
          
          {/* Render selected sign-in version */}
          {signInVersion === 'old' ? (
            <SignInPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <SignInPageNew onSignInSuccess={handleSignInSuccess} />
          )}
        </div>
      )}
      
      {currentView === 'dashboard' && (
        <Dashboard 
          userEmail={userEmail}
          onLogout={handleLogout}
          onUploadNew={() => setCurrentView('app')}
          onOpenPaper={(paper) => setCurrentView('app')} // Pass paper state in a real app
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}
      
      {currentView === 'app' && (
        <PaperAnalyzer 
          userEmail={userEmail} 
          onLogout={handleLogout} 
          onBackToDashboard={() => setCurrentView('dashboard')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          userEmail={userEmail} 
        />
        </div>
      </Click>
    </CursorProvider>
  );
}

export default App;

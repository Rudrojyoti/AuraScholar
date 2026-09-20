import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInUrl="/"
        signUpUrl="/"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        afterSignOutUrl="/"
      >
        <App isGuestMode={false} />
      </ClerkProvider>
    ) : (
      <App isGuestMode={true} />
    )}
  </React.StrictMode>
);

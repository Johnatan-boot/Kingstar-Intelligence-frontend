import React from 'react';
import { ShellProvider } from './apps/shell/ShellProvider';
import { ShellLayout } from './apps/shell/ShellLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './apps/shell/AuthPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <ShellProvider>
      <ShellLayout />
    </ShellProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

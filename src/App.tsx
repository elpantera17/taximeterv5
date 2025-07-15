import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { UpdateModal } from './components/UpdateModal';
import { useVersionCheck } from './hooks/useVersionCheck';
import { Home } from './pages/Home';
import { Statistics } from './pages/Statistics';
import { Trips } from './pages/Trips';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { WorkGroups } from './pages/WorkGroups';
import { GroupFareCategories } from './pages/GroupFareCategories';

function AppContent() {
  const { state } = useApp();
  const { state: authState } = useAuth();
  const { needsUpdate, versionInfo, loading: versionLoading } = useVersionCheck();

  useEffect(() => {
    // Apply theme on mount and when theme changes
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'night');
    root.classList.add(state.settings.theme);
    
    if (state.settings.theme === 'dark' || state.settings.theme === 'night') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Show update modal if update is required (highest priority)
  if (!versionLoading && needsUpdate && versionInfo) {
    return (
      <UpdateModal
        currentVersion={versionInfo.currentVersion}
        requiredVersion={versionInfo.requiredVersion}
        downloadUrl={versionInfo.downloadUrl}
        allowClose={false} // No permitir cerrar si es obligatoria
      />
    );
  }

  // Show login if not authenticated
  if (!authState.isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Admin route - full screen */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Regular app routes with sidebar */}
        <Route path="/*" element={
          <>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden md:ml-80">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/workgroups" element={<WorkGroups />} />
                <Route path="/groupfares" element={<GroupFareCategories />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
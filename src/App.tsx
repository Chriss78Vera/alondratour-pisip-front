import { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ReservationList } from './pages/reservations/ReservationList';
import { CreateReservation } from './pages/reservations/CreateReservation';
import { PackageList } from './pages/packages/PackageList';
import { CreatePackage } from './pages/packages/CreatePackage';
import { Login } from './pages/login/Login';
import { getToken, loginToken } from './services/oauth';

type Page = 'home' | 'packages';
type View = 'list' | 'create';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentView, setCurrentView] = useState<View>('list');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    loginToken(token)
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    const { logout } = await import('./services/oauth');
    await logout();
    setAuthenticated(false);
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setCurrentView('list');
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleBackToList = () => {
    setCurrentView('list');
  };

  const renderContent = () => {
    if (currentPage === 'home') {
      return currentView === 'list' ? (
        <ReservationList onCreateNew={handleCreateNew} />
      ) : (
        <CreateReservation onBack={handleBackToList} />
      );
    } else {
      return currentView === 'list' ? (
        <PackageList onCreateNew={handleCreateNew} />
      ) : (
        <CreatePackage onBack={handleBackToList} />
      );
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} children={renderContent()} />
  );
}

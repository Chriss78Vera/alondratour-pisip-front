import { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ReservationList } from './pages/reservations/ReservationList';
import { CreateReservation } from './pages/reservations/CreateReservation';
import { PackageList } from './pages/packages/PackageList';
import { CreatePackage } from './pages/packages/CreatePackage';
import { UserList } from './pages/usuarios/UserList';
import { Login } from './pages/login/Login';
import { getToken, loginToken } from './services/oauth';
import { getUserInformation } from './services/usuarios';

type Page = 'home' | 'packages' | 'usuarios';
type View = 'list' | 'create';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRol, setUserRol] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentView, setCurrentView] = useState<View>('list');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    loginToken(token)
      .then(() => {
        setAuthenticated(true);
        return getUserInformation(token);
      })
      .then((info) => setUserRol(info.rol ?? null))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAuthenticated(true);
    const token = getToken();
    if (token) {
      getUserInformation(token).then((info) => setUserRol(info.rol ?? null));
    }
  }, []);

  const handleLogout = useCallback(async () => {
    const { logout } = await import('./services/oauth');
    await logout();
    setAuthenticated(false);
    setUserRol(null);
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
    }
    if (currentPage === 'packages') {
      return currentView === 'list' ? (
        <PackageList onCreateNew={handleCreateNew} />
      ) : (
        <CreatePackage onBack={handleBackToList} />
      );
    }
    if (currentPage === 'usuarios') {
      if (userRol !== 'Admin') return null;
      return <UserList />;
    }
    return null;
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
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userRol={userRol}
    >
      {renderContent()}
    </Layout>
  );
}

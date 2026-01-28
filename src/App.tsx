import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ReservationList } from './pages/reservations/ReservationList';
import { CreateReservation } from './pages/reservations/CreateReservation';
import { PackageList } from './pages/packages/PackageList';
import { CreatePackage } from './pages/packages/CreatePackage';

type Page = 'home' | 'packages';
type View = 'list' | 'create';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentView, setCurrentView] = useState<View>('list');

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

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} children={renderContent()} />
  );
}

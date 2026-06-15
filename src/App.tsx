import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SoakingPage from './pages/Soaking';
import SteamingPage from './pages/Steaming';
import FermentationPage from './pages/Fermentation';
import AgingPage from './pages/Aging';
import PressingPage from './pages/Pressing';
import CellarPage from './pages/Cellar';
import SalesPage from './pages/Sales';

const pageTitleMap: Record<string, string> = {
  '/dashboard': '数据看板',
  '/soaking': '糯米浸泡',
  '/steaming': '蒸饭落缸',
  '/fermentation': '前酵开耙',
  '/aging': '后酵养醅',
  '/pressing': '压榨煎酒',
  '/cellar': '陈酿装坛',
  '/sales': '成品销售',
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const pageTitle = pageTitleMap[currentPath] || '数据看板';

  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
      case '/':
        return <Dashboard />;
      case '/soaking':
        return <SoakingPage />;
      case '/steaming':
        return <SteamingPage />;
      case '/fermentation':
        return <FermentationPage />;
      case '/aging':
        return <AgingPage />;
      case '/pressing':
        return <PressingPage />;
      case '/cellar':
        return <CellarPage />;
      case '/sales':
        return <SalesPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPath={currentPath === '/' ? '/dashboard' : currentPath} 
      onNavigate={handleNavigate}
      pageTitle={pageTitle}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return <AppContent />;
}

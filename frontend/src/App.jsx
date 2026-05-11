import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SideCart from './components/SideCart';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ClientArea from './pages/ClientArea';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderSent from './pages/OrderSent';

function App() {
  const location = useLocation();
  const hideLayout = location.pathname === '/auth';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {!hideLayout && <SideCart />}
      {!hideLayout && <Header />}

      <main className="app-main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/cliente" element={<ClientArea />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/produto/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/enviado" element={<OrderSent />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;

import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SideCart from './components/SideCart';
import CookieBanner from './components/CookieBanner';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import Home from './pages/Home';

const Catalog = lazy(() => import('./pages/Catalog'));
const ClientArea = lazy(() => import('./pages/ClientArea'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PixPayment = lazy(() => import('./pages/PixPayment'));
const CartaoRetorno = lazy(() => import('./pages/CartaoRetorno'));
const OrderSent = lazy(() => import('./pages/OrderSent'));
const PoliticaPrivacidade = lazy(() => import('./pages/PoliticaPrivacidade'));
const TermosUso = lazy(() => import('./pages/TermosUso'));
const TrocasDevolucoes = lazy(() => import('./pages/TrocasDevolucoes'));

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
          <Suspense fallback={<Loading texto="Carregando..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/cliente" element={<ClientArea />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pagamento/pix/:pedidoId" element={<PixPayment />} />
              <Route path="/pagamento/cartao/:pedidoId/retorno" element={<CartaoRetorno />} />
              <Route path="/pedido/enviado" element={<OrderSent />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/termos-de-uso" element={<TermosUso />} />
              <Route path="/trocas-e-devolucoes" element={<TrocasDevolucoes />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {!hideLayout && <Footer />}
      <CookieBanner />
    </div>
  );
}

export default App;

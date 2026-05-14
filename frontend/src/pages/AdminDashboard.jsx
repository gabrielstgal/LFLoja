import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { buscarProdutos } from '../services/produtoService';
import { todosPedidos } from '../services/pedidoService';
import { listarCupons } from '../services/cupomService';
import { listarCategorias } from '../services/categoriaService';
import { listarTodosBanners } from '../services/bannerService';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminCoupons from './admin/AdminCoupons';
import AdminCategories from './admin/AdminCategories';
import AdminBanners from './admin/AdminBanners';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ANALYTICS');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadProducts = () =>
    buscarProdutos({ tamanho: 100 })
      .then(d => setProducts(Array.isArray(d) ? d : d?.content || []))
      .catch(() => setProducts([]));

  const loadOrders = () =>
    todosPedidos().then(setOrders).catch(() => setOrders([]));

  const loadCupons = () =>
    listarCupons().then(setCupons).catch(() => setCupons([]));

  const loadCategorias = () =>
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));

  const loadBanners = () =>
    listarTodosBanners().then(setBannersList).catch(() => setBannersList([]));

  useEffect(() => {
    if (!user || !isAdmin) { toast.error("Administradores apenas."); navigate('/'); return; }
    Promise.all([loadProducts(), loadOrders(), loadCupons(), loadCategorias(), loadBanners()])
      .finally(() => setLoadingData(false));
  }, [user, isAdmin, navigate]);

  if (!isAdmin) return null;
  if (loadingData) return <Loading texto="Carregando painel administrativo..." />;

  const pendingCount = orders.filter(o => o.status === 'PENDENTE').length;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">LF</div>
          <div>
            <h3 className="admin-sidebar-title">Painel Lojista</h3>
            <span className="admin-sidebar-subtitle">Admin Workspace</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button onClick={() => setActiveTab('ANALYTICS')} className={`admin-tab ${activeTab === 'ANALYTICS' ? 'active' : ''}`}>Visão Geral</button>
          <button onClick={() => setActiveTab('ORDERS')} className={`admin-tab ${activeTab === 'ORDERS' ? 'active' : ''}`}>
            Pedidos {pendingCount > 0 && <span className="admin-tab-badge">{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveTab('PRODUCTS')} className={`admin-tab ${activeTab === 'PRODUCTS' ? 'active' : ''}`}>Produtos</button>
          <button onClick={() => setActiveTab('CUPONS')} className={`admin-tab ${activeTab === 'CUPONS' ? 'active' : ''}`}>Cupons</button>
          <button onClick={() => setActiveTab('CATEGORIAS')} className={`admin-tab ${activeTab === 'CATEGORIAS' ? 'active' : ''}`}>Categorias</button>
          <button onClick={() => setActiveTab('BANNERS')} className={`admin-tab ${activeTab === 'BANNERS' ? 'active' : ''}`}>Banners</button>
        </nav>
      </aside>

      <div className="admin-main">
        {activeTab === 'ANALYTICS' && <AdminAnalytics orders={orders} products={products} />}
        {activeTab === 'ORDERS' && <AdminOrders orders={orders} onReload={loadOrders} onReloadProducts={loadProducts} />}
        {activeTab === 'PRODUCTS' && <AdminProducts products={products} categorias={categorias} onReload={loadProducts} />}
        {activeTab === 'CUPONS' && <AdminCoupons cupons={cupons} onReload={loadCupons} />}
        {activeTab === 'CATEGORIAS' && <AdminCategories categorias={categorias} onReload={loadCategorias} />}
        {activeTab === 'BANNERS' && <AdminBanners bannersList={bannersList} categorias={categorias} onReload={loadBanners} />}
      </div>
    </div>
  );
};

export default AdminDashboard;

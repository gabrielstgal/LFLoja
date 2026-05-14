import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Loading from '../components/Loading';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { meusPedidos } from '../services/pedidoService';
import OrdersTab from './client/OrdersTab';
import FavoritesTab from './client/FavoritesTab';
import ProfileTab from './client/ProfileTab';
import './ClientArea.css';

const ClientArea = () => {
  const { user, logout } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const abaParam = searchParams.get('aba') || 'pedidos';
  const [activeTab, setActiveTab] = useState(abaParam);

  useEffect(() => {
    const aba = searchParams.get('aba');
    if (aba && ['pedidos', 'favoritos', 'dados'].includes(aba)) {
      setActiveTab(aba);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    meusPedidos()
      .then(data => setOrders(data))
      .catch(() => { setOrders([]); toast.error('Erro ao carregar pedidos. Verifique sua conexão.'); })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ aba: tab });
  };

  if (!user) return null;
  if (loading) return <Loading texto="Carregando sua área..." />;

  return (
    <div className="client-container">
      <div className="client-tabs">
        <button className={`client-tab ${activeTab === 'pedidos' ? 'client-tab-active' : ''}`} onClick={() => handleTabChange('pedidos')}>
          Pedidos ({orders.length})
        </button>
        <button className={`client-tab ${activeTab === 'favoritos' ? 'client-tab-active' : ''}`} onClick={() => handleTabChange('favoritos')}>
          Favoritos ({favorites.length})
        </button>
        <button className={`client-tab ${activeTab === 'dados' ? 'client-tab-active' : ''}`} onClick={() => handleTabChange('dados')}>
          Meus Dados
        </button>
        <button className="client-tab client-tab-logout" onClick={() => { logout(); navigate('/'); }}>Sair</button>
      </div>

      <div className="client-main">
        {activeTab === 'pedidos' && <OrdersTab orders={orders} />}
        {activeTab === 'favoritos' && <FavoritesTab favorites={favorites} toggleFavorite={toggleFavorite} />}
        {activeTab === 'dados' && <ProfileTab user={user} />}
      </div>
    </div>
  );
};

export default ClientArea;

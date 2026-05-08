import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Loading from '../components/Loading';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ClientArea.css';

const STATUS_LABELS = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const STATUS_STEPS = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE'];

const OrderTracker = ({ status }) => {
  if (status === 'CANCELADO') {
    return <div className="order-tracker-canceled">Pedido cancelado</div>;
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="order-tracker">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        const active = idx === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className={`order-tracker-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
              <div className="order-tracker-dot">
                {done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="order-tracker-label">{STATUS_LABELS[step]}</span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`order-tracker-line ${idx < currentIndex ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ClientArea = () => {
  const { user, logout } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const abaParam = searchParams.get('aba') || 'pedidos';
  const [activeTab, setActiveTab] = useState(abaParam);

  // Form state for "Meus Dados"
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const aba = searchParams.get('aba');
    if (aba && ['pedidos', 'favoritos', 'dados'].includes(aba)) {
      setActiveTab(aba);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    setNome(user.nome || '');
    setEmail(user.email || '');

    api.get('/pedidos/meus')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        data.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
        setOrders(data);
      })
      .catch(() => { setOrders([]); toast.error('Erro ao carregar pedidos. Verifique sua conexão.'); })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ aba: tab });
  };

  const handleSalvarDados = async (e) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error('Nome não pode ficar vazio.'); return; }
    setSalvando(true);
    try {
      const payload = { nome: nome.trim() };
      if (senhaAtual && novaSenha) {
        if (novaSenha.length < 8) {
          toast.error('A nova senha deve ter no mínimo 8 caracteres.');
          setSalvando(false);
          return;
        }
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
      }
      const res = await api.put('/autenticacao/atualizar', payload);
      toast.success('Dados atualizados com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      // Update user in context by refreshing /me
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.erro || 'Erro ao atualizar dados.');
    } finally {
      setSalvando(false);
    }
  };

  if (!user) return null;
  if (loading) return <Loading texto="Carregando sua área..." />;

  const getStatusClass = (status) => {
    if (status === 'PAGO' || status === 'ENVIADO' || status === 'ENTREGUE') return 'client-status-ok';
    if (status === 'CANCELADO') return 'client-status-canceled';
    return 'client-status-pending';
  };

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
        {/* === ABA PEDIDOS === */}
        {activeTab === 'pedidos' && (
          <>
            <h2 className="client-title">Meus Pedidos</h2>
            {orders.length === 0 ? (
              <p className="client-empty">Você ainda não realizou nenhum pedido conosco.</p>
            ) : (
              <div className="client-orders">
                {orders.map(order => (
                  <div key={order.id} className="client-order-card">
                    <div className="client-order-header">
                      <span className="client-order-protocolo">{order.protocolo || `#${order.id}`}</span>
                      <span className="client-order-date">{new Date(order.dataCriacao).toLocaleDateString('pt-BR')}</span>
                      <span className="client-order-total">R$ {order.valorTotal.toFixed(2)}</span>
                      <span className={`client-order-status ${getStatusClass(order.status)}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="client-order-tracker-wrapper">
                      <OrderTracker status={order.status} />
                    </div>

                    <div className="client-order-items">
                      {order.itens.map(item => (
                        <div key={item.id} className="client-order-item">
                          <img src={item.produto?.urlImagem} alt={item.produto?.nome} className="client-order-item-img" loading="lazy" />
                          <div className="client-order-item-info">
                            <span className="client-order-item-name">{item.produto?.nome || 'Produto Não Disponível'}</span>
                            <span className="client-order-item-detail">
                              {item.tamanho ? `Tam: ${item.tamanho} | ` : ''}Qtd: {item.quantidade} | R$ {item.preco.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* === ABA FAVORITOS === */}
        {activeTab === 'favoritos' && (
          <>
            <h2 className="client-title">Meus Favoritos</h2>
            {favorites.length === 0 ? (
              <p className="client-empty">Você ainda não adicionou nenhum produto aos favoritos.</p>
            ) : (
              <div className="client-favorites-grid">
                {favorites.map(product => (
                  <div key={product.id} className="client-fav-card" onClick={() => navigate(`/produto/${product.id}`)}>
                    <img src={product.urlImagem} alt={product.nome} className="client-fav-img" loading="lazy" />
                    <div className="client-fav-info">
                      <span className="client-fav-category">{product.categoria}</span>
                      <h4 className="client-fav-name">{product.nome}</h4>
                      {product.precoPromocional && product.precoPromocional < product.preco ? (
                        <div className="client-fav-price-wrapper">
                          <span className="client-fav-price-old">R$ {product.preco.toFixed(2)}</span>
                          <span className="client-fav-price">R$ {product.precoPromocional.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="client-fav-price">R$ {product.preco.toFixed(2)}</span>
                      )}
                    </div>
                    <button className="client-fav-remove" onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }} title="Remover dos favoritos">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* === ABA MEUS DADOS === */}
        {activeTab === 'dados' && (
          <>
            <h2 className="client-title">Meus Dados</h2>
            <div className="client-dados-card">
              <form onSubmit={handleSalvarDados} className="client-dados-form">
                <div className="client-dados-field">
                  <label>Nome</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="client-dados-input" />
                </div>

                <div className="client-dados-field">
                  <label>E-mail</label>
                  <input type="email" value={email} disabled className="client-dados-input client-dados-input-disabled" />
                  <span className="client-dados-hint">O e-mail não pode ser alterado.</span>
                </div>

                <div className="client-dados-divider">
                  <span>Alterar senha (opcional)</span>
                </div>

                <div className="client-dados-field">
                  <label>Senha atual</label>
                  <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="client-dados-input" placeholder="Digite sua senha atual" />
                </div>

                <div className="client-dados-field">
                  <label>Nova senha</label>
                  <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} minLength="8" className="client-dados-input" placeholder="Mínimo 8 caracteres" />
                </div>

                <button type="submit" className="btn-primary client-dados-submit" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientArea;

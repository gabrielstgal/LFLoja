import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import api from '../services/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ANALYTICS');

  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [imagens, setImagens] = useState([]);
  const [estoqueTamanhos, setEstoqueTamanhos] = useState([{ tamanho: '', quantidade: '' }]);
  const [descricao, setDescricao] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [cupomTipo, setCupomTipo] = useState('PERCENTUAL');
  const [cupomValor, setCupomValor] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Categorias
  const [categorias, setCategorias] = useState([]);
  const [catNome, setCatNome] = useState('');
  const [catImagem, setCatImagem] = useState('');
  const [catOrdem, setCatOrdem] = useState(0);
  const [catEditId, setCatEditId] = useState(null);
  const [catUploading, setCatUploading] = useState(false);

  // Banners
  const [bannersList, setBannersList] = useState([]);
  const [bannerImagem, setBannerImagem] = useState('');
  const [bannerTitulo, setBannerTitulo] = useState('');
  const [bannerSubtitulo, setBannerSubtitulo] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerTextoBotao, setBannerTextoBotao] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerOrdem, setBannerOrdem] = useState(0);
  const [bannerAtivo, setBannerAtivo] = useState(true);
  const [bannerEditId, setBannerEditId] = useState(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) { toast.error("Administradores apenas."); navigate('/'); return; }
    Promise.all([loadProducts(), loadOrders(), loadCupons(), loadCategorias(), loadBanners()]).finally(() => setLoadingData(false));
  }, [user, isAdmin, navigate]);

  const loadProducts = () => {
    return api.get('/produtos/buscar?tamanho=100')
      .then(res => { const d = res.data; setProducts(Array.isArray(d) ? d : d?.content || []); })
      .catch(() => setProducts([]));
  };

  const loadOrders = () => {
    return api.get('/pedidos/todos')
      .then(res => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]));
  };

  const loadCupons = () => {
    return api.get('/cupons')
      .then(res => setCupons(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCupons([]));
  };

  const loadCategorias = () => {
    return api.get('/categorias')
      .then(res => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategorias([]));
  };

  const clearCatForm = () => {
    setCatNome(''); setCatImagem(''); setCatOrdem(0); setCatEditId(null);
  };

  const handleCatImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCatUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) { setCatImagem(url); toast.success('Imagem da categoria enviada!'); }
    } catch { toast.error('Falha ao enviar imagem.'); }
    finally { setCatUploading(false); }
  };

  const handleSalvarCategoria = async (e) => {
    e.preventDefault();
    if (!catNome.trim()) return;
    const payload = { nome: catNome.trim(), urlImagem: catImagem, ordem: catOrdem };
    try {
      if (catEditId) {
        await api.put(`/categorias/${catEditId}`, payload);
        toast.success('Categoria atualizada!');
      } else {
        await api.post('/categorias', payload);
        toast.success('Categoria criada!');
      }
      clearCatForm();
      loadCategorias();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao salvar categoria.');
    }
  };

  const handleEditCategoria = (cat) => {
    setCatEditId(cat.id);
    setCatNome(cat.nome);
    setCatImagem(cat.urlImagem || '');
    setCatOrdem(cat.ordem || 0);
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Remover esta categoria?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoria removida!');
      loadCategorias();
    } catch { toast.error('Erro ao remover categoria.'); }
  };

  // --- Banners ---
  const loadBanners = () => {
    return api.get('/banners/todos')
      .then(res => setBannersList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBannersList([]));
  };

  const clearBannerForm = () => {
    setBannerImagem(''); setBannerTitulo(''); setBannerSubtitulo(''); setBannerBadge(''); setBannerTextoBotao(''); setBannerLink(''); setBannerOrdem(0); setBannerAtivo(true); setBannerEditId(null);
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) { setBannerImagem(url); toast.success('Imagem do banner enviada!'); }
    } catch { toast.error('Falha ao enviar imagem.'); }
    finally { setBannerUploading(false); }
  };

  const handleSalvarBanner = async (e) => {
    e.preventDefault();
    if (!bannerImagem.trim()) { toast.error('Envie uma imagem para o banner.'); return; }
    const payload = {
      urlImagem: bannerImagem,
      titulo: bannerTitulo || null,
      subtitulo: bannerSubtitulo || null,
      badge: bannerBadge || null,
      textoBotao: bannerTextoBotao || null,
      link: bannerLink || null,
      ordem: bannerOrdem,
      ativo: bannerAtivo,
    };
    try {
      if (bannerEditId) {
        await api.put(`/banners/${bannerEditId}`, payload);
        toast.success('Banner atualizado!');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner criado!');
      }
      clearBannerForm();
      loadBanners();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao salvar banner.');
    }
  };

  const handleEditBanner = (b) => {
    setBannerEditId(b.id);
    setBannerImagem(b.urlImagem || '');
    setBannerTitulo(b.titulo || '');
    setBannerSubtitulo(b.subtitulo || '');
    setBannerBadge(b.badge || '');
    setBannerTextoBotao(b.textoBotao || '');
    setBannerLink(b.link || '');
    setBannerOrdem(b.ordem || 0);
    setBannerAtivo(b.ativo);
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Remover este banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner removido!');
      loadBanners();
    } catch { toast.error('Erro ao remover banner.'); }
  };

  const handleCriarCupom = async (e) => {
    e.preventDefault();
    if (!cupomCodigo.trim() || !cupomValor) return;
    try {
      await api.post('/cupons', { codigo: cupomCodigo, tipo: cupomTipo, valor: parseFloat(cupomValor) });
      toast.success('Cupom criado!');
      setCupomCodigo(''); setCupomValor(''); setCupomTipo('PERCENTUAL');
      loadCupons();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao criar cupom.';
      toast.error(msg);
    }
  };

  const handleToggleCupom = async (id) => {
    try {
      await api.put(`/cupons/${id}/toggle`);
      loadCupons();
    } catch { toast.error('Erro ao alterar cupom.'); }
  };

  const handleDeleteCupom = async (id) => {
    if (!window.confirm('Remover este cupom?')) return;
    try { await api.delete(`/cupons/${id}`); toast.success('Cupom removido!'); loadCupons(); }
    catch { toast.error('Erro ao remover cupom.'); }
  };

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) { toast.error('Apenas imagens são permitidas.'); return null; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem muito grande. Máximo 5MB.'); return null; }
    const formData = new FormData();
    formData.append('arquivo', file);
    const res = await api.post('/produtos/upload-imagem', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.urlImagem;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) { setUrlImagem(url); toast.success('Imagem principal enviada!'); }
    } catch (err) {
      toast.error('Falha ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) urls.push(url);
      }
      setImagens(prev => [...prev, ...urls]);
      if (urls.length > 0) toast.success(`${urls.length} foto(s) adicionada(s)!`);
    } catch (err) {
      toast.error('Falha ao enviar imagens.');
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setNome(''); setCategoria(''); setPreco(''); setPrecoPromocional(''); setUrlImagem(''); setImagens([]); setEstoqueTamanhos([{ tamanho: '', quantidade: '' }]); setDescricao(''); setEditingId(null);
    setShowModal(false);
  };

  const handleEditProduct = (p) => {
    setEditingId(p.id);
    setShowModal(true);
    setNome(p.nome);
    setCategoria(p.categoria);
    setPreco(String(p.preco));
    setUrlImagem(p.urlImagem || '');
    setImagens(p.imagens || []);
    const et = p.estoqueTamanhos && Object.keys(p.estoqueTamanhos).length > 0
      ? Object.entries(p.estoqueTamanhos).map(([tamanho, quantidade]) => ({ tamanho, quantidade: String(quantidade) }))
      : [{ tamanho: '', quantidade: '' }];
    setEstoqueTamanhos(et);
    setDescricao(p.descricao || '');
    setPrecoPromocional(p.precoPromocional ? String(p.precoPromocional) : '');
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const etMap = {};
    estoqueTamanhos.forEach(({ tamanho, quantidade }) => {
      if (tamanho.trim()) etMap[tamanho.trim().toUpperCase()] = parseInt(quantidade) || 0;
    });
    const payload = {
      nome, categoria, descricao: descricao || 'Detalhes da peça sob consulta.',
      preco: parseFloat(preco),
      precoPromocional: precoPromocional ? parseFloat(precoPromocional) : null,
      urlImagem: urlImagem || 'https://via.placeholder.com/400x500?text=LF+Clothing',
      imagens,
      estoqueTamanhos: etMap,
    };
    try {
      if (editingId) {
        await api.put(`/produtos/${editingId}`, payload);
        toast.success("Produto Atualizado!");
      } else {
        await api.post('/produtos', payload);
        toast.success("Produto Cadastrado!");
      }
      clearForm();
      setShowModal(false);
      loadProducts();
    } catch(err) { toast.error("Falha ao salvar produto."); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Remover este produto?")) return;
    try { await api.delete(`/produtos/${id}`); toast.success("Produto deletado!"); loadProducts(); }
    catch(err) { toast.error("Não foi possível excluir (talvez tenha pedidos atrelados a ele)."); }
  };

  const handleUpdateOrderStatus = async (pedidoId, novoStatus) => {
    try {
      await api.put(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      toast.success("Status Atualizado!");
      loadOrders();
      loadProducts();
    } catch(err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao atualizar status.');
    }
  };

  // Faturamento apenas de pedidos pagos, enviados e entregues
  const paidStatuses = ['PAGO', 'ENVIADO', 'ENTREGUE'];
  const paidOrders = orders.filter(o => paidStatuses.includes(o.status));
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.valorTotal, 0);
  const allItems = paidOrders.flatMap(o => o.itens);

  const getTop = (keyExtractor) => {
    const counts = allItems.reduce((acc, item) => {
      const key = keyExtractor(item);
      if (key) acc[key] = (acc[key] || 0) + item.quantidade;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['Nenhum', 0];
  };

  const [topTamanho, topTamanhoCount] = getTop(item => item.tamanho);
  const [topProduto, topProdutoCount] = getTop(item => item.produto?.nome);
  const [topCategoria, topCategoriaCount] = getTop(item => item.produto?.categoria);

  const pendingCount = orders.filter(o => o.status === 'PENDENTE').length;

  if (!isAdmin) return null;
  if (loadingData) return <Loading texto="Carregando painel administrativo..." />;

  const getStatusClass = (status) => {
    if (status === 'PENDENTE') return 'pendente';
    if (status === 'PAGO') return 'pago';
    if (status === 'ENVIADO') return 'enviado';
    if (status === 'ENTREGUE') return 'entregue';
    if (status === 'CANCELADO') return 'cancelado';
    return 'default';
  };

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

        {activeTab === 'ANALYTICS' && (
          <div>
            <h2 className="admin-section-title">Desempenho da Loja</h2>
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <p className="admin-kpi-label">Faturamento Total</p>
                <h3 className="admin-kpi-value">R$ {totalRevenue.toFixed(2)}</h3>
                <p className="admin-kpi-sub">{paidOrders.length} pedidos confirmados</p>
                <div className="admin-kpi-bar"></div>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-label">Peça Campeã</p>
                <h3 className="admin-kpi-value admin-kpi-value-sm">{topProduto}</h3>
                <p className="admin-kpi-sub">{topProdutoCount} unidades vendidas</p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-label">Tamanho Mais Vendido</p>
                <h3 className="admin-kpi-value">{topTamanho}</h3>
                <p className="admin-kpi-sub">O tamanho mais pedido ({topTamanhoCount} unid.)</p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-label">Categoria Forte</p>
                <h3 className="admin-kpi-value admin-kpi-value-sm">{topCategoria}</h3>
                <p className="admin-kpi-sub">A tendência do momento ({topCategoriaCount} unid.)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div>
            <h2 className="admin-section-title">Gestão de Pedidos</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="admin-client-name">{o.protocolo || `#${o.id}`}</td>
                      <td>
                        <div>{o.usuario.nome}</div>
                        <div className="admin-client-email">{o.usuario.email}</div>
                      </td>
                      <td>{new Date(o.dataCriacao).toLocaleDateString()}</td>
                      <td className="admin-order-value">
                        R$ {o.valorTotal.toFixed(2)}
                        {o.cupomCodigo && (
                          <div style={{ fontSize: '0.75em', color: '#888' }}>
                            Cupom: {o.cupomCodigo} (-R$ {(o.valorDesconto || 0).toFixed(2)})
                          </div>
                        )}
                      </td>
                      <td><span className={`admin-status-badge ${getStatusClass(o.status)}`}>{o.status}</span></td>
                      <td>
                        <div className="admin-order-actions">
                          {o.status === 'PENDENTE' && (
                            <>
                              <button className="admin-btn-pago" onClick={() => handleUpdateOrderStatus(o.id, 'PAGO')}>Pago</button>
                              <button className="admin-btn-cancelado" onClick={() => handleUpdateOrderStatus(o.id, 'CANCELADO')}>Cancelar</button>
                            </>
                          )}
                          {o.status === 'PAGO' && (
                            <>
                              <button className="admin-btn-enviado" onClick={() => handleUpdateOrderStatus(o.id, 'ENVIADO')}>Enviado</button>
                              <button className="admin-btn-cancelado" onClick={() => handleUpdateOrderStatus(o.id, 'CANCELADO')}>Cancelar</button>
                            </>
                          )}
                          {o.status === 'ENVIADO' && (
                            <button className="admin-btn-entregue" onClick={() => handleUpdateOrderStatus(o.id, 'ENTREGUE')}>Entregue</button>
                          )}
                          {(o.status === 'ENTREGUE' || o.status === 'CANCELADO') && (
                            <span className="admin-order-final">Finalizado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="admin-table-empty">Nenhum pedido recebido ainda.</div>}
            </div>
          </div>
        )}

        {activeTab === 'PRODUCTS' && (
          <div>
            <div className="admin-products-header">
              <h2 className="admin-section-title">Catálogo e Estoque</h2>
              <button className="btn-primary admin-new-product-btn" onClick={() => { clearForm(); setShowModal(true); }}>+ Novo Produto</button>
            </div>

            <div className="admin-search-bar">
              <input
                type="text"
                placeholder="Buscar produto por nome..."
                value={searchProduct}
                onChange={e => setSearchProduct(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Cat/Preço</th>
                    <th>Estoque</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => p.nome?.toLowerCase().includes(searchProduct.toLowerCase())).map(p => (
                    <tr key={p.id}>
                      <td className="admin-product-code">{p.codigo || '—'}</td>
                      <td>
                        <div className="admin-product-name-cell">
                          <img src={p.urlImagem} alt="" className="admin-product-img" loading="lazy" />
                          <span className="admin-product-name">{p.nome}</span>
                        </div>
                      </td>
                      <td>
                        <div>{p.categoria}</div>
                        <div className="admin-product-category-sub">R$ {p.preco?.toFixed(2)}</div>
                      </td>
                      <td className={p.quantidadeEstoque > 0 ? 'admin-stock-ok' : 'admin-stock-empty'}>
                        {p.estoqueTamanhos && Object.keys(p.estoqueTamanhos).length > 0
                          ? Object.entries(p.estoqueTamanhos).map(([t, q]) => `${t}:${q}`).join(' | ')
                          : `${p.quantidadeEstoque} unid.`}
                      </td>
                      <td>
                        <button onClick={() => handleEditProduct(p)} className="admin-edit-btn">Editar</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="admin-delete-btn">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="admin-table-empty">Nenhum produto cadastrado.</div>}
            </div>
          </div>
        )}

        {activeTab === 'CUPONS' && (
          <div>
            <h2 className="admin-section-title">Cupons de Desconto</h2>

            <form onSubmit={handleCriarCupom} className="admin-cupom-form">
              <input
                type="text"
                placeholder="Código (ex: PROMO20)"
                value={cupomCodigo}
                onChange={e => setCupomCodigo(e.target.value)}
                required
                maxLength={20}
                className="admin-input"
                style={{ textTransform: 'uppercase' }}
              />
              <select value={cupomTipo} onChange={e => setCupomTipo(e.target.value)} className="admin-input">
                <option value="PERCENTUAL">Percentual (%)</option>
                <option value="FIXO">Valor fixo (R$)</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder={cupomTipo === 'PERCENTUAL' ? 'Ex: 15' : 'Ex: 25.00'}
                value={cupomValor}
                onChange={e => setCupomValor(e.target.value)}
                required
                className="admin-input"
              />
              <button type="submit" className="btn-primary admin-cupom-create-btn">Criar Cupom</button>
            </form>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {cupons.map(c => (
                    <tr key={c.id}>
                      <td className="admin-client-name">{c.codigo}</td>
                      <td>{c.tipo === 'PERCENTUAL' ? 'Percentual' : 'Valor fixo'}</td>
                      <td>{c.tipo === 'PERCENTUAL' ? `${c.valor}%` : `R$ ${Number(c.valor).toFixed(2)}`}</td>
                      <td>
                        <span className={`admin-status-badge ${c.ativo ? 'pago' : 'cancelado'}`}>
                          {c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-order-actions">
                          <button
                            onClick={() => handleToggleCupom(c.id)}
                            className={c.ativo ? 'admin-btn-cancelado' : 'admin-btn-pago'}
                          >
                            {c.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button onClick={() => handleDeleteCupom(c.id)} className="admin-delete-btn">Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cupons.length === 0 && <div className="admin-table-empty">Nenhum cupom cadastrado.</div>}
            </div>
          </div>
        )}

        {activeTab === 'CATEGORIAS' && (
          <div>
            <h2 className="admin-section-title">Gerenciar Categorias</h2>

            <form onSubmit={handleSalvarCategoria} className="admin-cat-form">
              <input
                type="text"
                placeholder="Nome da categoria (ex: Short Linho)"
                value={catNome}
                onChange={e => setCatNome(e.target.value)}
                required
                maxLength={50}
                className="admin-input"
              />
              <input
                type="number"
                placeholder="Ordem"
                value={catOrdem}
                onChange={e => setCatOrdem(Number(e.target.value))}
                className="admin-input"
                style={{ width: '80px' }}
                title="Ordem de exibição (menor aparece primeiro)"
              />
              <div className="admin-cat-img-area">
                {catImagem ? (
                  <div className="admin-cat-img-preview">
                    <img src={catImagem} alt="Preview" />
                    <button type="button" onClick={() => setCatImagem('')} className="admin-cat-img-remove">&times;</button>
                  </div>
                ) : (
                  <label className="admin-cat-upload-label">
                    <input type="file" accept="image/*" onChange={handleCatImageUpload} className="admin-upload-input" disabled={catUploading} />
                    <span className="admin-cat-upload-text">{catUploading ? 'Enviando...' : 'Foto'}</span>
                  </label>
                )}
              </div>
              <button type="submit" className="btn-primary">{catEditId ? 'Salvar' : 'Criar'}</button>
              {catEditId && <button type="button" onClick={clearCatForm} className="admin-cancel-btn">Cancelar</button>}
            </form>

            <div className="admin-cat-grid">
              {categorias.map(cat => (
                <div key={cat.id} className="admin-cat-card">
                  {cat.urlImagem ? (
                    <img src={cat.urlImagem} alt={cat.nome} className="admin-cat-card-img" />
                  ) : (
                    <div className="admin-cat-card-placeholder" />
                  )}
                  <div className="admin-cat-card-info">
                    <span className="admin-cat-card-name">{cat.nome}</span>
                    <span className="admin-cat-card-order">Ordem: {cat.ordem}</span>
                  </div>
                  <div className="admin-cat-card-actions">
                    <button onClick={() => handleEditCategoria(cat)} className="admin-edit-btn">Editar</button>
                    <button onClick={() => handleDeleteCategoria(cat.id)} className="admin-delete-btn">Remover</button>
                  </div>
                </div>
              ))}
              {categorias.length === 0 && <p className="admin-table-empty">Nenhuma categoria cadastrada.</p>}
            </div>
          </div>
        )}

        {activeTab === 'BANNERS' && (
          <div>
            <h2 className="admin-section-title">Banners da Home</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Os banners aparecem como carrossel na página inicial. Use imagens de alta qualidade (1920x800px recomendado).
            </p>

            <form onSubmit={handleSalvarBanner} className="admin-banner-form" style={{ marginBottom: '2rem' }}>
              <div className="admin-banner-form-grid">
                <div className="admin-form-section">
                  <span className="admin-form-label">Imagem (lado direito)</span>
                  <div className="admin-cat-img-area">
                    {bannerImagem ? (
                      <div className="admin-cat-img-preview" style={{ width: '100%', height: '150px' }}>
                        <img src={bannerImagem} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        <button type="button" onClick={() => setBannerImagem('')} className="admin-cat-img-remove">&times;</button>
                      </div>
                    ) : (
                      <label className="admin-cat-upload-label">
                        <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="admin-upload-input" disabled={bannerUploading} />
                        <span className="admin-cat-upload-text">{bannerUploading ? 'Enviando...' : 'Enviar foto'}</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="admin-form-section">
                  <span className="admin-form-label">Textos (lado esquerdo)</span>
                  <input type="text" placeholder="Badge (ex: Nova Coleção 2026)" value={bannerBadge} onChange={e => setBannerBadge(e.target.value)} className="admin-input" />
                  <input type="text" placeholder="Título principal" value={bannerTitulo} onChange={e => setBannerTitulo(e.target.value)} className="admin-input" />
                  <input type="text" placeholder="Subtítulo / descrição" value={bannerSubtitulo} onChange={e => setBannerSubtitulo(e.target.value)} className="admin-input" />
                  <input type="text" placeholder="Texto do botão (ex: Ver Coleção)" value={bannerTextoBotao} onChange={e => setBannerTextoBotao(e.target.value)} className="admin-input" />
                  <select value={bannerLink} onChange={e => setBannerLink(e.target.value)} className="admin-input">
                    <option value="">Botão leva para → Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={`/catalogo?categoria=${cat.nome}`}>{cat.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-section">
                  <span className="admin-form-label">Configurações</span>
                  <input type="number" placeholder="Ordem" value={bannerOrdem} onChange={e => setBannerOrdem(Number(e.target.value))} className="admin-input" style={{ width: '100px' }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={bannerAtivo} onChange={e => setBannerAtivo(e.target.checked)} />
                    Ativo
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">{bannerEditId ? 'Salvar' : 'Criar Banner'}</button>
                {bannerEditId && <button type="button" onClick={clearBannerForm} className="admin-cancel-btn">Cancelar</button>}
              </div>
            </form>

            <div className="admin-cat-grid">
              {bannersList.map(b => (
                <div key={b.id} className="admin-cat-card" style={{ opacity: b.ativo ? 1 : 0.5 }}>
                  <img src={b.urlImagem} alt="Banner" className="admin-cat-card-img" style={{ height: '120px', objectFit: 'cover' }} />
                  <div className="admin-cat-card-info">
                    <span className="admin-cat-card-name">{b.titulo || 'Sem título'}</span>
                    <span className="admin-cat-card-order">{b.badge || ''} | Ordem: {b.ordem} | {b.ativo ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <div className="admin-cat-card-actions">
                    <button onClick={() => handleEditBanner(b)} className="admin-edit-btn">Editar</button>
                    <button onClick={() => handleDeleteBanner(b.id)} className="admin-delete-btn">Remover</button>
                  </div>
                </div>
              ))}
              {bannersList.length === 0 && <p className="admin-table-empty">Nenhum banner cadastrado. A home mostrará o hero padrão.</p>}
            </div>
          </div>
        )}

        {showModal && (
          <>
            <div className="admin-modal-overlay" onClick={clearForm}></div>
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>{editingId ? 'Editar Produto #' + editingId : 'Novo Produto'}</h3>
                <button className="admin-modal-close" onClick={clearForm}>&times;</button>
              </div>
              <p className="admin-product-form-subtitle">{editingId ? 'Atualize as informações do produto.' : 'Preencha os dados para lançar um novo produto.'}</p>
              <form onSubmit={handleSubmitProduct} className="admin-product-form-grid">
                <div className="admin-form-section">
                  <span className="admin-form-label">Informações básicas</span>
                  <input type="text" placeholder="Nome da Peça" value={nome} onChange={e => setNome(e.target.value)} required className="admin-input" />
                  <select value={categoria} onChange={e => setCategoria(e.target.value)} required className="admin-input">
                    <option value="">Selecione a categoria</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                  <textarea placeholder="Descrição do produto" value={descricao} onChange={e => setDescricao(e.target.value)} className="admin-input" rows="3" />
                </div>

                <div className="admin-form-section">
                  <span className="admin-form-label">Preço</span>
                  <input type="number" step="0.01" placeholder="Preço original (Ex: 199.90)" value={preco} onChange={e => setPreco(e.target.value)} required className="admin-input" />
                  <input type="number" step="0.01" placeholder="Preço promocional (deixe vazio se não tiver)" value={precoPromocional} onChange={e => setPrecoPromocional(e.target.value)} className="admin-input" />
                  {preco && precoPromocional && parseFloat(precoPromocional) < parseFloat(preco) && (
                    <span className="admin-promo-preview">
                      Desconto: {Math.round((1 - parseFloat(precoPromocional) / parseFloat(preco)) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="admin-form-section">
                  <span className="admin-form-label">Estoque por tamanho</span>
                  {estoqueTamanhos.map((item, idx) => (
                    <div key={idx} className="admin-form-row admin-stock-row">
                      <input type="text" placeholder="Tamanho (P, M, G...)" value={item.tamanho} onChange={e => { const arr = [...estoqueTamanhos]; arr[idx].tamanho = e.target.value; setEstoqueTamanhos(arr); }} className="admin-input" />
                      <input type="number" placeholder="Qtd" value={item.quantidade} onChange={e => { const arr = [...estoqueTamanhos]; arr[idx].quantidade = e.target.value; setEstoqueTamanhos(arr); }} className="admin-input" />
                      {estoqueTamanhos.length > 1 && (
                        <button type="button" onClick={() => setEstoqueTamanhos(prev => prev.filter((_, i) => i !== idx))} className="admin-stock-remove">&times;</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setEstoqueTamanhos(prev => [...prev, { tamanho: '', quantidade: '' }])} className="admin-stock-add">+ Adicionar tamanho</button>
                </div>

                <div className="admin-form-section">
                  <span className="admin-form-label">Foto principal</span>
                  <div className="admin-upload-area">
                    {urlImagem ? (
                      <div className="admin-upload-preview">
                        <img src={urlImagem} alt="Preview" className="admin-upload-img" />
                        <button type="button" onClick={() => setUrlImagem('')} className="admin-upload-remove">Remover</button>
                      </div>
                    ) : (
                      <label className="admin-upload-label">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="admin-upload-input" disabled={uploading} />
                        <div className="admin-upload-placeholder">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span>{uploading ? 'Enviando...' : 'Clique para enviar a foto principal'}</span>
                          <span className="admin-upload-hint">JPG, PNG — máximo 5MB</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="admin-form-section">
                  <span className="admin-form-label">Galeria de fotos</span>
                  {imagens.length > 0 && (
                    <div className="admin-gallery-grid">
                      {imagens.map((img, idx) => (
                        <div key={idx} className="admin-gallery-item">
                          <img src={img} alt={`Foto ${idx + 1}`} />
                          <button type="button" onClick={() => setImagens(prev => prev.filter((_, i) => i !== idx))} className="admin-gallery-remove">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="admin-upload-label">
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="admin-upload-input" disabled={uploading} />
                    <div className="admin-upload-placeholder admin-upload-placeholder-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>{uploading ? 'Enviando...' : 'Adicionar fotos à galeria'}</span>
                    </div>
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Lançar Produto'}</button>
                  <button type="button" onClick={clearForm} className="admin-cancel-btn">Cancelar</button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

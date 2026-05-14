import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { criarProduto, atualizarProduto, deletarProduto, uploadImagem } from '../../services/produtoService';

const AdminProducts = ({ products, categorias, onReload }) => {
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

  const clearForm = () => {
    setNome(''); setCategoria(''); setPreco(''); setPrecoPromocional(''); setUrlImagem(''); setImagens([]); setEstoqueTamanhos([{ tamanho: '', quantidade: '' }]); setDescricao(''); setEditingId(null);
    setShowModal(false);
  };

  const handleUpload = async (file) => {
    if (!file.type.startsWith('image/')) { toast.error('Apenas imagens são permitidas.'); return null; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem muito grande. Máximo 5MB.'); return null; }
    return uploadImagem(file);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await handleUpload(file);
      if (url) { setUrlImagem(url); toast.success('Imagem principal enviada!'); }
    } catch { toast.error('Falha ao enviar imagem.'); }
    finally { setUploading(false); }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await handleUpload(file);
        if (url) urls.push(url);
      }
      setImagens(prev => [...prev, ...urls]);
      if (urls.length > 0) toast.success(`${urls.length} foto(s) adicionada(s)!`);
    } catch { toast.error('Falha ao enviar imagens.'); }
    finally { setUploading(false); }
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
        await atualizarProduto(editingId, payload);
        toast.success("Produto Atualizado!");
      } else {
        await criarProduto(payload);
        toast.success("Produto Cadastrado!");
      }
      clearForm();
      setShowModal(false);
      onReload();
    } catch { toast.error("Falha ao salvar produto."); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Remover este produto?")) return;
    try { await deletarProduto(id); toast.success("Produto deletado!"); onReload(); }
    catch { toast.error("Não foi possível excluir (talvez tenha pedidos atrelados a ele)."); }
  };

  return (
    <div>
      <div className="admin-products-header">
        <h2 className="admin-section-title">Catálogo e Estoque</h2>
        <button className="btn-primary admin-new-product-btn" onClick={() => { clearForm(); setShowModal(true); }}>+ Novo Produto</button>
      </div>

      <div className="admin-search-bar">
        <input type="text" placeholder="Buscar produto por nome..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)} className="admin-search-input" />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Código</th><th>Produto</th><th>Cat/Preço</th><th>Estoque</th><th>Ação</th></tr>
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
  );
};

export default AdminProducts;

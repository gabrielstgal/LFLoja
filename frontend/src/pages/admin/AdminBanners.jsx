import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { criarBanner, atualizarBanner, deletarBanner } from '../../services/bannerService';
import { uploadImagem } from '../../services/produtoService';

const AdminBanners = ({ bannersList, categorias, onReload }) => {
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

  const clearBannerForm = () => {
    setBannerImagem(''); setBannerTitulo(''); setBannerSubtitulo(''); setBannerBadge(''); setBannerTextoBotao(''); setBannerLink(''); setBannerOrdem(0); setBannerAtivo(true); setBannerEditId(null);
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Maximo 5MB.');
      return;
    }
    setBannerUploading(true);
    try {
      const url = await uploadImagem(file);
      if (url) { setBannerImagem(url); toast.success('Imagem do banner enviada!'); }
    } catch (err) {
      const msg = err.response?.data?.erro;
      toast.error(msg || 'Falha ao enviar imagem. Verifique o formato (JPG, PNG ou WebP) e o nome do arquivo.');
    }
    finally { setBannerUploading(false); }
  };

  const handleSalvarBanner = async (e) => {
    e.preventDefault();
    if (!bannerImagem.trim()) { toast.error('Envie uma imagem para o banner.'); return; }
    const payload = {
      urlImagem: bannerImagem, titulo: bannerTitulo || null, subtitulo: bannerSubtitulo || null,
      badge: bannerBadge || null, textoBotao: bannerTextoBotao || null, link: bannerLink || null,
      ordem: bannerOrdem, ativo: bannerAtivo,
    };
    try {
      if (bannerEditId) {
        await atualizarBanner(bannerEditId, payload);
        toast.success('Banner atualizado!');
      } else {
        await criarBanner(payload);
        toast.success('Banner criado!');
      }
      clearBannerForm();
      onReload();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao salvar banner.');
    }
  };

  const handleEditBanner = (b) => {
    setBannerEditId(b.id); setBannerImagem(b.urlImagem || ''); setBannerTitulo(b.titulo || '');
    setBannerSubtitulo(b.subtitulo || ''); setBannerBadge(b.badge || '');
    setBannerTextoBotao(b.textoBotao || ''); setBannerLink(b.link || '');
    setBannerOrdem(b.ordem || 0); setBannerAtivo(b.ativo);
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Remover este banner?')) return;
    try { await deletarBanner(id); toast.success('Banner removido!'); onReload(); }
    catch { toast.error('Erro ao remover banner.'); }
  };

  return (
    <div>
      <h2 className="admin-section-title">Banners da Home</h2>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
        <p>Os banners aparecem como carrossel na pagina inicial.</p>
        <p style={{ marginTop: '0.5rem' }}>
          <strong style={{ color: 'var(--color-text)' }}>Tamanho ideal:</strong> 1920x800px (proporcao 2.4:1) — Desktop mostra metade da imagem, mobile mostra inteira.<br/>
          <strong style={{ color: 'var(--color-text)' }}>Formatos:</strong> JPG, PNG ou WebP — maximo 5MB.<br/>
          <strong style={{ color: 'var(--color-text)' }}>Dica:</strong> Se a foto nao enviar, verifique se o nome do arquivo nao tem acentos ou caracteres especiais. Renomeie para algo simples (ex: banner1.jpg).
        </p>
      </div>

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
  );
};

export default AdminBanners;

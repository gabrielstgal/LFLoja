import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { criarCategoria, atualizarCategoria, deletarCategoria } from '../../services/categoriaService';
import { uploadImagem } from '../../services/produtoService';

const AdminCategories = ({ categorias, onReload }) => {
  const [catNome, setCatNome] = useState('');
  const [catImagem, setCatImagem] = useState('');
  const [catOrdem, setCatOrdem] = useState(0);
  const [catEditId, setCatEditId] = useState(null);
  const [catUploading, setCatUploading] = useState(false);

  const clearCatForm = () => {
    setCatNome(''); setCatImagem(''); setCatOrdem(0); setCatEditId(null);
  };

  const handleCatImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCatUploading(true);
    try {
      const url = await uploadImagem(file);
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
        await atualizarCategoria(catEditId, payload);
        toast.success('Categoria atualizada!');
      } else {
        await criarCategoria(payload);
        toast.success('Categoria criada!');
      }
      clearCatForm();
      onReload();
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
    try { await deletarCategoria(id); toast.success('Categoria removida!'); onReload(); }
    catch { toast.error('Erro ao remover categoria.'); }
  };

  return (
    <div>
      <h2 className="admin-section-title">Gerenciar Categorias</h2>

      <form onSubmit={handleSalvarCategoria} className="admin-cat-form">
        <input type="text" placeholder="Nome da categoria (ex: Short Linho)" value={catNome} onChange={e => setCatNome(e.target.value)} required maxLength={50} className="admin-input" />
        <input type="number" placeholder="Ordem" value={catOrdem} onChange={e => setCatOrdem(Number(e.target.value))} className="admin-input" style={{ width: '80px' }} title="Ordem de exibição (menor aparece primeiro)" />
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
  );
};

export default AdminCategories;

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { criarCategoria, atualizarCategoria, deletarCategoria } from '../../services/categoriaService';
import { uploadImagem } from '../../services/produtoService';

const AdminCategories = ({ categorias, onReload }) => {
  const [catNome, setCatNome] = useState('');
  const [catImagem, setCatImagem] = useState('');
  const [catEditId, setCatEditId] = useState(null);
  const [catUploading, setCatUploading] = useState(false);

  const clearCatForm = () => {
    setCatNome(''); setCatImagem(''); setCatEditId(null);
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
    const ordem = catEditId
      ? categorias.find(c => c.id === catEditId)?.ordem || 0
      : categorias.length;
    const payload = { nome: catNome.trim(), urlImagem: catImagem, ordem };
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
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Remover esta categoria?')) return;
    try { await deletarCategoria(id); toast.success('Categoria removida!'); onReload(); }
    catch { toast.error('Erro ao remover categoria.'); }
  };

  const handleMover = async (index, direcao) => {
    const sorted = [...categorias];
    const targetIndex = index + direcao;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const catA = sorted[index];
    const catB = sorted[targetIndex];

    try {
      await Promise.all([
        atualizarCategoria(catA.id, { nome: catA.nome, urlImagem: catA.urlImagem, ordem: catB.ordem }),
        atualizarCategoria(catB.id, { nome: catB.nome, urlImagem: catB.urlImagem, ordem: catA.ordem }),
      ]);
      onReload();
    } catch {
      toast.error('Erro ao reordenar.');
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">Gerenciar Categorias</h2>

      <form onSubmit={handleSalvarCategoria} className="admin-cat-form">
        <input type="text" placeholder="Nome da categoria (ex: Short Linho)" value={catNome} onChange={e => setCatNome(e.target.value)} required maxLength={50} className="admin-input" />
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

      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Use as setas para definir a ordem de exibicao das categorias na loja.
      </p>

      <div className="admin-cat-list">
        {categorias.map((cat, idx) => (
          <div key={cat.id} className="admin-cat-row">
            <span className="admin-cat-row-pos">{idx + 1}</span>
            <div className="admin-cat-row-arrows">
              <button
                type="button"
                className="admin-cat-arrow-btn"
                disabled={idx === 0}
                onClick={() => handleMover(idx, -1)}
                title="Subir"
              >&#9650;</button>
              <button
                type="button"
                className="admin-cat-arrow-btn"
                disabled={idx === categorias.length - 1}
                onClick={() => handleMover(idx, 1)}
                title="Descer"
              >&#9660;</button>
            </div>
            {cat.urlImagem ? (
              <img src={cat.urlImagem} alt={cat.nome} className="admin-cat-row-img" />
            ) : (
              <div className="admin-cat-row-img-placeholder" />
            )}
            <span className="admin-cat-row-name">{cat.nome}</span>
            <div className="admin-cat-row-actions">
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

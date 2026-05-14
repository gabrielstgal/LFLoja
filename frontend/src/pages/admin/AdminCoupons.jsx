import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { criarCupom, toggleCupom, deletarCupom } from '../../services/cupomService';

const AdminCoupons = ({ cupons, onReload }) => {
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [cupomTipo, setCupomTipo] = useState('PERCENTUAL');
  const [cupomValor, setCupomValor] = useState('');

  const handleCriarCupom = async (e) => {
    e.preventDefault();
    if (!cupomCodigo.trim() || !cupomValor) return;
    try {
      await criarCupom({ codigo: cupomCodigo, tipo: cupomTipo, valor: parseFloat(cupomValor) });
      toast.success('Cupom criado!');
      setCupomCodigo(''); setCupomValor(''); setCupomTipo('PERCENTUAL');
      onReload();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao criar cupom.');
    }
  };

  const handleToggleCupom = async (id) => {
    try { await toggleCupom(id); onReload(); }
    catch { toast.error('Erro ao alterar cupom.'); }
  };

  const handleDeleteCupom = async (id) => {
    if (!window.confirm('Remover este cupom?')) return;
    try { await deletarCupom(id); toast.success('Cupom removido!'); onReload(); }
    catch { toast.error('Erro ao remover cupom.'); }
  };

  return (
    <div>
      <h2 className="admin-section-title">Cupons de Desconto</h2>

      <form onSubmit={handleCriarCupom} className="admin-cupom-form">
        <input type="text" placeholder="Código (ex: PROMO20)" value={cupomCodigo} onChange={e => setCupomCodigo(e.target.value)} required maxLength={20} className="admin-input" style={{ textTransform: 'uppercase' }} />
        <select value={cupomTipo} onChange={e => setCupomTipo(e.target.value)} className="admin-input">
          <option value="PERCENTUAL">Percentual (%)</option>
          <option value="FIXO">Valor fixo (R$)</option>
        </select>
        <input type="number" step="0.01" min="0.01" placeholder={cupomTipo === 'PERCENTUAL' ? 'Ex: 15' : 'Ex: 25.00'} value={cupomValor} onChange={e => setCupomValor(e.target.value)} required className="admin-input" />
        <button type="submit" className="btn-primary admin-cupom-create-btn">Criar Cupom</button>
      </form>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Ação</th></tr>
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
                    <button onClick={() => handleToggleCupom(c.id)} className={c.ativo ? 'admin-btn-cancelado' : 'admin-btn-pago'}>
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
  );
};

export default AdminCoupons;

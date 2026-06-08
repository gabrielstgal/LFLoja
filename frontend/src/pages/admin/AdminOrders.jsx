import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { atualizarStatus } from '../../services/pedidoService';
import { getStatusClass } from '../../utils/orderUtils';

const AdminOrders = ({ orders, onReload, onReloadProducts }) => {
  const [searchOrder, setSearchOrder] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const handleUpdateOrderStatus = async (pedidoId, novoStatus) => {
    try {
      await atualizarStatus(pedidoId, novoStatus);
      toast.success("Status Atualizado!");
      onReload();
      onReloadProducts();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao atualizar status.');
    }
  };

  const pendingCount = orders.filter(o => o.status === 'PENDENTE').length;

  return (
    <div>
      <h2 className="admin-section-title">Gestão de Pedidos</h2>

      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="Buscar por protocolo (ex: LF-A1B2C3D4)..."
          value={searchOrder}
          onChange={e => setSearchOrder(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Protocolo</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .filter(o => {
                if (!searchOrder.trim()) return true;
                const term = searchOrder.trim().toLowerCase();
                return (o.protocolo || '').toLowerCase().includes(term)
                  || (o.usuario?.nome || '').toLowerCase().includes(term)
                  || (o.usuario?.email || '').toLowerCase().includes(term);
              })
              .map(o => (
              <React.Fragment key={o.id}>
                <tr className={expandedOrderId === o.id ? 'admin-order-row-expanded' : ''}>
                  <td>
                    <button
                      className="admin-order-expand-btn"
                      onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                      title="Ver detalhes"
                    >
                      {expandedOrderId === o.id ? '▾' : '▸'}
                    </button>
                  </td>
                  <td className="admin-client-name">{o.protocolo || `#${o.id}`}</td>
                  <td>
                    <div>{o.usuario?.nome}</div>
                    <div className="admin-client-email">{o.usuario?.email}</div>
                  </td>
                  <td>{new Date(o.dataCriacao).toLocaleDateString()}</td>
                  <td className="admin-order-value">
                    R$ {(o.valorTotal || 0).toFixed(2)}
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

                {expandedOrderId === o.id && (
                  <tr className="admin-order-detail-row">
                    <td colSpan="7">
                      <div className="admin-order-detail">
                        <div className="admin-order-detail-grid">
                          <div className="admin-order-detail-section">
                            <h4>Itens do Pedido</h4>
                            <table className="admin-order-items-table">
                              <thead>
                                <tr>
                                  <th>Produto</th>
                                  <th>Tamanho</th>
                                  <th>Qtd</th>
                                  <th>Preço Unit.</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(o.itens || []).map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="admin-order-item-name">
                                      {item.produto?.urlImagem && (
                                        <img src={item.produto.urlImagem} alt="" className="admin-order-item-img" />
                                      )}
                                      <span>{item.produto?.nome || 'Produto removido'}</span>
                                    </td>
                                    <td>{item.tamanho || '—'}</td>
                                    <td>{item.quantidade}</td>
                                    <td>R$ {Number(item.preco).toFixed(2)}</td>
                                    <td className="admin-order-value">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {o.cupomCodigo && (
                              <div className="admin-order-detail-cupom">
                                Cupom <strong>{o.cupomCodigo}</strong> — Desconto: <strong>-R$ {(o.valorDesconto || 0).toFixed(2)}</strong>
                              </div>
                            )}
                            <div className="admin-order-detail-total">
                              Total: <strong>R$ {(o.valorTotal || 0).toFixed(2)}</strong>
                            </div>
                          </div>

                          {o.enderecoEntrega && (
                            <div className="admin-order-detail-section">
                              <h4>Endereço de Entrega</h4>
                              <p className="admin-order-address">
                                {o.enderecoEntrega.rua}, {o.enderecoEntrega.numero}
                                {o.enderecoEntrega.complemento && ` - ${o.enderecoEntrega.complemento}`}<br />
                                {o.enderecoEntrega.bairro} — {o.enderecoEntrega.cidade}/{o.enderecoEntrega.estado}<br />
                                CEP: {o.enderecoEntrega.cep}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="admin-table-empty">Nenhum pedido recebido ainda.</div>}
        {orders.length > 0 && orders.filter(o => {
          if (!searchOrder.trim()) return true;
          const term = searchOrder.trim().toLowerCase();
          return (o.protocolo || '').toLowerCase().includes(term)
            || (o.usuario?.nome || '').toLowerCase().includes(term)
            || (o.usuario?.email || '').toLowerCase().includes(term);
        }).length === 0 && <div className="admin-table-empty">Nenhum pedido encontrado para esta busca.</div>}
      </div>
    </div>
  );
};

export default AdminOrders;

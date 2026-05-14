import React from 'react';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatUtils';

const AdminAnalytics = ({ orders, products }) => {
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
  const canceledCount = orders.filter(o => o.status === 'CANCELADO').length;
  const shippedCount = orders.filter(o => o.status === 'ENVIADO').length;
  const deliveredCount = orders.filter(o => o.status === 'ENTREGUE').length;
  const paidCount = orders.filter(o => o.status === 'PAGO').length;

  const ticketMedio = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.quantidadeEstoque || 0), 0);
  const lowStockProducts = products.filter(p => p.quantidadeEstoque > 0 && p.quantidadeEstoque <= 5).length;
  const outOfStockProducts = products.filter(p => p.quantidadeEstoque === 0).length;
  const totalDescontos = paidOrders.reduce((sum, o) => sum + (o.valorDesconto || 0), 0);

  const vendasPorMes = (() => {
    const meses = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const mes = d.getMonth();
      const ano = d.getFullYear();
      const pedidosMes = paidOrders.filter(o => {
        const dt = new Date(o.dataCriacao);
        return dt.getMonth() === mes && dt.getFullYear() === ano;
      });
      const total = pedidosMes.reduce((s, o) => s + o.valorTotal, 0);
      meses.push({ label, total, count: pedidosMes.length });
    }
    return meses;
  })();
  const maxVendaMes = Math.max(...vendasPorMes.map(m => m.total), 1);

  const topProdutos = (() => {
    const counts = {};
    allItems.forEach(item => {
      const nome = item.produto?.nome;
      if (nome) counts[nome] = (counts[nome] || 0) + item.quantidade;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();
  const maxTopProduto = topProdutos.length > 0 ? topProdutos[0][1] : 1;

  return (
    <div>
      <h2 className="admin-section-title">Desempenho da Loja</h2>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Faturamento Total</p>
          <h3 className="admin-kpi-value">{formatCurrency(totalRevenue)}</h3>
          <p className="admin-kpi-sub">{paidOrders.length} pedidos confirmados</p>
          <div className="admin-kpi-bar"></div>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Ticket Médio</p>
          <h3 className="admin-kpi-value">{formatCurrency(ticketMedio)}</h3>
          <p className="admin-kpi-sub">Valor médio por pedido</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Total de Pedidos</p>
          <h3 className="admin-kpi-value">{orders.length}</h3>
          <p className="admin-kpi-sub">{pendingCount} pendentes</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Descontos (Cupons)</p>
          <h3 className="admin-kpi-value">{formatCurrency(totalDescontos)}</h3>
          <p className="admin-kpi-sub">{paidOrders.filter(o => o.cupomCodigo).length} pedidos com cupom</p>
        </div>
      </div>

      <div className="admin-kpi-grid" style={{ marginTop: '1rem' }}>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Peça Campeã</p>
          <h3 className="admin-kpi-value admin-kpi-value-sm">{topProduto}</h3>
          <p className="admin-kpi-sub">{topProdutoCount} unidades vendidas</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Tamanho Mais Vendido</p>
          <h3 className="admin-kpi-value">{topTamanho}</h3>
          <p className="admin-kpi-sub">{topTamanhoCount} unidades</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Categoria Forte</p>
          <h3 className="admin-kpi-value admin-kpi-value-sm">{topCategoria}</h3>
          <p className="admin-kpi-sub">{topCategoriaCount} unidades</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Estoque</p>
          <h3 className="admin-kpi-value">{totalStock}</h3>
          <p className="admin-kpi-sub">{totalProducts} produtos | {outOfStockProducts} esgotados{lowStockProducts > 0 ? ` | ${lowStockProducts} baixo` : ''}</p>
        </div>
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <h4 className="admin-chart-title">Vendas por Mês</h4>
          <div className="admin-bar-chart">
            {vendasPorMes.map((m, i) => (
              <div key={i} className="admin-bar-col">
                <span className="admin-bar-value">{formatCompactCurrency(m.total)}</span>
                <div className="admin-bar" style={{ height: `${(m.total / maxVendaMes) * 100}%` }}></div>
                <span className="admin-bar-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-chart-card">
          <h4 className="admin-chart-title">Status dos Pedidos</h4>
          <div className="admin-status-chart">
            {[
              { label: 'Pendentes', count: pendingCount, color: '#ff9800' },
              { label: 'Pagos', count: paidCount, color: '#2196f3' },
              { label: 'Enviados', count: shippedCount, color: '#9c27b0' },
              { label: 'Entregues', count: deliveredCount, color: '#4caf50' },
              { label: 'Cancelados', count: canceledCount, color: '#e53935' },
            ].map((s, i) => (
              <div key={i} className="admin-status-row">
                <div className="admin-status-info">
                  <span className="admin-status-dot" style={{ background: s.color }}></span>
                  <span>{s.label}</span>
                </div>
                <div className="admin-status-bar-bg">
                  <div className="admin-status-bar-fill" style={{ width: orders.length > 0 ? `${(s.count / orders.length) * 100}%` : '0%', background: s.color }}></div>
                </div>
                <span className="admin-status-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {topProdutos.length > 0 && (
        <div className="admin-chart-card" style={{ marginTop: '1.5rem' }}>
          <h4 className="admin-chart-title">Top 5 Produtos Mais Vendidos</h4>
          <div className="admin-top-products">
            {topProdutos.map(([nome, qty], i) => (
              <div key={i} className="admin-top-row">
                <span className="admin-top-rank">#{i + 1}</span>
                <span className="admin-top-name">{nome}</span>
                <div className="admin-top-bar-bg">
                  <div className="admin-top-bar-fill" style={{ width: `${(qty / maxTopProduto) * 100}%` }}></div>
                </div>
                <span className="admin-top-qty">{qty} un.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;

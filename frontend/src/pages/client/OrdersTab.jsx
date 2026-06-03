import React from 'react';
import { STATUS_LABELS, STATUS_STEPS, getClientStatusClass } from '../../utils/orderUtils';
import { formatDate } from '../../utils/formatUtils';

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

const OrdersTab = ({ orders }) => {
  return (
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
                <span className="client-order-date">{formatDate(order.dataCriacao)}</span>
                <span className="client-order-total">R$ {(order.valorTotal || 0).toFixed(2)}</span>
                <span className={`client-order-status ${getClientStatusClass(order.status)}`}>
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
                        {item.tamanho ? `Tam: ${item.tamanho} | ` : ''}Qtd: {item.quantidade} | R$ {(item.preco || 0).toFixed(2)}
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
  );
};

export default OrdersTab;

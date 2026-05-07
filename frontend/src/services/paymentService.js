import api from './api';

export async function createOrder(cartItems, address) {
  const payload = {
    itens: cartItems.map(item => ({
      produtoId: item.id,
      quantidade: item.quantity,
      tamanho: item.selectedSize || null,
    })),
    ...address,
  };

  const response = await api.post('/pedidos/checkout', payload);
  return response.data;
}

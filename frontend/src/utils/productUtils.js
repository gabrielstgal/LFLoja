export const hasPromo = (product) =>
  product.precoPromocional && product.precoPromocional < product.preco;

export const getDiscountPercent = (product) =>
  hasPromo(product) ? Math.round((1 - product.precoPromocional / product.preco) * 100) : 0;

export const getPrecoEfetivo = (item) =>
  hasPromo(item) ? item.precoPromocional : item.preco;

export const isLowStock = (product) =>
  product.quantidadeEstoque > 0 && product.quantidadeEstoque <= 5;

export const isOutOfStock = (product) =>
  product.quantidadeEstoque <= 0;

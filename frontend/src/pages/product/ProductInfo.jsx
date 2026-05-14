import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { hasPromo, getDiscountPercent } from '../../utils/productUtils';
import StarRating from './StarRating';

const ProductInfo = ({ product, media, totalAvaliacoes }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (product.tamanhos && product.tamanhos.length > 0 && !selectedSize) {
      toast.error('Selecione um tamanho antes de adicionar ao carrinho.');
      return;
    }
    addToCart({ ...product, selectedSize: selectedSize || null });
    navigate('/catalogo');
  };

  return (
    <div className="product-details-info">
      <div>
        <span className="product-details-category">{product.categoria}</span>
        <h1 className="product-details-name">{product.nome}</h1>

        {totalAvaliacoes > 0 && (
          <div className="product-details-rating-summary">
            <StarRating value={Math.round(media)} readonly />
            <span className="product-details-rating-text">{media.toFixed(1)} ({totalAvaliacoes} {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'})</span>
          </div>
        )}

        {hasPromo(product) ? (
          <div className="product-details-price-wrapper">
            <span className="product-details-price-old">R$ {product.preco.toFixed(2)}</span>
            <span className="product-details-price product-details-price-promo">R$ {product.precoPromocional.toFixed(2)}</span>
            <span className="product-details-discount-badge">-{getDiscountPercent(product)}%</span>
          </div>
        ) : (
          <p className="product-details-price">R$ {product.preco.toFixed(2)}</p>
        )}
      </div>

      <p className="product-details-description">
        {product.descricao || 'Nenhuma descrição fornecida para este produto.'}
      </p>

      {product.estoqueTamanhos && Object.keys(product.estoqueTamanhos).length > 0 && (
        <div className="product-details-sizes">
          <h4>Tamanho</h4>
          <div className="product-details-sizes-list">
            {Object.entries(product.estoqueTamanhos).map(([size, qty]) => (
              <button
                key={size}
                onClick={() => qty > 0 && setSelectedSize(size)}
                className={`size-btn ${selectedSize === size ? 'selected' : ''} ${qty <= 0 ? 'size-btn-disabled' : ''}`}
                disabled={qty <= 0}
                title={qty <= 0 ? 'Esgotado' : ''}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={`product-details-stock ${
        selectedSize
          ? (product.estoqueTamanhos?.[selectedSize] > 0 ? 'in-stock' : 'out-of-stock')
          : (product.quantidadeEstoque > 0 ? 'in-stock' : 'out-of-stock')
      }`}>
        {selectedSize
          ? (product.estoqueTamanhos?.[selectedSize] > 0 ? 'Disponível' : 'Esgotado neste tamanho')
          : (product.quantidadeEstoque > 0 ? 'Disponível' : 'Esgotado')
        }
      </p>

      <button
        className="btn-primary product-details-add-btn"
        onClick={handleAddToCart}
        disabled={product.quantidadeEstoque <= 0}
      >
        {product.quantidadeEstoque > 0 ? 'Adicionar ao Carrinho' : 'Sem Estoque'}
      </button>
    </div>
  );
};

export default ProductInfo;

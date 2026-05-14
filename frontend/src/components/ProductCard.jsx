import React from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { hasPromo, getDiscountPercent, isLowStock, isOutOfStock } from '../utils/productUtils';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleCardClick = () => {
    navigate(`/produto/${product.id}`);
  };

  const promo = hasPromo(product);
  const discountPercent = getDiscountPercent(product);
  const lowStock = isLowStock(product);
  const outOfStock = isOutOfStock(product);
  const fav = isFavorite(product.id);

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        <img src={product.urlImagem || product.image} alt={product.nome} className="product-image" loading="lazy" />
        {promo && <span className="product-badge product-badge-promo">-{discountPercent}%</span>}
        {lowStock && !promo && <span className="product-badge product-badge-low">Últimas unidades</span>}
        {outOfStock && <span className="product-badge product-badge-out">Esgotado</span>}
        <button className={`product-fav-btn ${fav ? 'product-fav-active' : ''}`} onClick={handleFav} title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div className="product-overlay">
          <button className="btn-add-cart" onClick={handleAdd}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
      <div className="product-info">
        <p className="product-category">{product.categoria}</p>
        <h3 className="product-name">{product.nome}</h3>
        {promo ? (
          <div className="product-price-wrapper">
            <span className="product-price-old">R$ {product.preco?.toFixed(2)}</span>
            <span className="product-price product-price-promo">R$ {product.precoPromocional?.toFixed(2)}</span>
          </div>
        ) : (
          <p className="product-price">R$ {product.preco?.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

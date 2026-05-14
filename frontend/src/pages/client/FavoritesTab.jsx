import React from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPromo } from '../../utils/productUtils';

const FavoritesTab = ({ favorites, toggleFavorite }) => {
  const navigate = useNavigate();

  return (
    <>
      <h2 className="client-title">Meus Favoritos</h2>
      {favorites.length === 0 ? (
        <p className="client-empty">Você ainda não adicionou nenhum produto aos favoritos.</p>
      ) : (
        <div className="client-favorites-grid">
          {favorites.map(product => (
            <div key={product.id} className="client-fav-card" onClick={() => navigate(`/produto/${product.id}`)}>
              <img src={product.urlImagem} alt={product.nome} className="client-fav-img" loading="lazy" />
              <div className="client-fav-info">
                <span className="client-fav-category">{product.categoria}</span>
                <h4 className="client-fav-name">{product.nome}</h4>
                {hasPromo(product) ? (
                  <div className="client-fav-price-wrapper">
                    <span className="client-fav-price-old">R$ {product.preco.toFixed(2)}</span>
                    <span className="client-fav-price">R$ {product.precoPromocional.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="client-fav-price">R$ {product.preco.toFixed(2)}</span>
                )}
              </div>
              <button className="client-fav-remove" onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }} title="Remover dos favoritos">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoritesTab;

import React, { useState } from 'react';

const ProductGallery = ({ product, isFavorite, onToggleFavorite }) => {
  const allImages = [product.urlImagem, ...(product.imagens || [])].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(product.urlImagem || '');
  const fav = isFavorite;

  return (
    <div className="product-details-gallery">
      <div className="product-details-main-image">
        <img src={selectedImage || 'https://via.placeholder.com/600x800?text=LF+Clothing'} alt={product.nome} loading="lazy" />
        <button className={`product-details-fav-btn ${fav ? 'product-fav-active' : ''}`} onClick={onToggleFavorite} title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {allImages.length > 1 && (
        <div className="product-details-thumbnails">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`product-details-thumb ${selectedImage === img ? 'active' : ''}`}
            >
              <img src={img} alt={`${product.nome} - foto ${idx + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;

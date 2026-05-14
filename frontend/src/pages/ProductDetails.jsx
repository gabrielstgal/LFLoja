import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { getProduto } from '../services/produtoService';
import { listarAvaliacoes } from '../services/avaliacaoService';
import ProductGallery from './product/ProductGallery';
import ProductInfo from './product/ProductInfo';
import ReviewSection from './product/ReviewSection';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [media, setMedia] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  useEffect(() => {
    getProduto(id)
      .then(data => setProduct(data))
      .catch(() => toast.error('Erro ao carregar produto. Verifique sua conexão.'))
      .finally(() => setLoading(false));

    carregarAvaliacoes();
  }, [id]);

  const carregarAvaliacoes = () => {
    listarAvaliacoes(id)
      .then(data => {
        setAvaliacoes(data.avaliacoes || []);
        setMedia(data.media || 0);
        setTotalAvaliacoes(data.total || 0);
      })
      .catch(() => {});
  };

  if (loading) return <Loading texto="Carregando detalhes do produto..." />;
  if (!product) return <div className="product-details-loading">Produto não encontrado.</div>;

  return (
    <div className="product-details-container">
      <ProductGallery
        product={product}
        isFavorite={isFavorite(product.id)}
        onToggleFavorite={() => toggleFavorite(product)}
      />

      <ProductInfo
        product={product}
        media={media}
        totalAvaliacoes={totalAvaliacoes}
      />

      <ReviewSection
        produtoId={id}
        avaliacoes={avaliacoes}
        media={media}
        totalAvaliacoes={totalAvaliacoes}
        user={user}
        onReload={carregarAvaliacoes}
      />
    </div>
  );
};

export default ProductDetails;

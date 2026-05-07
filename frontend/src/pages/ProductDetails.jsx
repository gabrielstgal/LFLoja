import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Loading from '../components/Loading';
import api from '../services/api';
import { toast } from 'react-toastify';
import './ProductDetails.css';

const StarRating = ({ value, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'star-filled' : ''} ${readonly ? 'star-readonly' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [media, setMedia] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [novaNota, setNovaNota] = useState(0);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    api.get(`/produtos/${id}`)
      .then(res => {
        setProduct(res.data);
        setSelectedImage(res.data.urlImagem || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    carregarAvaliacoes();
  }, [id]);

  const carregarAvaliacoes = () => {
    api.get(`/avaliacoes/produto/${id}`)
      .then(res => {
        setAvaliacoes(res.data.avaliacoes || []);
        setMedia(res.data.media || 0);
        setTotalAvaliacoes(res.data.total || 0);
      })
      .catch(() => {});
  };

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (novaNota === 0) { toast.error('Selecione uma nota.'); return; }
    setEnviandoAvaliacao(true);
    try {
      await api.post(`/avaliacoes/produto/${id}`, { nota: novaNota, comentario: novoComentario });
      toast.success('Avaliação enviada!');
      setNovaNota(0);
      setNovoComentario('');
      carregarAvaliacoes();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao enviar avaliação.';
      toast.error(msg);
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  if (loading) return <Loading texto="Carregando detalhes do produto..." />;
  if (!product) return <div className="product-details-loading">Produto não encontrado.</div>;

  const allImages = [product.urlImagem, ...(product.imagens || [])].filter(Boolean);
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    if (product.tamanhos && product.tamanhos.length > 0 && !selectedSize) {
      alert('Por favor, selecione um tamanho antes de adicionar ao carrinho.');
      return;
    }
    addToCart({ ...product, selectedSize: selectedSize || null });
    navigate('/catalogo');
  };

  const jaAvaliou = avaliacoes.some(a => a.usuario?.id === user?.id);

  return (
    <div className="product-details-container">
      <div className="product-details-gallery">
        <div className="product-details-main-image">
          <img src={selectedImage || 'https://via.placeholder.com/600x800?text=LF+Clothing'} alt={product.nome} loading="lazy" />
          <button className={`product-details-fav-btn ${fav ? 'product-fav-active' : ''}`} onClick={() => toggleFavorite(product)} title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
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

          {product.precoPromocional && product.precoPromocional < product.preco ? (
            <div className="product-details-price-wrapper">
              <span className="product-details-price-old">R$ {product.preco.toFixed(2)}</span>
              <span className="product-details-price product-details-price-promo">R$ {product.precoPromocional.toFixed(2)}</span>
              <span className="product-details-discount-badge">-{Math.round((1 - product.precoPromocional / product.preco) * 100)}%</span>
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
                  title={qty > 0 ? `${qty} disponíveis` : 'Esgotado'}
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
            ? (product.estoqueTamanhos?.[selectedSize] > 0
                ? `${product.estoqueTamanhos[selectedSize]} em estoque (${selectedSize})`
                : 'Esgotado neste tamanho')
            : (product.quantidadeEstoque > 0 ? `${product.quantidadeEstoque} em estoque` : 'Esgotado')
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

      {/* Avaliações */}
      <div className="reviews-section">
        <h2 className="reviews-title">Avaliações dos Clientes</h2>

        {totalAvaliacoes > 0 && (
          <div className="reviews-summary">
            <div className="reviews-summary-score">
              <span className="reviews-big-number">{media.toFixed(1)}</span>
              <StarRating value={Math.round(media)} readonly />
              <span className="reviews-count">{totalAvaliacoes} {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
          </div>
        )}

        {user && !jaAvaliou && (
          <form onSubmit={handleEnviarAvaliacao} className="review-form">
            <h4 className="review-form-title">Deixe sua avaliação</h4>
            <StarRating value={novaNota} onChange={setNovaNota} />
            <textarea
              placeholder="Conte sua experiência com o produto (opcional)"
              value={novoComentario}
              onChange={e => setNovoComentario(e.target.value)}
              maxLength={500}
              className="review-textarea"
              rows={3}
            />
            <button type="submit" className="btn-primary review-submit-btn" disabled={enviandoAvaliacao}>
              {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        )}

        {!user && (
          <p className="reviews-login-hint">Faça <a href="/auth">login</a> para avaliar este produto.</p>
        )}

        <div className="reviews-list">
          {avaliacoes.length === 0 ? (
            <p className="reviews-empty">Nenhuma avaliação ainda. Seja o primeiro!</p>
          ) : (
            avaliacoes.map(a => (
              <div key={a.id} className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar">{(a.usuario?.nome || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <span className="review-author">{a.usuario?.nome || 'Cliente'}</span>
                    <span className="review-date">{new Date(a.dataCriacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="review-card-stars">
                    <StarRating value={a.nota} readonly />
                  </div>
                </div>
                {a.comentario && <p className="review-text">{a.comentario}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

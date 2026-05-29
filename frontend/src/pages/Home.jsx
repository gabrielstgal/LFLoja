import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import useBannerCarousel from '../hooks/useBannerCarousel';
import { buscarProdutos } from '../services/produtoService';
import { listarCategorias } from '../services/categoriaService';
import { listarBanners } from '../services/bannerService';
import './Home.css';

const Home = () => {
  const [novidades, setNovidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArrow, setShowArrow] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { current, bannerIndex, setBannerIndex, slides } = useBannerCarousel(banners);

  useEffect(() => {
    Promise.all([
      buscarProdutos({ pagina: 0, tamanho: 8 })
        .then(data => setNovidades(data.content || []))
        .catch(() => setNovidades([])),
      listarCategorias()
        .then(data => setCategorias(data))
        .catch(() => setCategorias([])),
      listarBanners()
        .then(data => setBanners(data))
        .catch(() => setBanners([])),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowArrow(el.scrollWidth > el.clientWidth + 10);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [categorias]);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <>
      {slides.length > 0 && current && (
        <section className="hero-banner-carousel">
          <div
            className="hero-banner-slide hero-banner-image-only"
            onClick={() => navigate(current.link || '/catalogo')}
            style={{ cursor: 'pointer' }}
          >
            <img key={current.id} src={current.urlImagem} alt={current.titulo || 'LF Clothing'} className="hero-banner-full-img" />
          </div>
          {slides.length > 1 && (
            <div className="hero-banner-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`hero-banner-dot ${idx === bannerIndex ? 'active' : ''}`}
                  onClick={() => setBannerIndex(idx)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {categorias.length > 0 && (
        <section className="categories-section">
          <div className="categories-header">
            <div>
              <p className="categories-label">Explore por</p>
              <h2 className="categories-title">Categorias</h2>
            </div>
            {showArrow && (
              <button className="categories-arrow" onClick={scrollRight} aria-label="Ver mais categorias">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>
          <div className="categories-scroll" ref={scrollRef}>
            {categorias.map(cat => (
              <div key={cat.id} className="category-card" onClick={() => navigate(`/catalogo?categoria=${cat.nome}`)}>
                {cat.urlImagem ? (
                  <img src={cat.urlImagem} alt={cat.nome} loading="lazy" />
                ) : (
                  <div className="category-card-placeholder" />
                )}
                <div className="category-card-overlay">
                  <span className="category-card-label">{cat.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="highlights-section">
        <div className="highlights-header">
          <div>
            <p className="highlights-label">Recém chegados</p>
            <h2 className="highlights-title">Novidades</h2>
          </div>
          <a href="/catalogo" className="highlights-link">Ver tudo</a>
        </div>

        {loading ? (
          <Loading texto="Carregando novidades..." />
        ) : novidades.length === 0 ? (
          <p className="highlights-empty">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="highlights-grid">
            {novidades.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;

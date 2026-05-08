import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [novidades, setNovidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showArrow, setShowArrow] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/produtos/buscar?pagina=0&tamanho=8&ordenar=id,desc')
        .then(res => setNovidades(res.data.content || []))
        .catch(() => setNovidades([])),
      api.get('/categorias')
        .then(res => setCategorias(res.data || []))
        .catch(() => setCategorias([])),
      api.get('/banners')
        .then(res => setBanners(res.data || []))
        .catch(() => setBanners([])),
    ]).finally(() => setLoading(false));
  }, []);

  // Auto-slide banners (padrão intercalado com banners ativos)
  const totalSlides = banners.length > 0 ? banners.length * 2 : 1;
  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

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
      <section className="hero-banner-carousel">
        {(() => {
          const slides = [];
          if (banners.length > 0) {
            banners.forEach((banner) => {
              slides.push(null);
              slides.push(banner);
            });
          } else {
            slides.push(null);
          }
          const current = slides[bannerIndex] || null;
          return (
            <>
              <div className="hero-banner-slide">
                <div className="hero-left">
                  <span className="hero-badge">{current?.badge || 'Nova Coleção 2026'}</span>
                  <h1 className="hero-title">
                    {current?.titulo || <>Estilo que marca <span className="hero-title-accent">presença.</span></>}
                  </h1>
                  <p className="hero-subtitle">
                    {current?.subtitulo || 'Vista o melhor da moda masculina em Campina Grande. Exclusividade, qualidade e a força que você merece.'}
                  </p>
                  <button onClick={() => navigate(current?.link || '/catalogo')} className="btn-primary hero-cta">
                    {current?.textoBotao || 'Explorar Coleção'}
                  </button>
                </div>
                <div className="hero-right">
                  <img key={current?.id || 'default'} src={current?.urlImagem || '/img/produtos/IMG_9668.jpg'} alt="LF Clothing" className="hero-model-img" />
                </div>
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
            </>
          );
        })()}
      </section>

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

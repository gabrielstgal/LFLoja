import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import useProductFilters from '../hooks/useProductFilters';
import { getPrecoEfetivo } from '../utils/productUtils';
import './Catalog.css';

// Tamanhos sempre visiveis no filtro (cobre P-GG e os plus G1-G3 usados na loja).
// O backend salva os tamanhos em MAIUSCULAS, entao usamos o mesmo formato.
const BASE_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'G3'];
// Ordem de exibicao; tamanhos fora desta lista vao para o final (ordem alfabetica).
const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'G3', 'G4', 'XG', 'XGG'];

const Catalog = () => {
  const {
    products, loading, totalElements, dynamicCategories,
    selectedCategories, setSelectedCategories,
    selectedSize, setSelectedSize,
    page, setPage,
    busca, buscaInput, setBuscaInput,
    precoMin, setPrecoMin, precoMax, setPrecoMax,
    handleCategoryChange, handleSearch, clearSearch,
  } = useProductFilters();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() =>
    products.filter(p => { const preco = getPrecoEfetivo(p); return preco >= precoMin && preco <= precoMax; }),
    [products, precoMin, precoMax]
  );

  // Une os tamanhos base com os realmente presentes nos produtos carregados,
  // garantindo que tamanhos como G1/G2 sempre aparecam no filtro.
  const availableSizes = useMemo(() => {
    const set = new Set(BASE_SIZES);
    products.forEach(p => (p.tamanhos || []).forEach(t => {
      if (t && t.trim()) set.add(t.trim().toUpperCase());
    }));
    return [...set].sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [products]);

  return (
    <div className="catalog-container">
      <aside className={`catalog-sidebar ${filtersOpen ? 'catalog-sidebar-open' : ''}`}>
        <h3 className="catalog-filters-toggle" onClick={() => setFiltersOpen(prev => !prev)}>
          Filtros
          <svg className={`catalog-filters-arrow ${filtersOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </h3>

        <div className="catalog-filters-content">
        <div>
          <h4 className="catalog-filter-title">Categorias</h4>
          <ul className="catalog-filter-list">
            <li>
              <label>
                <input type="checkbox" checked={selectedCategories.length === 0} onChange={() => { setSelectedCategories([]); setPage(0); }} />
                Todas
              </label>
            </li>
            {dynamicCategories.map(cat => (
              <li key={cat.id}>
                <label>
                  <input type="checkbox" checked={selectedCategories.includes(cat.nome)} onChange={() => handleCategoryChange(cat.nome)} />
                  {cat.nome}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="catalog-filter-title">Tamanho</h4>
          <div className="catalog-size-filter">
            <button
              className={`catalog-size-btn ${selectedSize === '' ? 'active' : ''}`}
              onClick={() => { setSelectedSize(''); setPage(0); }}
            >Todos</button>
            {availableSizes.map(s => (
              <button
                key={s}
                className={`catalog-size-btn ${selectedSize === s ? 'active' : ''}`}
                onClick={() => { setSelectedSize(s === selectedSize ? '' : s); setPage(0); }}
              >{s}</button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="catalog-filter-title">Preço</h4>
          <div className="catalog-price-filter">
            <label className="catalog-price-range-label">Mínimo</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={precoMin}
              onChange={e => { const v = Number(e.target.value); setPrecoMin(v > precoMax ? precoMax : v); setPage(0); }}
              className="catalog-price-range"
            />
            <label className="catalog-price-range-label">Máximo</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={precoMax}
              onChange={e => { const v = Number(e.target.value); setPrecoMax(v < precoMin ? precoMin : v); setPage(0); }}
              className="catalog-price-range"
            />
            <div className="catalog-price-labels">
              <span className="catalog-price-value">R$ {precoMin}</span>
              <span className="catalog-price-value">R$ {precoMax}</span>
            </div>
          </div>
        </div>
        </div>
      </aside>

      <div className="catalog-main">
        <div className="catalog-header">
          <h2>Produtos ({totalElements})</h2>
          <form onSubmit={handleSearch} className="catalog-search-form-inline">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={buscaInput}
              onChange={e => setBuscaInput(e.target.value)}
              className="catalog-search-input"
            />
            <button type="submit" className="catalog-search-btn">Buscar</button>
          </form>
        </div>

        {busca && (
          <div className="catalog-search-active">
            Resultados para: <strong>"{busca}"</strong>
            <button onClick={clearSearch} className="catalog-search-clear">Limpar</button>
          </div>
        )}

        {loading ? (
          <Loading texto="Carregando as peças..." />
        ) : products.length === 0 ? (
          <p>Nenhum produto encontrado com os filtros atuais.</p>
        ) : (
          <>
            <div className="catalog-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="catalog-pagination">
              <button className="btn-primary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</button>
              <button className="btn-primary" disabled={products.length < 12 || filteredProducts.length === 0} onClick={() => setPage(p => p + 1)}>Próxima</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;

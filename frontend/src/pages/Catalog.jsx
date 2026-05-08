import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import api from '../services/api';
import './Catalog.css';

const SIZES = ['P', 'M', 'G', 'GG', 'Único'];

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get('categoria');
    return cat ? [cat] : [];
  });
  const [selectedSize, setSelectedSize] = useState('');
  const [sort, setSort] = useState('id,desc');
  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [buscaInput, setBuscaInput] = useState(searchParams.get('busca') || '');
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(1000);

  useEffect(() => {
    api.get('/categorias')
      .then(res => setDynamicCategories(res.data || []))
      .catch(() => setDynamicCategories([]));
  }, []);

  useEffect(() => {
    const buscaParam = searchParams.get('busca');
    const catParam = searchParams.get('categoria');

    if (buscaParam && buscaParam !== busca) {
      setBusca(buscaParam);
      setBuscaInput(buscaParam);
      setPage(0);
    }
    if (catParam) {
      setSelectedCategories([catParam]);
      setPage(0);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    let url = `/produtos/buscar?pagina=${page}&tamanho=12&ordenar=${sort}`;
    if (selectedCategories.length > 0) {
      url += `&categorias=${selectedCategories.join(',')}`;
    }
    if (busca.trim()) {
      url += `&busca=${encodeURIComponent(busca.trim())}`;
    }
    if (selectedSize) {
      const sizeValue = selectedSize === 'Único' ? 'Unico' : selectedSize;
      url += `&tamanhoFiltro=${sizeValue}`;
    }

    api.get(url)
      .then(res => {
        setProducts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      })
      .catch(err => {
        console.error(err);
        if (err.response?.status === 404) {
          api.get('/produtos').then(res => setProducts(res.data));
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCategories, selectedSize, sort, page, busca]);

  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setBusca(buscaInput);
    setPage(0);
  };

  return (
    <div className="catalog-container">
      <aside className="catalog-sidebar">
        <h3>Filtros</h3>

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
            {SIZES.map(s => (
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
              onChange={e => { const v = Number(e.target.value); setPrecoMin(v > precoMax ? precoMax : v); }}
              className="catalog-price-range"
            />
            <label className="catalog-price-range-label">Máximo</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={precoMax}
              onChange={e => { const v = Number(e.target.value); setPrecoMax(v < precoMin ? precoMin : v); }}
              className="catalog-price-range"
            />
            <div className="catalog-price-labels">
              <span className="catalog-price-value">R$ {precoMin}</span>
              <span className="catalog-price-value">R$ {precoMax}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="catalog-main">
        <div className="catalog-header">
          <h2>Categorias ({totalElements})</h2>
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
            <button onClick={() => { setBusca(''); setBuscaInput(''); setPage(0); }} className="catalog-search-clear">Limpar</button>
          </div>
        )}

        {loading ? (
          <Loading texto="Carregando as peças..." />
        ) : products.length === 0 ? (
          <p>Nenhum produto encontrado com os filtros atuais.</p>
        ) : (
          <>
            <div className="catalog-grid">
              {products.filter(p => { const preco = p.precoPromocional || p.preco; return preco >= precoMin && preco <= precoMax; }).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="catalog-pagination">
              <button className="btn-primary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</button>
              <button className="btn-primary" disabled={products.length < 12} onClick={() => setPage(p => p + 1)}>Próxima</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;

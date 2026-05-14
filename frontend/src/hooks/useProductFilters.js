import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buscarProdutos } from '../services/produtoService';
import { listarCategorias } from '../services/categoriaService';

const useProductFilters = () => {
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
  const sort = 'id,desc';
  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [buscaInput, setBuscaInput] = useState(searchParams.get('busca') || '');
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(1000);

  useEffect(() => {
    listarCategorias()
      .then(data => setDynamicCategories(data))
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
  }, [searchParams, busca]);

  useEffect(() => {
    setLoading(true);
    buscarProdutos({
      pagina: page,
      tamanho: 12,
      ordenar: sort,
      categorias: selectedCategories,
      busca,
      tamanhoFiltro: selectedSize,
    })
      .then(data => {
        setProducts(data.content || []);
        setTotalElements(data.totalElements || 0);
      })
      .catch(() => setProducts([]))
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

  const clearSearch = () => {
    setBusca('');
    setBuscaInput('');
    setPage(0);
  };

  return {
    products, loading, totalElements, dynamicCategories,
    selectedCategories, setSelectedCategories,
    selectedSize, setSelectedSize,
    page, setPage,
    busca, buscaInput, setBuscaInput,
    precoMin, setPrecoMin, precoMax, setPrecoMax,
    handleCategoryChange, handleSearch, clearSearch,
  };
};

export default useProductFilters;

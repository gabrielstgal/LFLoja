import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { enviarAvaliacao } from '../../services/avaliacaoService';
import { formatDate } from '../../utils/formatUtils';
import StarRating from './StarRating';

const ReviewSection = ({ produtoId, avaliacoes, media, totalAvaliacoes, user, onReload }) => {
  const [novaNota, setNovaNota] = useState(0);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  const jaAvaliou = avaliacoes.some(a => a.usuario?.id === user?.id);

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (novaNota === 0) { toast.error('Selecione uma nota.'); return; }
    setEnviandoAvaliacao(true);
    try {
      await enviarAvaliacao(produtoId, { nota: novaNota, comentario: novoComentario });
      toast.success('Avaliação enviada!');
      setNovaNota(0);
      setNovoComentario('');
      onReload();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao enviar avaliação.';
      toast.error(msg);
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  return (
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
                  <span className="review-date">{formatDate(a.dataCriacao)}</span>
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
  );
};

export default ReviewSection;

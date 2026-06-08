import React from "react";
import { Link } from "react-router-dom";
import "./LegalPage.css";

export default function TrocasDevolucoes() {
  return (
    <div className="legal-container">
      <h1 className="legal-title">Trocas e Devoluções</h1>
      <span className="legal-updated">Última atualização: 08 de junho de 2026</span>

      <div className="legal-section">
        <h2>1. Direito de Arrependimento</h2>
        <p>
          De acordo com o <strong>Art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong>, compras
          realizadas pela internet garantem ao consumidor o direito de desistência no prazo de{" "}
          <strong>7 (sete) dias corridos</strong> a partir do recebimento do produto, sem necessidade de
          justificativa.
        </p>
        <p>
          Nesse caso, você receberá o reembolso integral do valor pago, incluindo o frete de envio original
          (quando aplicável), no prazo descrito na seção de Reembolsos.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Troca por Tamanho ou Modelo Errado</h2>
        <p>
          Aceitamos solicitações de troca por tamanho ou modelo diferente do pedido dentro do prazo de{" "}
          <strong>30 (trinta) dias corridos</strong> após o recebimento. Para que a troca seja realizada,
          o produto deve atender às condições descritas na seção 4 desta política.
        </p>
        <p>
          A troca está condicionada à disponibilidade do item desejado em estoque. Caso o produto não
          esteja disponível, você poderá optar por crédito na loja ou reembolso integral.
        </p>
      </div>

      <div className="legal-section">
        <h2>3. Troca por Produto com Defeito</h2>
        <p>
          Caso o produto apresente defeito de fabricação, você tem direito à troca ou devolução conforme
          o Código de Defesa do Consumidor:
        </p>
        <ul>
          <li>
            <strong>Produtos não duráveis</strong> (consumíveis): prazo de <strong>30 dias</strong> para reclamação
            após o recebimento.
          </li>
          <li>
            <strong>Produtos duráveis</strong> (roupas e acessórios): prazo de <strong>90 dias</strong> para
            reclamação após o recebimento.
          </li>
        </ul>
        <p>
          Em caso de defeito comprovado, a LF Clothing arcará com todos os custos de envio para devolução
          e reenvio do novo produto. O prazo para substituição é de até <strong>30 dias</strong> após
          o recebimento do produto com defeito em nosso endereço.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Condições do Produto para Troca ou Devolução</h2>
        <p>Para que a troca ou devolução seja aceita, o produto deve obrigatoriamente:</p>
        <ul>
          <li>Estar sem uso, lavagem ou qualquer tipo de alteração.</li>
          <li>Estar com todas as etiquetas originais ainda afixadas.</li>
          <li>Estar na embalagem original ou em embalagem que garanta a proteção durante o transporte.</li>
          <li>Não apresentar odores (perfume, suor, cigarro etc.) ou manchas.</li>
          <li>Ser acompanhado da nota fiscal ou comprovante de compra.</li>
        </ul>
        <p>
          Produtos que não atendam a essas condições serão devolvidos ao remetente e a solicitação será
          cancelada, salvo no caso de defeito de fabricação comprovado.
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Itens Não Sujeitos a Troca ou Devolução</h2>
        <p>Não aceitamos trocas ou devoluções nos seguintes casos:</p>
        <ul>
          <li>Produtos personalizados ou confeccionados sob medida para o cliente.</li>
          <li>Produtos com sinais evidentes de uso, lavagem ou dano causado pelo cliente.</li>
          <li>Produtos cujas etiquetas tenham sido removidas (exceto defeito de fabricação).</li>
          <li>Solicitações realizadas fora do prazo estipulado nesta política.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Como Solicitar Troca ou Devolução</h2>
        <p>
          Para iniciar o processo de troca ou devolução, entre em contato conosco pelo WhatsApp informando:
        </p>
        <ul>
          <li>Número do pedido (protocolo).</li>
          <li>Nome completo cadastrado na compra.</li>
          <li>Motivo da troca ou devolução.</li>
          <li>Fotos do produto (em caso de defeito ou divergência).</li>
        </ul>
        <div className="legal-contact">
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a href="https://wa.me/5583991899900" target="_blank" rel="noopener noreferrer">
              (83) 99189-9900
            </a>
          </p>
          <p>
            <strong>Instagram:</strong>{" "}
            <a href="https://instagram.com/uselfclothing" target="_blank" rel="noopener noreferrer">
              @uselfclothing
            </a>
          </p>
          <p>Atendimento: Segunda a Sábado, das 9h às 18h.</p>
        </div>
        <p>
          Após a análise da solicitação, você receberá as instruções de envio em até <strong>2 dias úteis</strong>.
          Não envie o produto sem antes receber a autorização e as instruções da nossa equipe.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Custos de Envio para Devolução</h2>
        <p>Os custos de envio para devolução são distribuídos da seguinte forma:</p>
        <ul>
          <li>
            <strong>Arrependimento (Art. 49 CDC):</strong> o custo do frete de devolução é de responsabilidade
            do cliente. O frete original pago na compra será reembolsado junto ao valor do produto.
          </li>
          <li>
            <strong>Produto com defeito ou erro nosso:</strong> a LF Clothing arca integralmente com os
            custos de frete de devolução e do reenvio. Nesse caso, enviaremos uma etiqueta de postagem pré-paga
            ou reembolsaremos o custo de envio.
          </li>
          <li>
            <strong>Troca por tamanho/modelo:</strong> o frete de devolução é por conta do cliente.
            O frete do reenvio é cobrado conforme tabela vigente, salvo campanhas promocionais.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>8. Reembolsos</h2>
        <p>
          Após o recebimento e análise do produto devolvido, o reembolso será processado conforme o método
          de pagamento original:
        </p>
        <ul>
          <li>
            <strong>Pix ou transferência bancária:</strong> reembolso em até <strong>5 dias úteis</strong> após
            a aprovação da devolução.
          </li>
          <li>
            <strong>Cartão de crédito:</strong> estorno processado em até <strong>10 dias úteis</strong>, podendo
            aparecer na fatura seguinte ou subsequente, conforme a operadora do cartão.
          </li>
          <li>
            <strong>Boleto bancário:</strong> reembolso via transferência bancária em até <strong>5 dias úteis</strong>,
            mediante informação dos dados bancários do cliente.
          </li>
        </ul>
        <p>
          O reembolso corresponde ao valor pago pelo produto. Cupons de desconto utilizados na compra não
          são reembolsados em dinheiro, podendo ser reemitidos como crédito na loja a critério da LF Clothing.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Prazo de Análise</h2>
        <p>
          Após o recebimento do produto devolvido em nosso endereço, realizaremos a análise em até{" "}
          <strong>5 dias úteis</strong>. Você será notificado pelo WhatsApp ou e-mail cadastrado sobre o
          resultado e as próximas etapas.
        </p>
        <p>
          Caso a devolução não seja aprovada (produto fora das condições aceitas), o item será devolvido
          ao cliente sem custo adicional.
        </p>
      </div>

      <div className="legal-section">
        <h2>10. Dúvidas</h2>
        <p>
          Ficou com alguma dúvida sobre nossa política de trocas e devoluções? Fale com nossa equipe:
        </p>
        <div className="legal-contact">
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a href="https://wa.me/5583991899900" target="_blank" rel="noopener noreferrer">
              (83) 99189-9900
            </a>
          </p>
          <p>
            <strong>Instagram:</strong>{" "}
            <a href="https://instagram.com/uselfclothing" target="_blank" rel="noopener noreferrer">
              @uselfclothing
            </a>
          </p>
        </div>
      </div>

      <div className="legal-links">
        <Link to="/politica-de-privacidade">Política de Privacidade</Link>
        <Link to="/termos-de-uso">Termos de Uso</Link>
        <Link to="/">Voltar para a Loja</Link>
      </div>
    </div>
  );
}

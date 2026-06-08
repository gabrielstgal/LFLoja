import React from "react";
import { Link } from "react-router-dom";
import "./LegalPage.css";

export default function TermosUso() {
  return (
    <div className="legal-container">
      <h1 className="legal-title">Termos de Uso</h1>
      <span className="legal-updated">Última atualização: 08 de junho de 2026</span>

      <div className="legal-section">
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar o site <strong>lfclothing.com.br</strong>, você concorda com estes Termos de Uso
          e com nossa{" "}
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>. Caso não concorde com qualquer
          disposição destes termos, pedimos que não utilize nossos serviços.
        </p>
        <p>
          Estes Termos de Uso regem a relação entre a <strong>LF Clothing</strong> (doravante "LF Clothing",
          "nós" ou "nosso") e os usuários do site (doravante "você", "usuário" ou "cliente").
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Uso do Site</h2>
        <p>
          O site lfclothing.com.br é destinado exclusivamente à venda de roupas masculinas ao consumidor final
          localizado no Brasil. Ao utilizar o site, você se compromete a:
        </p>
        <ul>
          <li>Fornecer informações verídicas, precisas e atualizadas no cadastro e nas compras.</li>
          <li>Não utilizar o site para fins ilegais, fraudulentos ou que violem direitos de terceiros.</li>
          <li>Não tentar acessar áreas restritas, sistemas internos ou dados de outros usuários.</li>
          <li>Não utilizar robôs, scrapers ou qualquer meio automatizado para coletar dados do site.</li>
          <li>Não reproduzir, copiar ou distribuir conteúdo do site sem autorização prévia por escrito.</li>
          <li>Respeitar as leis brasileiras aplicáveis e as boas práticas de uso da internet.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Criação de Conta e Responsabilidades</h2>
        <p>
          Para realizar compras no site, você precisará criar uma conta informando nome completo, e-mail e senha.
          Você é inteiramente responsável por:
        </p>
        <ul>
          <li>Manter a confidencialidade da sua senha e dos dados de acesso.</li>
          <li>Todas as atividades realizadas com a sua conta.</li>
          <li>Notificar imediatamente a LF Clothing em caso de uso não autorizado da sua conta.</li>
        </ul>
        <p>
          A LF Clothing reserva-se o direito de suspender ou encerrar contas que violem estes Termos de Uso,
          sem necessidade de aviso prévio.
        </p>
        <p>
          É permitido somente uma conta por pessoa. Contas duplicadas poderão ser encerradas a nosso critério.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Compras, Preços e Pagamentos</h2>
        <p>
          Todos os preços exibidos no site estão em reais brasileiros (R$) e incluem os impostos aplicáveis,
          salvo indicação em contrário. Os preços podem ser alterados sem aviso prévio, sendo que o valor
          vigente no momento da confirmação do pedido é o que prevalece.
        </p>
        <p>Aceitamos as seguintes formas de pagamento:</p>
        <ul>
          <li><strong>Pix:</strong> confirmação imediata do pagamento após a transferência.</li>
          <li><strong>Cartão de crédito:</strong> parcelamento conforme condições exibidas no checkout.</li>
          <li><strong>Boleto bancário:</strong> prazo de compensação de até 3 dias úteis.</li>
          <li><strong>Cartão de débito:</strong> sujeito à disponibilidade no checkout.</li>
        </ul>
        <p>
          O pedido só será processado e enviado após a confirmação do pagamento. A LF Clothing reserva-se o
          direito de cancelar pedidos em caso de suspeita de fraude ou inconsistências nos dados fornecidos.
        </p>
        <p>
          Erros de precificação evidentes (ex.: produto exibido com valor incorreto por falha técnica) não
          obrigam a LF Clothing a honrar o preço errado. Nesses casos, o cliente será notificado e poderá
          cancelar o pedido sem qualquer custo.
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Entrega e Frete</h2>
        <p>
          O prazo e o custo de entrega são calculados com base no CEP de destino informado no checkout.
          Os prazos indicados são estimativas e contam a partir da confirmação do pagamento. A LF Clothing
          não se responsabiliza por atrasos causados por transportadoras, greves, desastres naturais ou
          outros eventos fora do nosso controle.
        </p>
        <p>
          Em caso de extravio, atraso atípico ou entrega em endereço errado por falha nossa, nos comprometemos
          a solucionar o problema ou realizar o reenvio sem custo adicional.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Trocas e Devoluções</h2>
        <p>
          Nossa política de trocas e devoluções segue o Código de Defesa do Consumidor (Lei nº 8.078/1990)
          e está detalhada na página{" "}
          <Link to="/trocas-e-devolucoes">Trocas e Devoluções</Link>. Em resumo:
        </p>
        <ul>
          <li>Compras pela internet têm direito de arrependimento de 7 dias corridos após o recebimento (Art. 49 do CDC).</li>
          <li>Produtos com defeito podem ser trocados ou devolvidos no prazo legal de 30 dias para produtos não duráveis.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>7. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo do site lfclothing.com.br — incluindo mas não se limitando a textos, imagens,
          fotografias, logotipos, ícones, marcas, design, código-fonte e layout — é de propriedade exclusiva
          da LF Clothing ou licenciado a ela, e está protegido pela legislação brasileira de propriedade
          intelectual (Lei nº 9.279/1996 e Lei nº 9.610/1998).
        </p>
        <p>
          É vedada a reprodução, distribuição, modificação, exibição pública ou qualquer outra utilização do
          conteúdo sem autorização prévia e expressa da LF Clothing. Violações poderão ser tratadas na
          esfera cível e criminal.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Limitação de Responsabilidade</h2>
        <p>
          A LF Clothing envidará seus melhores esforços para manter o site disponível e funcional. No entanto,
          não nos responsabilizamos por:
        </p>
        <ul>
          <li>Interrupções temporárias do serviço por manutenção, falhas técnicas ou casos fortuitos.</li>
          <li>Danos decorrentes do uso indevido do site pelo usuário.</li>
          <li>Conteúdo de sites de terceiros para os quais possamos ter links.</li>
          <li>Danos indiretos, incidentais ou consequenciais, exceto nos casos previstos no CDC.</li>
        </ul>
        <p>
          Nossa responsabilidade, em qualquer hipótese, é limitada ao valor pago pelo produto ou serviço
          que originou a reclamação, nos termos do Código de Defesa do Consumidor.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Legislação Aplicável e Foro</h2>
        <p>
          Estes Termos de Uso são regidos pelas leis da <strong>República Federativa do Brasil</strong>,
          especialmente pelo Código de Defesa do Consumidor (Lei nº 8.078/1990), pelo Código Civil Brasileiro
          (Lei nº 10.406/2002) e pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>
        <p>
          Fica eleito o foro da Comarca de <strong>Campina Grande – PB</strong> para dirimir quaisquer
          controvérsias decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro,
          por mais privilegiado que seja, exceto nos casos em que o consumidor optar pelo foro de seu
          domicílio, conforme facultado pelo CDC.
        </p>
      </div>

      <div className="legal-section">
        <h2>10. Resolução de Disputas</h2>
        <p>
          Em caso de conflito, incentivamos que o usuário entre em contato conosco primeiramente pelos
          nossos canais de atendimento para tentativa de resolução amigável:
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
        <p>
          Caso não seja possível a resolução amigável, o consumidor pode também registrar reclamações na
          plataforma <strong>consumidor.gov.br</strong>, mantida pelo Governo Federal.
        </p>
      </div>

      <div className="legal-section">
        <h2>11. Alterações nos Termos de Uso</h2>
        <p>
          A LF Clothing reserva-se o direito de alterar estes Termos de Uso a qualquer momento, sendo as
          alterações publicadas nesta página com atualização da data de vigência. O uso continuado do site
          após a publicação das alterações constitui aceitação dos novos termos.
        </p>
        <p>
          Para alterações materiais que afetem direitos dos usuários, nos comprometemos a notificar via
          e-mail cadastrado, quando aplicável.
        </p>
      </div>

      <div className="legal-links">
        <Link to="/politica-de-privacidade">Política de Privacidade</Link>
        <Link to="/trocas-e-devolucoes">Trocas e Devoluções</Link>
        <Link to="/">Voltar para a Loja</Link>
      </div>
    </div>
  );
}

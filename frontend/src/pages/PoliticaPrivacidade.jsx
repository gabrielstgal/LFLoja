import React from "react";
import { Link } from "react-router-dom";
import "./LegalPage.css";

export default function PoliticaPrivacidade() {
  return (
    <div className="legal-container">
      <h1 className="legal-title">Política de Privacidade</h1>
      <span className="legal-updated">Última atualização: 08 de junho de 2026</span>

      <div className="legal-section">
        <h2>1. Introdução</h2>
        <p>
          A <strong>LF Clothing</strong>, pessoa jurídica de direito privado, com sede em Campina Grande – PB,
          operadora do site <strong>lfclothing.com.br</strong>, leva a privacidade dos seus clientes a sério.
          Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as suas
          informações pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)</strong>.
        </p>
        <p>
          Ao utilizar nosso site ou realizar uma compra, você declara estar ciente e de acordo com as práticas
          descritas nesta política.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Dados Pessoais Coletados</h2>
        <p>Coletamos os seguintes dados pessoais para viabilizar nossas operações:</p>
        <ul>
          <li><strong>Nome completo</strong> — identificação do cliente para emissão de pedidos e comunicação.</li>
          <li><strong>Endereço de e-mail</strong> — envio de confirmações de pedido, atualizações e comunicações.</li>
          <li><strong>CPF</strong> — exigido para emissão de nota fiscal e prevenção a fraudes.</li>
          <li><strong>Endereço de entrega</strong> — rua, número, complemento, bairro, cidade, estado e CEP.</li>
          <li><strong>Número de telefone / WhatsApp</strong> — contato sobre status de pedidos e suporte.</li>
          <li><strong>Dados de navegação</strong> — páginas visitadas, cliques e tempo de sessão (via cookies).</li>
          <li><strong>Dados de pagamento</strong> — não armazenamos dados de cartão; o processamento é feito por gateways certificados (PCI-DSS).</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Finalidade do Tratamento dos Dados</h2>
        <p>Seus dados pessoais são utilizados para as seguintes finalidades:</p>
        <ul>
          <li>Processar e entregar seus pedidos de compra.</li>
          <li>Emitir nota fiscal e documentos fiscais obrigatórios.</li>
          <li>Comunicar atualizações sobre o status do pedido, rastreamento e entrega.</li>
          <li>Prestar suporte ao cliente.</li>
          <li>Prevenir fraudes e garantir a segurança das transações.</li>
          <li>Melhorar a experiência de navegação e personalizar conteúdos.</li>
          <li>Enviar comunicações de marketing (somente com seu consentimento, sendo possível cancelar a qualquer momento).</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Compartilhamento de Dados</h2>
        <p>
          A LF Clothing não vende nem aluga seus dados pessoais. Podemos compartilhá-los somente nos seguintes casos:
        </p>
        <ul>
          <li>
            <strong>Gateways de pagamento:</strong> para processar transações com segurança (Pix, cartão de crédito,
            boleto bancário). Esses parceiros operam sob suas próprias políticas de privacidade e padrões PCI-DSS.
          </li>
          <li>
            <strong>Transportadoras e operadores logísticos:</strong> nome, endereço e telefone são compartilhados para
            viabilizar a entrega dos produtos.
          </li>
          <li>
            <strong>Autoridades competentes:</strong> quando exigido por lei, ordem judicial ou para proteção dos nossos
            direitos legais.
          </li>
          <li>
            <strong>Ferramentas de análise:</strong> dados de navegação anonimizados podem ser compartilhados com
            ferramentas de análise (ex.: Google Analytics) para melhoria contínua do serviço.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Armazenamento e Retenção de Dados</h2>
        <p>
          Seus dados são armazenados em servidores seguros com acesso restrito e protegido. Mantemos seus dados
          pessoais pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo:
        </p>
        <ul>
          <li>Dados de pedidos e fiscais: mínimo de <strong>5 anos</strong>, conforme exigência da legislação fiscal brasileira.</li>
          <li>Dados de conta: enquanto sua conta permanecer ativa. Após a exclusão da conta, os dados são anonimizados ou deletados em até <strong>90 dias</strong>, salvo obrigação legal.</li>
          <li>Dados de navegação (cookies): conforme o tempo de vida de cada cookie (veja seção de Cookies).</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Seus Direitos (LGPD)</h2>
        <p>
          Nos termos da Lei Geral de Proteção de Dados (LGPD), você possui os seguintes direitos em relação aos seus dados:
        </p>
        <ul>
          <li><strong>Acesso:</strong> solicitar a confirmação da existência e acesso aos seus dados pessoais.</li>
          <li><strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
          <li><strong>Exclusão:</strong> solicitar a eliminação dos seus dados, quando estes não sejam necessários por obrigação legal.</li>
          <li><strong>Portabilidade:</strong> solicitar a transferência dos seus dados para outro fornecedor de serviço.</li>
          <li><strong>Revogação do consentimento:</strong> retirar o consentimento dado para tratamentos baseados nele.</li>
          <li><strong>Oposição:</strong> opor-se ao tratamento realizado com fundamento em bases legais diversas do consentimento.</li>
          <li><strong>Informação:</strong> ser informado sobre as entidades públicas e privadas com as quais compartilhamos seus dados.</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, entre em contato conosco pelos canais indicados na seção de Contato
          abaixo. Responderemos em até <strong>15 dias úteis</strong>.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Cookies</h2>
        <p>
          Utilizamos cookies (pequenos arquivos de texto armazenados no seu dispositivo) para garantir o
          funcionamento do site e melhorar sua experiência:
        </p>
        <ul>
          <li><strong>Cookies essenciais:</strong> necessários para autenticação, carrinho de compras e segurança da sessão. Não podem ser desativados.</li>
          <li><strong>Cookies de preferências:</strong> lembram suas configurações e preferências de navegação.</li>
          <li><strong>Cookies analíticos:</strong> coletam dados anonimizados sobre como você usa o site, ajudando a melhorar a experiência.</li>
        </ul>
        <p>
          Você pode gerenciar ou desativar cookies nas configurações do seu navegador. A desativação de cookies
          essenciais pode impedir o funcionamento correto do site.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Segurança dos Dados</h2>
        <p>
          Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado,
          perda, destruição ou divulgação indevida, incluindo criptografia HTTPS, autenticação por tokens seguros e
          controle de acesso restrito.
        </p>
        <p>
          Em caso de incidente de segurança que possa causar risco ou dano a você, notificaremos a Autoridade Nacional
          de Proteção de Dados (ANPD) e os titulares afetados conforme exigido pela LGPD.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Controlador dos Dados</h2>
        <p>
          O controlador responsável pelo tratamento dos seus dados pessoais é:
        </p>
        <div className="legal-contact">
          <p><strong>LF Clothing</strong></p>
          <p>Campina Grande – PB, Brasil</p>
          <p>Site: <a href="https://lfclothing.com.br" target="_blank" rel="noopener noreferrer">lfclothing.com.br</a></p>
          <p>Instagram: <a href="https://instagram.com/uselfclothing" target="_blank" rel="noopener noreferrer">@uselfclothing</a></p>
        </div>
      </div>

      <div className="legal-section">
        <h2>10. Contato para Solicitações de Privacidade</h2>
        <p>
          Para exercer seus direitos, tirar dúvidas ou fazer solicitações relacionadas à privacidade e proteção
          de dados, entre em contato:
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

      <div className="legal-section">
        <h2>11. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Quando houver alterações relevantes,
          publicaremos a versão atualizada nesta página com a nova data de vigência. Recomendamos que você
          consulte esta página regularmente.
        </p>
      </div>

      <div className="legal-links">
        <Link to="/termos-de-uso">Termos de Uso</Link>
        <Link to="/trocas-e-devolucoes">Trocas e Devoluções</Link>
        <Link to="/">Voltar para a Loja</Link>
      </div>
    </div>
  );
}

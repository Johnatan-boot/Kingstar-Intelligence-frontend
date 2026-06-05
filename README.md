KingStar Intelligence — Front-end
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093313" src="https://github.com/user-attachments/assets/9a0d6790-c2b4-406d-87b2-9730220e6fbf" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093244" src="https://github.com/user-attachments/assets/1e7c840e-27e4-433e-afb8-a5cdc3b7a376" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093217" src="https://github.com/user-attachments/assets/090d0dea-148c-42a0-a579-2b36c192e2ce" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093115" src="https://github.com/user-attachments/assets/f56fe638-74df-4b1a-ad21-873ec5bffb38" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093055" src="https://github.com/user-attachments/assets/0512afbc-8fda-4860-b0a4-3cf8e9edd03a" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093027" src="https://github.com/user-attachments/assets/f3273fd6-f226-4269-b37d-2ccd1a78d064" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 093006" src="https://github.com/user-attachments/assets/fdc509dd-9ee6-4431-bfde-02e6174004bd" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092945" src="https://github.com/user-attachments/assets/c7b82a38-112e-4449-be9e-e7d579dd529b" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092927" src="https://github.com/user-attachments/assets/40d47715-ce95-473e-8466-eed52dde914a" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092904" src="https://github.com/user-attachments/assets/fce93f51-060e-44b7-9c75-597bb73c60b6" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092840" src="https://github.com/user-attachments/assets/261bfe52-2a9a-4c3c-a85e-38503615a9ee" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092814" src="https://github.com/user-attachments/assets/3a359b06-6e34-4cbc-a33c-83f6d8d0ff03" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092752" src="https://github.com/user-attachments/assets/9d513d3f-a625-4455-9942-36f612e312e9" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092729" src="https://github.com/user-attachments/assets/d8aa425e-ce34-415d-85f0-bd1a40221a93" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092700" src="https://github.com/user-attachments/assets/c03c540f-6433-4691-b1b7-cd7f5d52ff9f" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092646" src="https://github.com/user-attachments/assets/791b4c96-06b9-4d4e-810a-12acdd315fc1" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092626" src="https://github.com/user-attachments/assets/88993c50-2909-4f55-b76c-9c1977842dbe" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092610" src="https://github.com/user-attachments/assets/14f51d44-6b35-4091-b162-d7e345306694" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092553" src="https://github.com/user-attachments/assets/e0eceb88-ce46-47a8-84f1-55488239b214" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092537" src="https://github.com/user-attachments/assets/860eb12d-872b-416a-b210-ac5d3a559f5f" />
<img width="1366" height="768" alt="Captura de tela 2026-06-04 092322" src="https://github.com/user-attachments/assets/03820097-1ccb-4516-9637-55ceca1e3cac" />
Interface da plataforma de inteligência operacional (WMS) da KingStar. Construída em React + TypeScript, com foco em performance, responsividade e experiência de uso para a operação logística.

🔗 Demo / Deploy: [[adicione o link do deploy aqui](https://kingstar-intelligence-frontend.onrender.com/)]
🔧 API (back-end): [[link do repositório back-end](https://kingstar-intelligence-backend.onrender.com/)]
📁 Código-fonte: privado — disponibilizo acesso de leitura sob solicitação em processos seletivos.

ℹ️ Este repositório é uma vitrine de portfólio. O código-fonte é mantido privado por se tratar de um projeto de produção. Esta página documenta as decisões de front-end e os resultados.


🎯 Visão geral
Camada de apresentação do KingStar Intelligence. Responsável por toda a experiência do usuário: painel operacional, gestão de estoque, movimentações e visualização de indicadores. Consome uma API REST construída em Node.js + Fastify (repositório separado).

🧰 Stack & Tecnologias

React + TypeScript — tipagem forte e componentização
Design responsivo — otimizado para desktop e dispositivos móveis
Camada de serviços centralizada para consumo da API (cliente HTTP autenticado)
Autenticação via JWT — token gerenciado em contexto global, com rotas protegidas
Controle de acesso por papéis no front (exibição condicional por permissão)


⚙️ Funcionalidades de interface
Página de Estoque

Curva ABC — visualização da classificação de itens por relevância.
Alertas de estoque — destaque visual de itens em ponto crítico.
Ajuste em lote — modal com upload de CSV.
Exportação — geração de arquivos em CSV e JSON.
Filtros avançados — busca e ordenação por coluna.

Operação

Dashboard com KPIs operacionais.
Telas de movimentação e gestão de pedidos de compra.
Fluxo de autenticação completo (login, sessão e logout).


🧩 Decisões de front-end

Tipagem forte de ponta a ponta — interfaces TypeScript espelhando os contratos da API, reduzindo erros de integração.
Componentização reutilizável — tabelas, modais e filtros desacoplados.
Camada de API isolada — um wrapper central trata token, headers e erros, evitando lógica de requisição espalhada pelos componentes.
Estado de autenticação em contexto — isAuthenticated só verdadeiro quando há usuário e token válido.


🔗 Integração com o back-end
O front consome a API Fastify (Clean Architecture / DDD / CQRS) via REST, autenticando-se por JWT. Cada chamada carrega o token no header e respeita o controle de acesso por papel definido no servidor.
#mermaid-r10g-r3{font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-r10g-r3 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-r10g-r3 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-r10g-r3 .error-icon{fill:#CC785C;}#mermaid-r10g-r3 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-r10g-r3 .edge-thickness-normal{stroke-width:1px;}#mermaid-r10g-r3 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-r10g-r3 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-r10g-r3 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-r10g-r3 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-r10g-r3 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-r10g-r3 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-r10g-r3 .marker.cross{stroke:#A1A1A1;}#mermaid-r10g-r3 svg{font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;}#mermaid-r10g-r3 p{margin:0;}#mermaid-r10g-r3 .label{font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#E5E5E5;}#mermaid-r10g-r3 .cluster-label text{fill:#3387a3;}#mermaid-r10g-r3 .cluster-label span{color:#3387a3;}#mermaid-r10g-r3 .cluster-label span p{background-color:transparent;}#mermaid-r10g-r3 .label text,#mermaid-r10g-r3 span{fill:#E5E5E5;color:#E5E5E5;}#mermaid-r10g-r3 .node rect,#mermaid-r10g-r3 .node circle,#mermaid-r10g-r3 .node ellipse,#mermaid-r10g-r3 .node polygon,#mermaid-r10g-r3 .node path{fill:transparent;stroke:#A1A1A1;stroke-width:1px;}#mermaid-r10g-r3 .rough-node .label text,#mermaid-r10g-r3 .node .label text,#mermaid-r10g-r3 .image-shape .label,#mermaid-r10g-r3 .icon-shape .label{text-anchor:middle;}#mermaid-r10g-r3 .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-r10g-r3 .rough-node .label,#mermaid-r10g-r3 .node .label,#mermaid-r10g-r3 .image-shape .label,#mermaid-r10g-r3 .icon-shape .label{text-align:center;}#mermaid-r10g-r3 .node.clickable{cursor:pointer;}#mermaid-r10g-r3 .root .anchor path{fill:#A1A1A1!important;stroke-width:0;stroke:#A1A1A1;}#mermaid-r10g-r3 .arrowheadPath{fill:#0b0b0b;}#mermaid-r10g-r3 .edgePath .path{stroke:#A1A1A1;stroke-width:1px;}#mermaid-r10g-r3 .flowchart-link{stroke:#A1A1A1;fill:none;}#mermaid-r10g-r3 .edgeLabel{background-color:transparent;text-align:center;}#mermaid-r10g-r3 .edgeLabel p{background-color:transparent;}#mermaid-r10g-r3 .edgeLabel rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-r10g-r3 .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#mermaid-r10g-r3 .cluster rect{fill:#CC785C;stroke:hsl(15, 12.3364485981%, 48.0392156863%);stroke-width:1px;}#mermaid-r10g-r3 .cluster text{fill:#3387a3;}#mermaid-r10g-r3 .cluster span{color:#3387a3;}#mermaid-r10g-r3 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:12px;background:#CC785C;border:1px solid hsl(15, 12.3364485981%, 48.0392156863%);border-radius:2px;pointer-events:none;z-index:100;}#mermaid-r10g-r3 .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#E5E5E5;}#mermaid-r10g-r3 rect.text{fill:none;stroke-width:0;}#mermaid-r10g-r3 .icon-shape,#mermaid-r10g-r3 .image-shape{background-color:transparent;text-align:center;}#mermaid-r10g-r3 .icon-shape p,#mermaid-r10g-r3 .image-shape p{background-color:transparent;padding:2px;}#mermaid-r10g-r3 .icon-shape .label rect,#mermaid-r10g-r3 .image-shape .label rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-r10g-r3 .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#mermaid-r10g-r3 .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#mermaid-r10g-r3 .node .neo-node{stroke:#A1A1A1;}#mermaid-r10g-r3 [data-look="neo"].node rect,#mermaid-r10g-r3 [data-look="neo"].cluster rect,#mermaid-r10g-r3 [data-look="neo"].node polygon{stroke:url(#mermaid-r10g-r3-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r10g-r3 [data-look="neo"].node path{stroke:url(#mermaid-r10g-r3-gradient);stroke-width:1px;}#mermaid-r10g-r3 [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r10g-r3 [data-look="neo"].node .neo-line path{stroke:#A1A1A1;filter:none;}#mermaid-r10g-r3 [data-look="neo"].node circle{stroke:url(#mermaid-r10g-r3-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r10g-r3 [data-look="neo"].node circle .state-start{fill:#000000;}#mermaid-r10g-r3 [data-look="neo"].icon-shape .icon{fill:url(#mermaid-r10g-r3-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r10g-r3 [data-look="neo"].icon-shape .icon-neo path{stroke:url(#mermaid-r10g-r3-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r10g-r3 :root{--mermaid-font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}HTTP + JWTFront-endReact + TypeScriptAPI RESTFastify (repo separado)MySQL

📈 Resultado
Interface robusta, responsiva e tipada que entrega recursos analíticos (Curva ABC, alertas, exportação e KPIs) diretamente para a operação, com fluxo de autenticação seguro e integração consistente com a API.

Para acesso ao código-fonte privado em processos seletivos, é só solicitar.


📬 Contato

LinkedIn: [seu link]
Portfólio: [seu link]
E-mail: [seu e-mail]

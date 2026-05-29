# Arquitetura do Sistema: KingStar Core (WMS & Logistics)

Este documento descreve a arquitetura ideal e a implementação atual do **KingStar Core**, um sistema de inteligência operacional para logística e WMS (Warehouse Management System).

## 1. A Arquitetura Ideal: Microfrontends (MFE)

Para um sistema de grande porte focado em cadeia de suprimentos (Supply Chain), a melhor arquitetura de front-end é baseada em **Microfrontends**.

### Por que Microfrontends?
* **Domínios Complexos e Isolados:** Logística envolve muitos subdomínios (Financeiro, Estoque, Recebimento, Compras, Portaria/Agenda, Analytics). Cada um possui regras de negócio complexas.
* **Escalabilidade de Times:** Permite que diferentes esquadrões (squads) trabalhem em domínios específicos (Ex: Squad de Recebimento, Squad de Faturamento) sem gerar conflitos no mesmo código.
* **Deploy Independente:** Uma falha ou atualização no módulo de `Compras` não exige o redeploy do `Core` ou derruba o módulo de `Recebimento`.
* **Agnóstico a Tecnologia (Opcional):** Permite que, no futuro, um módulo legado seja reescrito em outra tecnologia (Vue, Angular, ou React mais recente) sem afetar o restante do ecossistema.

### Componentes da Arquitetura Certa (Produção Real)
Num ambiente empresarial (Enterprise), a stack ideal utilizaria:
1. **Monorepo Manager (Nx ou Turborepo):** Para gerenciar múltiplos aplicativos e pacotes compartilhados em um único repositório, garantindo cache de build e consistência de dependências.
2. **Module Federation (Webpack 5 ou Vite):** A tecnologia padrão ouro para carregar aplicações remotas dinamicamente em tempo de execução (runtime).
3. **App Shell (Host):** Uma aplicação super leve responsável apenas por:
   - Autenticação e Autorização (SSO, JWT)
   - Layout Global (Sidebar, Topbar)
   - Roteamento Global
   - Event Bus global persistente (Comunicação entre MFEs)

## 2. Implementação Atual (Simulação)

No ambiente atual, estamos utilizando um padrão de **Monolito Modular** que *simula* o comportamento de Microfrontends. Como estamos restritos a uma única aplicação React (Vite no AI Studio), estruturamos o projeto para emular a independência técnica dos MFEs.

### Estrutura de Diretórios
O código foi dividido fisicamente para representar as aplicações, como num monorepo:

```text
src/
 ├── apps/
 │    ├── shell/               # Aplicação Host/Orquestrador (Layout, Auth, Event Bus)
 │    ├── mfe-ayda/            # IA Agent e Core Dashboard
 │    ├── mfe-financeiro/      # Microfrontend de Finanças
 │    ├── mfe-estoque/         # Microfrontend de Gestão de Inventário
 │    ├── mfe-compras/         # Microfrontend de Pedidos e Fornecedores
 │    ├── mfe-recebimento/     # Microfrontend de Doca/Recebimento
 │    ├── mfe-conferencia/     # Microfrontend de Bipagem/Auditoria
 │    ├── mfe-analytics/       # Microfrontend de Relatórios
 │    └── mfe-agenda/          # Microfrontend de Agendamento/Janelas
 │
 ├── components/               # Componentes visuais globais (UI Kit / Design System)
 └── services/                 # Serviços globais simulados (API, Infra)
```

### Como o Shell funciona nesta simulação?
- O `ShellLayout.tsx` atua como o Container. Ele renderiza a Sidebar de navegação baseada num "MFE Registry".
- O carregamento dos MFEs é feito dinamicamente usando o `React.lazy()` e `Suspense`. Quando você clica em "Compras", o React faz o download apenas do chunk JavaScript referente ao `mfe-compras` (Code Splitting).
- O `ShellProvider.tsx` expõe um Context API atuando como o **Event Bus** (`publishEvent`, `subscribeEvent`), permitindo que um MFE fale com outro sem acoplamento direto.

## 3. Comunicação Baseada em Eventos

A regra de ouro dos Microfrontends é: **Eles não devem conhecer a existência um do outro diretamente**.
Nenhuma tela do `mfe-compras` deve importar um componente do `mfe-estoque`.

**Exemplo de fluxo ideal (Core AI + Recebimento):**
1. O usuário no `mfe-recebimento` confirma a chegada de um caminhão.
2. O `mfe-recebimento` dispara um evento no Shell: `shell.publishEvent('RECEIVING_ARRIVED', { nf: '123' })`.
3. O `mfe-ayda` (IA), que está escutando o Shell (em background), recebe o evento e analisa proativamente se há divergências, alertando o usuário via widget.

## 3. Camada 3: Back-End (Microserviços)

Seguindo o princípio de design de software orientado a domínio (Domain-Driven Design - DDD), a lógica de negócio do servidor é quebrada em serviços focados:

*   **Serviço de WMS (Core):** Responsável pelo inventário, posições físicas, ordens de separação. (Geralmente desenvolvido em linguagens focadas em performance como Java, C# ou Go).
*   **Serviço Ayda AI:** Um microsserviço próprio (geralmente em Python puro ou FastAPI) conectado aos LLMs (Gemini, ChatGPT), bancos vetoriais (ChromaDB, Pinecone) e embeddings. Isolar este serviço é vital para não disputar ou penalizar o processamento do banco transacional num pico de inteligência.
*   **Serviço Financeiro/Compras:** Gerencia a emissão de NFEs, conciliações e pagamentos.

Esses serviços atuam como provedores focados para a camada visual (via BFF ou diretamente). No projeto atual, há um diretório `/src/backend-simulator/services/` emulando esse ambiente.

## 4. Camada 4: Mensageria e Eventos (O Segredo da Logística)

Sistemas de tipo WMS e Cadeia de Suprimentos (Supply Chain) robustos são fortemente **baseados em eventos**.
Dada a complexidade e coordenação necessárias, um MFE ou Microsserviço raramente faz requisições (requests) RPC síncronas diretamente uns para os outros, e sim, **publicam eventos**.

### A Arquitetura Orientada a Eventos (Event-Driven)

1.  **Kafka ou RabbitMQ:** Ferramentas de *Message Broker*.
2.  **Choreography vs Orchestration:**
    Quando o "MFE Recebimento" finaliza a conferência de uma nota, o back-end lança um evento: `CONFERENCIA_CONCLUIDA_NF_1234`. O evento propaga pelo barramento.
    *   O **Serviço de Estoque** escuta o evento e dá entrada física no material automaticamente.
    *   O **Serviço da IA (Ayda)** escuta esse mesmo evento e "aprende" o tempo médio de descarregamento deste fornecedor visando análises futuras.
    *   O **Serviço Financeiro** escuta e automaticamente programa o Contas a Pagar baseado no XML aprovado.

Com esta abordagem, nós evitamos pontos únicos de falha e acoplamento rígido de serviços, garantindo resiliência (se o Financeiro cair, o WMS continua descarregando caminhões e os eventos repassam assim que o Financeiro for reiniciado).

No cenário atual (nosso MVP), simulamos o Barramento de Mensagens através de uma classe `MessageBroker` instanciada em `EventBus.ts` (`src/backend-simulator/EventBus.ts`) permitindo a publicação assíncrona para que os Microsserviços virtuais do WMS, Ayda (IA), Financeiro ouçam os disparos originados pelo *Shell Event Bus* dos *Microfrontends*.

## 5. Caminho de Evolução (Roadmap Técnico)

Para levar esta arquitetura para um nível superior no mundo real, os próximos passos seriam:

1. **Extração de Design System:** Criar uma biblioteca externa de componentes (ex: `@kingstar/ui`) para que todos os MFEs importem botões e tabelas visualmente idênticos, garantindo usabilidade consistente.
2. **Setup do Module Federation:** Mover as pastas dentro de `src/apps/` para aplicações reais isoladas (com seu próprio `vite.config.ts` e `package.json`). Atualizar o Shell para carregar os manifestos remotamente (Ex: `import('mfe-estoque/App')`).
3. **BFF (Backend For Frontend):** Cada MFE possuiria seu próprio GraphQL ou API Gateway para focar estritamente nos dados que a UI precisa, ocultando integrações SOAP legadas com o ERP.
4. **Extração do Backend para Microsserviços Reais:** Migrar o `backend-simulator` para microsserviços autônomos conectados a um *Message Broker* real (RabbitMQ, Apache Kafka, Amazon SQS/SNS) e bancos de dados separados (Database-per-service pattern).

## Conclusão
Esta arquitetura (Modular Monolith) que atua como fundação de Microfrontends e baseia-se em Event-Driven no back-end, apelidada pela indústria de "Monolith First" (citada por Martin Fowler), **é a arquitetura definitiva e ideal** para iniciar e projetar sistemas empresariais logísticos complexos. Ela escala com as equipes, garante resiliência a falhas de rede/serviços e prepara o terreno limpo para encaixar soluções robustas de IA. A simulação montada reflete exatamente os conceitos fundamentais para a criação de um sistema de alto padrão.

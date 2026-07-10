# Arquitetura Back-End: Monolith First & Domain-Driven Design (DDD)

A estrutura da pasta `/src/backend` implementa virtualmente os conceitos mais maduros de engenharia de software para projetos corporativos focados em escalabilidade e logística. Aqui nós separamos responsabilidades e aplicamos **Clean Architecture** guiado pelo domínio.

## Como as pastas estão organizadas?

Usamos a estrutura de **Microsserviços Virtuais** (ou Monolito Modular) separados em domínios de negócio (`services/*`). Cada domínio obedece à mesma hierarquia de camadas estrita (Hexagonal/Clean Architecture):

```text
/src/backend
 ├── bootstrap.ts                     # Ponto de entrada (Inicializa os microsserviços)
 │
 ├── infra/                           # Recursos globais da infraestrutura
 │    └── messaging/EventBus.ts       # Simula um broker (Kafka, RabbitMQ, SQS)
 │
 ├── services/                        # Nossos Microsserviços 
 │    ├── wms-core/
 │    │    ├── domain/                # As "Entities" puras (ex: InventoryItem). Zero frameworks.
 │    │    ├── application/           # Os "Use Cases" que orquestram validações e regras.
 │    │    └── infra/                 # "Adaptadores". Banco de dados, Controllers HTTP, Listeners.
 │    │
 │    ├── ayda-ai-service/
 │    │    ├── application/           # Análise Preditiva e processamento via LLM.
 │    │    └── infra/                 # Event hooks para alimentar a base vetorial.
 │    │
 │    └── finance-service/
 │         ├── application/           # Conciliações de Notas Fiscais e Contas a Pagar.
 │         └── infra/                 # Adapta o fluxo com o Event Bus recebendo as mercadorias.
```

## Por que essa separação?

### 1. Inversão de Controle (Ports and Adapters)
O módulo de estoque (`wms-core / domain`) não sabe que o React existe. Ele não sabe que os dados vêm através do Kafka. Tudo que sabe fazer é `adicionarStock(10)`. As pastas `infra` servem como "tampão" tradutor, pegando os eventos HTTP/Kafka e invocando a "Application layer" (seus fluxos de negócio).

### 2. Mensageria Desacoplada (Event-Driven System)
Quando a doca (`mfe-conferencia` no Frontend) aprova uma carga, ele envia a mensagem `CONFERENCIA_CONCLUIDA`.
O backend de Inteligência não trava o backend Financeiro. O barramento de infraestrutura (`EventBus.ts`) emite todos de uma vez e os processos correm em paralelo. Isso é coreografia baseada em eventos (Choreography).

### 3. Preparado Para Decolar (Lift and Shift)
No futuro, se a equipe de *Machine Learning* quiser colocar a IA em uma API FastAPI separada em Python, basta eles pegarem as regras da pasta `ayda-ai-service` e remover da aplicação. Não há interdependência rígida. Eles quebrarão o monolito modular com zero impacto ("Microservice-ready").

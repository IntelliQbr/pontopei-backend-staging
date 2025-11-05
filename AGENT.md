# Documentação do Projeto: Ponto PEI

Este documento fornece uma visão geral completa da arquitetura, estrutura de pastas e tecnologias utilizadas no projeto Ponto PEI. O projeto é gerenciado com pnpm, consistindo em um backend NestJS e um frontend Next.js.

## Visão Geral da Arquitetura

- **Backend**: Construído com [NestJS](https://nestjs.com/), um framework Node.js para a construção de aplicações do lado do servidor eficientes e escaláveis. Utiliza [Prisma](https://www.prisma.io/) como ORM para interagir com o banco de dados.
- **Frontend**: Construído com [Next.js](https://nextjs.org/), um framework React para a construção de interfaces de usuário e aplicações web de produção. Utiliza o App Router para roteamento e renderização.
- **Banco de Dados**: O `schema.prisma` sugere o uso de um banco de dados relacional, provavelmente PostgreSQL, gerenciado através das migrações do Prisma.
- **Comunicação**: O frontend se comunica com o backend através de uma API RESTful.

---

## Backend (NestJS)

O backend é responsável pela lógica de negócios, gerenciamento de dados e autenticação.

### Estrutura de Pastas Principais (`backend/`)

```
backend/
├── prisma/             # Schema do banco de dados, migrações e seeding
├── src/                # Código-fonte da aplicação
│   ├── app.module.ts   # Módulo raiz da aplicação
│   ├── main.ts         # Ponto de entrada da aplicação
│   ├── config/         # Arquivos de configuração (JWT, CORS, etc.)
│   ├── core/           # Módulos centrais (banco de dados, IA)
│   └── modules/        # Módulos de funcionalidades da aplicação
└── test/               # Testes end-to-end
```

### Detalhes da Estrutura

- **`prisma/`**: Contém o `schema.prisma` que define os modelos do banco de dados, relacionamentos e o provedor de dados. A pasta `migrations/` armazena o histórico de migrações do banco de dados.
- **`src/`**:
    - **`main.ts`**: Ponto de entrada da aplicação NestJS. Inicializa o servidor, aplica configurações globais como CORS e pipes de validação.
    - **`app.module.ts`**: O módulo raiz que importa todos os outros módulos de funcionalidades e configurações.
    - **`core/`**: Contém a lógica central e reutilizável.
        - `ai/`: Integração com serviços de inteligência artificial.
        - `database/`: Configuração do serviço do Prisma para acesso ao banco de dados.
    - **`modules/`**: Cada subpasta representa um módulo de funcionalidade (feature module) com sua própria lógica de negócios, seguindo a arquitetura padrão do NestJS:
        - `auth/`: Autenticação e autorização (guards, strategies, JWT).
        - `schools/`: Gerenciamento de escolas.
        - `teachers/`: Gerenciamento de professores.
        - `students/`: Gerenciamento de estudantes.
        - `classrooms/`: Gerenciamento de turmas.
        - `pei/`: Lógica relacionada ao Plano de Ensino Individualizado (PEI).
        - `weekly-plans/`: Gerenciamento dos planos semanais.
        - `payments/`: Integração com o sistema de pagamentos.
        - Cada módulo geralmente contém:
            - `*.module.ts`: Definição do módulo.
            - `*.controller.ts`: Define os endpoints da API (rotas).
            - `*.service.ts`: Contém a lógica de negócios.
            - `models/` ou `dtos/`: Data Transfer Objects para validação de entrada e saída de dados.

---

## Frontend (Next.js)

O frontend é uma Single Page Application (SPA) construída com Next.js, responsável por toda a interface do usuário e interação com o cliente.

### Estrutura de Pastas Principais (`frontend/`)

```
frontend/
├── public/             # Arquivos estáticos (imagens, fontes)
├── src/
│   ├── app/            # App Router do Next.js (páginas e layouts)
│   ├── api/            # Funções para chamadas à API do backend
│   ├── components/     # Componentes React reutilizáveis
│   ├── contexts/       # Contextos React (ex: AuthContext)
│   ├── lib/            # Configurações de bibliotecas (axios) e utils
│   ├── models/         # Interfaces e tipos TypeScript
│   └── middleware.ts   # Middleware de requisições do Next.js
└── next.config.ts      # Configurações do Next.js
```

### Detalhes da Estrutura

- **`src/app/`**: Utiliza o App Router do Next.js. A estrutura de pastas define as rotas da aplicação.
    - `layout.tsx`: O layout raiz que envolve toda a aplicação.
    - `page.tsx`: A página inicial.
    - `auth/`: Grupo de rotas para autenticação.
    - `dashboard/`: A principal área da aplicação após o login.
        - `director/`, `teacher/`: Layouts e páginas específicas para cada perfil de usuário (diretor, professor), demonstrando um sistema baseado em papéis (role-based).
    - `onboarding/`: Fluxo de cadastro inicial e configuração da conta.
- **`src/api/`**: Centraliza a comunicação com o backend. Cada arquivo (`auth.api.ts`, `schools.api.ts`) agrupa as chamadas de API relacionadas a uma funcionalidade específica, utilizando uma instância do Axios configurada em `src/lib/axios.ts`.
- **`src/components/`**:
    - `ui/`: Componentes de UI de baixo nível, provavelmente de uma biblioteca como [shadcn/ui](https://ui.shadcn.com/), que são blocos de construção para componentes mais complexos.
    - O resto das pastas espelha a estrutura de funcionalidades da aplicação, contendo componentes específicos para cada área (`dashboard/`, `director/`, `students/`).
- **`src/contexts/`**: Fornece estado global para a aplicação, como o `AuthContext.tsx` que gerencia o estado de autenticação do usuário.
- **`src/models/`**: Define as formas dos dados (data shapes) usados na aplicação através de interfaces e enums TypeScript, garantindo consistência com os dados do backend.
- **`src/middleware.ts`**: Executa código antes de uma requisição ser completada. É usado aqui para proteger rotas, redirecionando usuários não autenticados.
- **`src/lib/utils.ts`**: Funções utilitárias genéricas, como a função `cn` do `tailwind-merge` para mesclar classes do Tailwind CSS de forma condicional.

---

## Tecnologias e Convenções

- **Linguagem**: TypeScript em todo o projeto (backend e frontend).
- **Gerenciador de Pacotes**: PNPM para gerenciar o monorepo e as dependências.
- **Estilo de Código**: ESLint é configurado para garantir a consistência e a qualidade do código.
- **Backend**:
    - Framework: NestJS
    - ORM: Prisma
    - Autenticação: JWT (JSON Web Tokens)
- **Frontend**:
    - Framework: Next.js (com App Router)
    - UI: React, Tailwind CSS, shadcn/ui
    - Requisições HTTP: Axios
    - Gerenciamento de Estado: React Context (e possivelmente hooks para estado local)

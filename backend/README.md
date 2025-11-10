# JapaStore Backend

Backend desenvolvido com NestJS para o sistema de gestão da JapaStore, uma solução completa para controle de estoque, vendas, ordens de serviço e gestão de clientes.

## 📋 Descrição

- **Controle de Estoque**: Gestão de produtos, categorias e movimentações de estoque
- **Gestão de Clientes**: Cadastro, histórico de vendas e visitas
- **Ordens de Serviço**: Controle completo de serviços com custos e status
- **Vendas**: Registro de vendas com múltiplos métodos de pagamento
- **Sessões Diárias**: Controle de sessões de trabalho com métricas de vendas
- **Analytics**: Dashboard com métricas e análises de negócio
- **Relatórios**: Geração de relatórios de vendas, estoque, clientes e ordens de serviço
- **Sistema de Contatos**: Gestão de interações e contatos com clientes
- **Autenticação**: Sistema seguro de autenticação com JWT

## 🚀 Tecnologias

- **Framework**: NestJS 11
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Zod
- **Segurança**: bcrypt, Throttler (rate limiting)
- **Testes**: Jest

## 📦 Pré-requisitos

- Node.js 24.11.0 ou superior
- pnpm (gerenciador de pacotes)
- PostgreSQL 17.4 ou superior
- Docker e Docker Compose (opcional, para desenvolvimento)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd backend
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stock_control"
JWT_SECRET="your-secret-key"
```

4. Inicie o banco de dados (usando Docker):
```bash
docker-compose up -d
```

5. Execute as migrations do Prisma:
```bash
pnpm prisma migrate dev
```

6. (Opcional) Popule o banco com dados de exemplo:
```bash
pnpm prisma db seed
```

## 🏃 Executando a aplicação

### Desenvolvimento
```bash
pnpm run start:dev
```

### Produção
```bash
pnpm run build
pnpm run start:prod
```

### Modo Watch
```bash
pnpm run start:watch
```

### Debug
```bash
pnpm run start:debug
```

## 🧪 Testes

### Testes unitários
```bash
pnpm run test
```

### Testes em modo watch
```bash
pnpm run test:watch
```

### Testes e2e
```bash
pnpm run test:e2e
```

### Cobertura de testes
```bash
pnpm run test:cov
```

## 📁 Estrutura do Projeto

```
src/
├── analytics/         # Módulo de analytics e dashboard
├── auth/              # Autenticação e autorização
├── categories/        # Gestão de categorias
├── contacts/          # Sistema de contatos
├── customers/         # Gestão de clientes
├── daily-sessions/    # Sessões diárias de trabalho
├── decorators/        # Decorators customizados
├── guards/            # Guards de autenticação
├── interceptors/      # Interceptors
├── pipes/             # Pipes de validação
├── products/          # Gestão de produtos
├── reports/           # Geração de relatórios
├── repositories/      # Repositórios de dados
├── service-orders/    # Ordens de serviço
├── stock-movements/   # Movimentações de estoque
├── users/             # Gestão de usuários
└── utils/             # Utilitários
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em JWT. Para acessar rotas protegidas, é necessário:

1. Fazer login através do endpoint `/auth/login`
2. Receber o token JWT
3. Incluir o token no header `Authorization: Bearer <token>`

## 📊 Funcionalidades Principais

### Produtos e Estoque
- CRUD completo de produtos
- Gestão de categorias
- Controle de quantidade em estoque
- Movimentações de entrada e saída
- Histórico de movimentações

### Clientes
- Cadastro completo de clientes
- Histórico de compras
- Registro de visitas
- Métricas de fidelidade
- Preferências de pagamento

### Ordens de Serviço
- Criação e gestão de ordens
- Controle de status (pendente, em progresso, concluída, cancelada)
- Prioridades (baixa, média, alta, urgente)
- Gestão de custos (produtos e serviços externos)
- Estimativa de custos

### Vendas
- Registro de vendas
- Múltiplos métodos de pagamento
- Aplicação de descontos
- Integração com estoque

### Analytics
- Dashboard com métricas principais
- Gráficos e visualizações
- Análise de vendas
- Performance de produtos

### Relatórios
- Relatórios de vendas
- Relatórios de estoque
- Relatórios de clientes
- Relatórios de ordens de serviço
- Filtros avançados

## 🔧 Scripts Disponíveis

- `pnpm run build` - Compila o projeto
- `pnpm run format` - Formata o código com Prettier
- `pnpm run lint` - Executa o linter
- `pnpm run start` - Inicia a aplicação
- `pnpm run start:dev` - Inicia em modo desenvolvimento
- `pnpm run start:prod` - Inicia em modo produção
- `pnpm run test` - Executa testes unitários
- `pnpm run test:e2e` - Executa testes e2e
- `pnpm run test:cov` - Gera relatório de cobertura

## 🗄️ Banco de Dados

O projeto utiliza Prisma como ORM. Para trabalhar com o banco de dados:

### Gerar cliente Prisma
```bash
pnpm prisma generate
```

### Criar nova migration
```bash
pnpm prisma migrate dev --name nome_da_migration
```

### Visualizar banco de dados (Prisma Studio)
```bash
pnpm prisma studio
```

## 🐳 Docker

O projeto inclui um arquivo `compose.yml` para facilitar o desenvolvimento:

```bash
# Iniciar banco de dados
docker-compose up -d

# Parar banco de dados
docker-compose down
```

## 📝 Variáveis de Ambiente

Principais variáveis de ambiente necessárias:

- `DATABASE_URL` - URL de conexão com PostgreSQL
- `JWT_SECRET` - Chave secreta para assinatura de tokens JWT
- `NODE_ENV` - Ambiente de execução (development, production, test)

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Rate limiting com Throttler
- Validação de dados com Zod
- Guards de autenticação

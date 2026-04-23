# LinkCash - Encurtador de Links Monetizado

Um sistema completo de encurtamento de links com monetização por anúncios, sistema de indicação e painel administrativo elegante e refinado.

## 🚀 Características Principais

### 1. **Autenticação e Segurança**
- Cadastro e login com email e senha
- Senhas criptografadas com PBKDF2
- Controle de acesso por perfis (admin/usuário)
- Sessão segura com JWT

### 2. **Dashboard do Usuário**
- Visualização de total de links criados
- Estatísticas de cliques válidos
- Saldo atual em tempo real
- Listagem completa de links com detalhes
- Cópia rápida de links para clipboard
- Exclusão de links

### 3. **Sistema de Encurtamento**
- Geração de códigos únicos para cada link
- Validação de URLs
- Armazenamento seguro no banco de dados
- Associação automática ao usuário autenticado

### 4. **Página Intermediária de Anúncios**
- Delay configurável de 5 a 10 segundos
- Botão "Continuar" após o tempo de espera
- Redirecionamento automático para URL original
- Contador visual do tempo restante
- Design elegante com espaço para anúncios

### 5. **Sistema de Ganhos**
- CPM (Cost Per Mille) configurável
- Cálculo automático de ganho por clique válido
- Atualização automática do saldo do usuário
- Registro detalhado de cliques

### 6. **Anti-Fraude Avançado**
- Limite de cliques por IP por hora
- Detecção de bots por User-Agent
- Registro de tentativas de fraude
- Bloqueio de múltiplos cliques seguidos
- Validação de referrer

### 7. **Sistema de Indicação**
- Geração de código de referência único por usuário
- Link de indicação compartilhável
- Comissão configurável (padrão 30%)
- Cálculo automático de comissão sobre ganhos dos indicados
- Atualização automática do saldo do indicador
- Histórico de indicações

### 8. **Sistema de Saque**
- Solicitação de saque pelo usuário
- Três estados: pendente, pago, rejeitado
- Validação de saldo mínimo
- Aprovação manual pelo administrador
- Histórico completo de saques

### 9. **Painel Administrativo**
- Visualização de todos os usuários
- Listagem de links com estatísticas
- Histórico completo de cliques
- Gerenciamento de saques (aprovar/rejeitar)
- Alteração dinâmica de CPM
- Alteração de percentual de comissão de indicação
- Estatísticas gerais do sistema

### 10. **API Pública**
- Autenticação por API key
- Endpoint para criar links via API
- Endpoint para consultar estatísticas
- Documentação completa

## 📋 Requisitos do Sistema

- Node.js 22.13.0+
- MySQL/TiDB para banco de dados
- npm ou pnpm para gerenciamento de pacotes

## 🛠️ Instalação

1. **Clone ou acesse o projeto:**
```bash
cd link-shortener-monetized
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente:**
```bash
# O arquivo .env é gerenciado automaticamente pelo Manus
# Certifique-se de que DATABASE_URL está configurado
```

4. **Execute as migrações do banco de dados:**
```bash
pnpm drizzle-kit migrate
```

5. **Inicie o servidor de desenvolvimento:**
```bash
pnpm dev
```

## 📁 Estrutura do Projeto

```
link-shortener-monetized/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Utilitários
│   │   └── App.tsx           # Roteamento principal
│   └── index.html
├── server/                    # Backend Express
│   ├── routers.ts            # Rotas tRPC
│   ├── db.ts                 # Funções de banco de dados
│   ├── utils.ts              # Utilitários
│   └── redirectHandler.ts    # Handler de redirecionamento
├── drizzle/                   # Migrações e schema
│   ├── schema.ts             # Definição das tabelas
│   └── migrations/           # Arquivos de migração
├── shared/                    # Código compartilhado
└── package.json
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema com saldo e estatísticas
- **short_links**: Links encurtados com estatísticas
- **clicks**: Registro de cada clique com validação
- **withdrawals**: Solicitações de saque
- **settings**: Configurações globais (CPM, comissão)
- **referrals**: Relacionamento entre indicador e indicado
- **fraud_attempts**: Log de tentativas de fraude

## 🔐 Segurança

- Proteção contra SQL Injection (ORM Drizzle)
- Validação de inputs no frontend e backend
- Controle de acesso baseado em roles
- Criptografia de senhas com PBKDF2
- Rate limiting por IP
- Sanitização de URLs

## 💰 Configurações de Monetização

### CPM (Cost Per Mille)
- Padrão: R$ 0.50 por 1000 cliques
- Configurável pelo administrador
- Cálculo automático por clique

### Comissão de Indicação
- Padrão: 30% dos ganhos do indicado
- Configurável pelo administrador
- Atualização automática do saldo

### Saque Mínimo
- Padrão: R$ 10.00
- Configurável pelo administrador
- Validação automática

## 🎨 Design e UX

- **Paleta de Cores**: Elegante e sofisticada
  - Primária: Azul profundo
  - Secundária: Roxo
  - Acentuada: Laranja
- **Tipografia**: Inter (corpo) + Playfair Display (títulos)
- **Responsividade**: Mobile-first design
- **Acessibilidade**: WCAG 2.1 AA
- **Animações**: Suaves e refinadas

## 📊 Estatísticas Rastreadas

### Por Usuário
- Total de links criados
- Total de cliques válidos
- Ganhos totais
- Saldo atual
- Comissões de indicação
- Histórico de saques

### Por Link
- Número de cliques totais
- Número de cliques válidos
- Ganhos gerados
- Data de criação

### Por Clique
- IP do usuário
- User-Agent
- Referrer
- Validade (se passou nas verificações anti-fraude)
- Ganho gerado

## 🔧 API Pública

### Autenticação
Todos os endpoints da API requerem uma API key válida.

```bash
# Header necessário
Authorization: Bearer YOUR_API_KEY
```

### Criar Link
```bash
POST /api/trpc/api.generateLink
Content-Type: application/json

{
  "apiKey": "your-api-key",
  "originalUrl": "https://exemplo.com/pagina-muito-longa",
  "title": "Meu Link Especial"
}

# Resposta
{
  "shortCode": "abc123",
  "shortUrl": "/r/abc123",
  "originalUrl": "https://exemplo.com/pagina-muito-longa"
}
```

### Obter Estatísticas
```bash
POST /api/trpc/api.getStats
Content-Type: application/json

{
  "apiKey": "your-api-key",
  "shortCode": "abc123"
}

# Resposta
{
  "shortCode": "abc123",
  "originalUrl": "https://exemplo.com/pagina-muito-longa",
  "clicks": 150,
  "validClicks": 145,
  "earnings": "0.07",
  "createdAt": "2026-04-23T03:32:43.716Z"
}
```

## 📝 Fluxos Principais

### Cadastro de Usuário
1. Usuário acessa `/auth`
2. Preenche email, senha, nome
3. Opcionalmente insere código de indicação
4. Sistema cria usuário e gera código de referência
5. Usuário é redirecionado para login

### Criação de Link
1. Usuário acessa `/dashboard`
2. Clica em "Criar Novo Link"
3. Insere URL original e título (opcional)
4. Sistema gera código único
5. Link aparece na listagem

### Clique em Link
1. Usuário acessa `/r/abc123`
2. Página intermediária é exibida
3. Sistema registra clique e valida contra fraude
4. Se válido: saldo é atualizado, comissão é calculada
5. Após 8 segundos: botão "Continuar" é liberado
6. Usuário é redirecionado para URL original

### Saque
1. Usuário acessa `/withdrawals`
2. Clica em "Solicitar Saque"
3. Insere valor (mínimo R$ 10.00)
4. Solicitação é criada com status "pendente"
5. Admin aprova ou rejeita
6. Se aprovado: status muda para "pago"
7. Se rejeitado: saldo é devolvido ao usuário

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes com cobertura
pnpm test -- --coverage
```

## 📚 Documentação Adicional

- **Design System**: Veja `client/src/index.css` para paleta de cores e estilos
- **Schema do Banco**: Veja `drizzle/schema.ts` para estrutura completa
- **Rotas tRPC**: Veja `server/routers.ts` para todos os endpoints

## 🤝 Contribuindo

Este é um projeto de demonstração. Para contribuições ou melhorias, siga as práticas de código estabelecidas.

## 📄 Licença

MIT

## 🆘 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o time de desenvolvimento.

---

**LinkCash** - Transformando cliques em renda 💰

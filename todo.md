# LinkCash - TODO List

## Autenticação e Usuários
- [x] Sistema de cadastro com email e senha
- [x] Criptografia de senhas com bcrypt
- [x] Sistema de login com email/senha
- [x] Sessão segura com JWT
- [x] Controle de acesso por perfis (admin/usuário)
- [x] Página de login elegante
- [x] Página de cadastro elegante
- [x] Validação de email e senha no frontend e backend

## Dashboard do Usuário
- [x] Exibir total de links criados
- [x] Exibir total de cliques
- [x] Exibir saldo atual
- [x] Listar links criados com estatísticas individuais
- [x] Visualizar detalhes de cada link (cliques, ganhos, data de criação)
- [x] Deletar links
- [x] Copiar link encurtado para clipboard
- [x] Design elegante do dashboard

## Sistema de Encurtamento
- [x] Gerar código único para cada link (ex: /abc123)
- [x] Validar URL original
- [x] Armazenar URL original e código no banco
- [x] Relacionar cada link ao usuário autenticado
- [x] Criar endpoint para gerar novo link
- [ ] Validação de URLs duplicadas (opcional)

## Página Intermediária de Anúncios
- [x] Criar página intermediária com anúncios
- [x] Implementar delay de 5 a 10 segundos
- [x] Botão "Continuar" para pular anúncio (após delay)
- [x] Redirecionamento automático para URL original após delay
- [x] Contador visual do tempo restante
- [x] Design elegante com espaço para anúncios

## Sistema de Ganhos
- [x] Implementar CPM configurável
- [x] Calcular ganho por clique automaticamente
- [x] Atualizar saldo do usuário após clique válido
- [x] Registrar cliques no banco de dados
- [x] Não contar cliques inválidos (anti-fraude)
- [x] Endpoint para registrar clique

## Anti-Fraude
- [x] Limitar cliques por IP (máx 1 clique por IP por link por hora)
- [x] Bloquear múltiplos cliques seguidos do mesmo IP
- [x] Detectar bots simples (User-Agent validation)
- [x] Registrar tentativas de fraude
- [ ] Validar referrer (opcional)
- [x] Implementar rate limiting por IP

## Sistema de Indicação
- [x] Gerar link de convite por usuário
- [x] Associar novos usuários ao convidador (referrer_id)
- [x] Pagar comissão configurável (30% como padrão)
- [x] Calcular comissão sobre ganhos dos indicados
- [x] Atualizar saldo do indicador automaticamente
- [ ] Exibir histórico de indicações no dashboard (opcional)
- [ ] Exibir ganhos por indicação (opcional)

## Sistema de Saque
- [x] Usuário pode solicitar saque
- [x] Status: pendente, pago, rejeitado
- [x] Não pagar automaticamente (aprovação manual)
- [x] Validar saldo mínimo para saque
- [ ] Exibir histórico de saques (implementado em /withdrawals)
- [ ] Notificar usuário sobre aprovação/rejeição (opcional)

## Painel Administrativo
- [x] Visualizar lista de usuários com filtros
- [x] Visualizar detalhes do usuário
- [x] Visualizar lista de links com filtros
- [x] Visualizar lista de cliques
- [x] Gerenciar saques (aprovar/rejeitar)
- [x] Alterar CPM global
- [x] Alterar percentual de comissão de indicação
- [x] Visualizar estatísticas gerais (total de usuários, links, cliques, ganhos)
- [ ] Exportar relatórios (opcional)
- [x] Design elegante do painel admin

## API Pública
- [x] Criar endpoint para gerar links via API com API key
- [x] Retornar link encurtado
- [x] Endpoint para consultar estatísticas de um link
- [x] Autenticação por API key
- [ ] Rate limiting para API (opcional)
- [x] Documentação da API

## Segurança
- [x] Proteção contra SQL Injection (usar ORM)
- [x] Validação de inputs no frontend e backend
- [x] Controle de acesso (admin/user)
- [ ] HTTPS obrigatório (gerenciado pelo Manus)
- [ ] CORS configurado (gerenciado pelo Manus)
- [ ] Proteção contra CSRF (opcional)
- [x] Sanitização de URLs

## Design e UI
- [x] Paleta de cores elegante e sofisticada
- [x] Tipografia refinada
- [x] Espaçamentos consistentes
- [x] Componentes visuais polidos
- [x] Responsividade mobile
- [x] Animações suaves
- [x] Feedback visual para ações do usuário
- [ ] Dark mode (opcional)

## Banco de Dados
- [x] Tabela users (id, openId, email, name, role, password_hash, balance, referrer_id, api_key, createdAt, updatedAt)
- [x] Tabela short_links (id, user_id, original_url, short_code, clicks, earnings, created_at, updated_at)
- [x] Tabela clicks (id, link_id, ip_address, user_agent, referrer, timestamp, is_valid)
- [x] Tabela withdrawals (id, user_id, amount, status, requested_at, processed_at, notes)
- [x] Tabela settings (id, cpm, referral_commission_percentage, updated_at)
- [x] Tabela referrals (id, referrer_id, referred_user_id, commission_earned, created_at)

## Testes
- [x] Testes unitários para funções de cálculo de ganhos
- [x] Testes para anti-fraude
- [x] Testes para autenticação
- [x] Testes para criação de links
- [x] Testes para API pública

## Documentação
- [x] README com instruções de instalação
- [x] Documentação da API
- [x] Guia do usuário
- [x] Guia do administrador

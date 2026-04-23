# Guia do Administrador - LinkCash

Este guia fornece instruções detalhadas para administradores gerenciarem a plataforma LinkCash.

## 📋 Índice

1. [Acessando o Painel Admin](#acessando-o-painel-admin)
2. [Dashboard](#dashboard)
3. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
4. [Gerenciamento de Links](#gerenciamento-de-links)
5. [Análise de Cliques](#análise-de-cliques)
6. [Processamento de Saques](#processamento-de-saques)
7. [Configurações do Sistema](#configurações-do-sistema)
8. [Monitoramento de Fraude](#monitoramento-de-fraude)

## 🔐 Acessando o Painel Admin

### Requisitos

- Sua conta deve ter role **"admin"**
- Contate o proprietário do sistema se precisar de acesso admin

### Acesso

1. Faça login com sua conta admin
2. No dashboard, clique em **"Admin"** no menu superior
3. Você será redirecionado para o painel administrativo

## 📊 Dashboard

O dashboard admin exibe estatísticas gerais do sistema:

### Métricas Principais

- **Total de Usuários**: Número de usuários cadastrados
- **Total de Links**: Número de links encurtados criados
- **Total de Cliques**: Número total de cliques válidos
- **Ganhos Totais**: Valor total gerado pela plataforma

### Configurações do Sistema

Exibe as configurações atuais:

- **CPM**: Valor atual por 1000 cliques
- **Comissão de Indicação**: Percentual pago aos indicadores
- **Saque Mínimo**: Valor mínimo para solicitação de saque

## 👥 Gerenciamento de Usuários

### Visualizando Usuários

1. Clique na aba **"Usuários"**
2. Você verá uma tabela com todos os usuários:
   - **Nome**: Nome do usuário
   - **Email**: Email cadastrado
   - **Saldo**: Saldo atual disponível
   - **Ganhos Totais**: Total ganho desde o cadastro
   - **Cadastro**: Data de cadastro

### Informações do Usuário

Para cada usuário, você pode ver:

- Email e nome
- Saldo atual
- Ganhos totais
- Data de cadastro
- Última atividade

### Ações Disponíveis

- **Visualizar**: Clique no usuário para ver detalhes
- **Filtrar**: Use filtros para buscar usuários específicos

## 🔗 Gerenciamento de Links

### Visualizando Links

1. Clique na aba **"Links"**
2. Você verá uma tabela com todos os links:
   - **Código**: Código único do link encurtado
   - **URL Original**: URL que o link encurta
   - **Cliques**: Número de cliques válidos
   - **Ganhos**: Quanto o link gerou
   - **Criado em**: Data de criação

### Informações do Link

Para cada link, você pode ver:

- URL original completa
- Código encurtado
- Número de cliques totais
- Número de cliques válidos
- Ganhos gerados
- Usuário proprietário
- Data de criação

### Ações Disponíveis

- **Desativar**: Desativar um link (impede novos cliques)
- **Deletar**: Remover um link (irreversível)
- **Filtrar**: Buscar links por código ou URL

## 📈 Análise de Cliques

### Visualizando Cliques

1. Clique na aba **"Cliques"**
2. Você verá uma tabela com todos os cliques:
   - **Link**: ID do link clicado
   - **IP**: Endereço IP do clique
   - **Válido**: Se o clique foi validado
   - **Ganho**: Quanto o clique gerou
   - **Data**: Quando o clique ocorreu

### Informações do Clique

Para cada clique, você pode ver:

- Link que foi clicado
- IP do usuário
- User-Agent (navegador/dispositivo)
- Referrer (de onde veio o clique)
- Se foi validado ou marcado como fraude
- Ganho gerado
- Timestamp exato

### Filtros

- **Por Link**: Ver cliques de um link específico
- **Por IP**: Ver cliques de um IP específico
- **Por Status**: Ver apenas cliques válidos ou inválidos
- **Por Data**: Ver cliques em um período específico

## 💸 Processamento de Saques

### Visualizando Saques

1. Clique na aba **"Saques"**
2. Você verá uma tabela com todas as solicitações:
   - **Usuário**: Quem solicitou o saque
   - **Valor**: Quanto está sendo solicitado
   - **Status**: Pendente, Pago ou Rejeitado
   - **Solicitado em**: Quando foi solicitado

### Estados do Saque

- **Pendente**: Aguardando sua aprovação
- **Pago**: Já foi processado
- **Rejeitado**: Foi rejeitado (com motivo)

### Processando um Saque

1. Localize o saque com status **"Pendente"**
2. Clique em **"Processar"**
3. Uma janela abrirá com:
   - Dados do usuário
   - Valor do saque
   - Campo de notas

4. Escolha uma ação:
   - **Aprovar**: Clique em "Aprovar" para liberar o saque
   - **Rejeitar**: Clique em "Rejeitar" e adicione um motivo

5. Clique em confirmar

### Boas Práticas

- Verifique o saldo do usuário antes de aprovar
- Adicione notas explicativas quando rejeitar
- Processe saques regularmente para manter usuários satisfeitos
- Mantenha registros de todas as transações

## ⚙️ Configurações do Sistema

### Alterando Configurações

1. No dashboard admin, clique em **"Editar"** (botão de engrenagem)
2. Uma janela abrirá com os campos:

#### CPM (Cost Per Mille)

- **Descrição**: Valor em reais por 1000 cliques
- **Padrão**: R$ 0.50
- **Impacto**: Quanto maior, mais os usuários ganham por clique
- **Exemplo**: CPM R$ 1.00 = R$ 0.001 por clique

#### Comissão de Indicação

- **Descrição**: Percentual dos ganhos pagos ao indicador
- **Padrão**: 30%
- **Impacto**: Quanto maior, mais incentivo para indicações
- **Exemplo**: 30% = Indicador recebe 30% dos ganhos do indicado

#### Saque Mínimo

- **Descrição**: Valor mínimo para solicitar saque
- **Padrão**: R$ 10.00
- **Impacto**: Quanto menor, mais saques são solicitados
- **Exemplo**: R$ 10.00 = Usuário precisa de R$ 10.00 para sacar

### Salvando Alterações

1. Preencha os novos valores
2. Clique em **"Salvar"**
3. As configurações serão atualizadas imediatamente
4. Todos os novos cliques usarão os novos valores

## 🚨 Monitoramento de Fraude

### Tentativas de Fraude Detectadas

O sistema detecta automaticamente:

- **Múltiplos cliques do mesmo IP**: Limite configurável (padrão 5/hora)
- **Bots**: Detectados por User-Agent suspeito
- **Cliques suspeitos**: Padrões anormais de comportamento

### Ações Automáticas

- Cliques fraudulentos não geram ganhos
- Tentativas são registradas no log de fraude
- IPs suspeitos podem ser bloqueados

### Monitoramento Manual

1. Verifique a aba **"Cliques"**
2. Procure por cliques marcados como **"Inválido"**
3. Analise o padrão:
   - Mesmo IP múltiplas vezes?
   - User-Agent suspeito?
   - Referrer estranho?

4. Se necessário, bloqueie o IP ou o usuário

## 📋 Relatórios

### Dados Disponíveis

- Número de usuários por período
- Cliques por link
- Ganhos por usuário
- Saques processados
- Tentativas de fraude

### Exportando Dados

1. Na aba desejada, procure por **"Exportar"**
2. Escolha o formato (CSV, Excel, PDF)
3. Selecione o período
4. Clique em **"Exportar"**

## 🔍 Troubleshooting

### Problema: Usuário não consegue sacar

**Solução**:
- Verifique se o saldo é maior que o mínimo
- Verifique se há saques pendentes
- Verifique se a conta está ativa

### Problema: Cliques não aparecem

**Solução**:
- Aguarde alguns segundos para sincronização
- Verifique se o link está ativo
- Verifique se há fraude detectada

### Problema: Ganhos não aparecem

**Solução**:
- Verifique se os cliques foram validados
- Verifique as configurações de CPM
- Verifique se há erros de cálculo

## 📞 Suporte

Para problemas técnicos ou dúvidas:

1. Consulte este guia
2. Verifique os logs do sistema
3. Entre em contato com o desenvolvedor

---

**Gerencie a plataforma com confiança!** 🚀

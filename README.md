# 🎮 GameDraft

**Monte seu time. Roube suas escolhas. Vença seus amigos.**

GameDraft é uma plataforma web multiplayer em tempo real onde um grupo de amigos pode criar uma sala e realizar um **draft/seleção** de personagens, jogadores, times, itens ou qualquer outra categoria.

## ✨ Funcionalidades

- 🏠 **Criar salas** com código compartilhável de 6 caracteres
- 👥 **Multiplayer em tempo real** com sincronização via Supabase
- 🔄 **Draft clássico e Snake Draft** com lógica de turnos automática
- ⏱️ **Timer configurável** sincronizado entre jogadores
- 📊 **Sistema de pontuação** com comparação de times
- 💬 **Chat em tempo real** durante a partida
- 🎭 **5 categorias**: Futebol, NBA, Games, Personagens, Personalizado
- 🤖 **Modo Demo** com bots para testar sem amigos
- 📱 **Totalmente responsivo** — funciona em celular, tablet e desktop
- 🔒 **Proteção contra duplicidade** com validação atômica no banco
- 🔄 **Reconexão automática** ao atualizar a página

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | Interface do usuário |
| TypeScript | Tipagem estática |
| Vite 6 | Build tool |
| Tailwind CSS v4 | Estilização |
| React Router v6 | Roteamento SPA |
| Supabase | Backend (DB + Realtime) |

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Setup

```bash
# Clonar o repositório
git clone <repo-url>
cd gamedraft

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Executar em modo desenvolvimento
npm run dev
```

## ⚙️ Configuração

### Modo Demo (sem Supabase)

Se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` **não estiverem definidas**, a aplicação roda em **Modo Demo**:

- Estado mantido em memória
- Sincronização entre abas via BroadcastChannel
- Bots automáticos para testes
- Dados não são persistidos entre recarregamentos

### Modo Produção (com Supabase)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute:
   - `supabase/schema.sql` — cria tabelas, índices e funções
   - `supabase/rls-policies.sql` — configura políticas de segurança
4. Vá em **Settings > API** e copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
5. Cole no arquivo `.env`

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Habilitando Realtime

No dashboard do Supabase:
1. Vá em **Database > Replication**
2. Ative as tabelas: `rooms`, `players`, `picks`, `chat_messages`, `draft_options`

## 🗄️ Banco de Dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `rooms` | Salas de draft com status, configurações e turno atual |
| `players` | Jogadores com avatar, ordem e status de conexão |
| `draft_options` | Opções selecionáveis (jogadores, personagens, etc.) |
| `picks` | Escolhas registradas com turno e timestamp |
| `chat_messages` | Mensagens do chat da sala |

### Função `make_pick()`

Função PL/pgSQL que executa a validação e inserção de picks atomicamente:
- Lock da sala (`FOR UPDATE`) para evitar race conditions
- Valida vez do jogador (clássico e snake)
- Valida opção não duplicada
- Atualiza turno e status

### Limpeza Automática

Função `cleanup_expired_rooms()` remove salas com mais de 24h de inatividade.

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── ui/          # Design system (Button, Input, Card, Modal, Toast...)
│   ├── layout/      # Header, Footer, Layout
│   ├── room/        # LobbyView, ChatPanel, SettingsModal
│   ├── draft/       # DraftView, DraftCard, TurnIndicator, TeamPanel
│   └── results/     # ResultsView, ComparisonTable, ShareButton
├── pages/           # Rotas: Home, Create, Join, Room, HowToPlay...
├── hooks/           # useTimer, useChat, useSound
├── context/         # GameContext, ToastContext, SettingsContext
├── services/
│   ├── types.ts     # Interface GameService
│   ├── local-provider.ts    # Modo Demo (in-memory)
│   └── supabase-provider.ts # Modo Produção (Supabase)
├── data/            # Dados pré-cadastrados (40 opções por categoria)
├── types/           # TypeScript types
├── utils/           # Funções utilitárias
└── styles/          # CSS global + tema
```

### Camada de Abstração

O projeto usa uma interface `GameService` implementada por dois providers:
- **LocalProvider**: estado em memória + BroadcastChannel (demo)
- **SupabaseProvider**: banco de dados real + Realtime WebSocket

O provider correto é selecionado automaticamente baseado nas variáveis de ambiente.

## 🚀 Deploy

### Vercel (recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório ao [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático

### Cloudflare Pages

1. Conecte o repositório ao Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `dist`
4. Configure as variáveis de ambiente

## 📋 Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Preview do build
npm run typecheck # Verificação de tipos
```

## 🎮 Fluxo de Jogo

1. **Criar sala** → Host escolhe nome, categoria, modo, timer e picks
2. **Compartilhar código** → Amigos entram com o código de 6 caracteres
3. **Lobby** → Todos veem quem está na sala, chat disponível
4. **Draft** → Turnos alternados (clássico ou snake), timer opcional
5. **Resultado** → Pontuação, comparação de times, compartilhamento

## 🔒 Segurança

- Chaves secretas nunca são expostas no frontend
- Validação de regras no backend (Supabase functions + RLS)
- Proteção contra picks simultâneos via lock de linha
- Session ID persistido em localStorage (não sensível)
- RLS habilitado em todas as tabelas

## ⚠️ Limitações Conhecidas

1. **Autenticação**: Usa identidade por sessão (sem login). Adequado para MVP.
2. **Imagens**: Usa emojis/ícones em vez de fotos reais dos jogadores.
3. **Expiração de salas**: Depende de chamada periódica à função `cleanup_expired_rooms()`.
4. **Modo Demo**: Sincroniza apenas entre abas do mesmo navegador.

## 📝 Licença

Este projeto é de código aberto para fins educacionais e de diversão.

---

Feito com ❤️ e TypeScript.

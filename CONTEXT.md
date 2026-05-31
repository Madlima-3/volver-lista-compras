# Volver — Lista de Compras Familiar
> Arquivo de contexto para o Claude Code. Leia este arquivo antes de qualquer tarefa.

---

## O que é o Volver

Aplicativo para facilitar a rotina de compras de famílias. O usuário escolhe receitas da semana ou do mês, e o app gera automaticamente uma lista de compras. Na hora de ir ao supermercado, a lista vira um checklist interativo.

---

## Sobre o desenvolvedor

- Iniciante em programação com conhecimento empírico de lógica
- Tem experiência prática com Power Apps (lógica de fluxo, mas sem código)
- Aprendendo enquanto desenvolve — quer entender o "porquê" de cada decisão
- Prefere explicações diretas, sem jargão desnecessário
- Usa o Claude Code como ferramenta principal de desenvolvimento
- Sistema operacional: **Windows**

### Como o Claude Code deve se comportar

- Sempre explicar o raciocínio por trás de cada decisão técnica
- Sugerir sempre a solução mais simples que resolve o problema
- Alertar sobre complexidades antes de entrar nelas
- Confirmar o entendimento antes de avançar para a próxima etapa
- Quando houver mais de uma opção, apresentar as alternativas com prós e contras

---

## Stack técnica definida

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend / Web | React + Vite | Simples, rápido, sem configuração complexa |
| Linguagem | JavaScript (JSX) | Mais acessível para iniciantes |
| Navegação | React Router | Padrão da comunidade React |
| Banco de dados | localStorage (JSON) | Funciona offline, sem instalação, ideal para protótipo |
| API de receitas | TheMealDB (gratuita) | Sem limite de requisições, boa para desenvolvimento |
| Build / Deploy | Vercel ou GitHub Pages | Deploy gratuito e simples |

> **Nota:** A stack foi migrada de React Native + Expo para React + Vite após dificuldades de compatibilidade com Expo Go. O React aprendido aqui se transfere diretamente para React Native no futuro, caso o projeto evolua para mobile.

---

## Funcionalidades do app (por prioridade)

### Fase 2 — Núcleo (implementar primeiro)
1. Navegação entre as 4 páginas principais ✅ (estrutura criada)
2. Tema visual aplicado globalmente ✅
3. Banco de dados localStorage configurado ✅
4. Página Início funcional
5. Página Lista de Compras com checklist interativo
6. Página Modo Supermercado (versão ampliada da lista)

### Fase 3 — Funcionalidades avançadas
7. Página Receitas com busca na API TheMealDB
8. Geração automática da lista a partir de receitas escolhidas
9. Agrupamento de ingredientes duplicados entre receitas
10. Listas recorrentes (salvar e reutilizar listas)

### Fase 4 — Polimento
11. Testes manuais de todos os fluxos
12. README profissional no GitHub
13. Deploy no Vercel (opcional)

---

## Estrutura de telas

```
App
├── Layout (barra de navegação inferior)
│   ├── Início         — menu principal com acesso rápido
│   ├── Receitas       — busca e seleção de receitas
│   ├── Lista          — lista de compras gerada + manual
│   └── Perfil         — configurações e preferências
│
└── Rotas extras
    └── /lista/:id/mercado  — checklist ampliado para uso no supermercado
```

---

## Design system

### Paleta de cores (tema claro pastel)

```js
export const colors = {
  background:     '#faf7f4',
  surface:        '#ffffff',
  border:         '#ece5dd',
  borderMuted:    '#f5f0eb',
  primary:        '#0F6E56',
  primaryLight:   '#1D9E75',
  primaryPastel:  '#E1F5EE',
  amber:          '#854F0B',
  amberPastel:    '#FAEEDA',
  blue:           '#185FA5',
  bluePastel:     '#E6F1FB',
  pink:           '#993556',
  pinkPastel:     '#FBEAF0',
  textPrimary:    '#2c2420',
  textSecondary:  '#8a7f74',
  textMuted:      '#b8a898',
  textDisabled:   '#d8cec4',
};
```

---

## Como rodar localmente

```bash
npm run dev
```

Abre em `http://localhost:5173` no navegador.

---

## Plano de desenvolvimento — fases

| Fase | Status | Objetivo |
|---|---|---|
| Fase 1 — Ambiente | ✅ Concluída | React + Vite, estrutura de pastas, tema, navegação |
| Fase 2 — Núcleo | Em andamento | Páginas funcionais, localStorage, checklist |
| Fase 3 — Funcionalidades | Pendente | API TheMealDB, geração de lista |
| Fase 4 — Polimento | Pendente | Testes, README, deploy |

---

## Regras para o Claude Code

1. Nunca avançar para a próxima etapa sem confirmar que a atual está funcionando no browser
2. Sempre criar arquivos na estrutura de pastas definida acima
3. Usar o tema (`src/theme/index.js`) para todas as cores — nunca valores hardcoded
4. Comentar o código em português, de forma simples e didática
5. Quando houver erro, explicar o que causou antes de propor a correção
6. Preferir componentes pequenos e reutilizáveis a páginas gigantes
7. Salvar progresso no GitHub ao final de cada etapa concluída

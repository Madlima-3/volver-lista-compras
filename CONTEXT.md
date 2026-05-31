# Volver — Lista de Compras Familiar
> Arquivo de contexto para o Claude Code. Leia este arquivo antes de qualquer tarefa.

---

## O que é o Volver

Aplicativo mobile para facilitar a rotina de compras de famílias. O usuário escolhe receitas da semana ou do mês, e o app gera automaticamente uma lista de compras. Na hora de ir ao supermercado, a lista vira um checklist interativo.

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
| Frontend / Mobile | React Native + Expo | Escreve uma vez, roda em Android e iOS |
| Linguagem | JavaScript | Mais acessível para iniciantes |
| Navegação | React Navigation | Padrão da comunidade React Native |
| Banco de dados local | expo-sqlite (SQLite) | Dados relacionais offline, mais robusto que AsyncStorage |
| API de receitas | TheMealDB (gratuita) | Sem limite de requisições, boa para desenvolvimento |
| Build / Deploy | Expo EAS Build | Gera APK para Android sem precisar de Mac |

---

## Funcionalidades do app (por prioridade)

### Fase 2 — Núcleo (implementar primeiro)
1. Navegação entre as 4 telas principais
2. Tema visual aplicado globalmente
3. Banco de dados SQLite configurado com as tabelas base
4. Tela Início funcional
5. Tela Lista de Compras com checklist interativo
6. Tela Modo Supermercado (versão ampliada da lista)

### Fase 3 — Funcionalidades avançadas
7. Tela Receitas com busca na API TheMealDB
8. Geração automática da lista a partir de receitas escolhidas
9. Agrupamento de ingredientes duplicados entre receitas
10. Listas recorrentes (salvar e reutilizar listas)
11. Atualização automática de receitas em background

### Fase 4 — Polimento
12. Testes manuais de todos os fluxos
13. README profissional no GitHub
14. Build APK com Expo EAS (opcional)

---

## Estrutura de telas

```
App
├── Tab Navigator (barra de navegação inferior)
│   ├── Início         — menu principal com acesso rápido
│   ├── Receitas       — busca e seleção de receitas
│   ├── Lista          — lista de compras gerada + manual
│   └── Perfil         — configurações e preferências
│
└── Stack Navigator (telas extras)
    └── Modo Mercado   — checklist ampliado para uso no supermercado
```

---

## Design system

### Paleta de cores (tema claro pastel)

```js
// theme.js
export const colors = {
  background:     '#faf7f4',  // fundo geral — bege creme
  surface:        '#ffffff',  // cards e superfícies
  border:         '#ece5dd',  // bordas suaves
  borderMuted:    '#f5f0eb',  // divisores internos

  primary:        '#0F6E56',  // verde escuro — ação principal
  primaryLight:   '#1D9E75',  // verde médio — progresso
  primaryPastel:  '#E1F5EE',  // verde pastel — fundos de ícone

  amber:          '#854F0B',  // âmbar escuro — destaque secundário
  amberPastel:    '#FAEEDA',  // âmbar pastel — fundo badge ativo

  blue:           '#185FA5',  // azul — terceiro acento
  bluePastel:     '#E6F1FB',  // azul pastel

  pink:           '#993556',  // rosa — quarto acento
  pinkPastel:     '#FBEAF0',  // rosa pastel

  textPrimary:    '#2c2420',  // texto principal — marrom escuro
  textSecondary:  '#8a7f74',  // texto secundário
  textMuted:      '#b8a898',  // texto desativado / hints
  textDisabled:   '#d8cec4',  // ícones inativos
};
```

### Tipografia

```js
// Fonte principal: DM Sans (Google Fonts)
// Fonte display: DM Serif Display (títulos e logo)
export const typography = {
  fontSans:    'DMSans',
  fontSerif:   'DMSerifDisplay',
  sizes: {
    xs:   10,
    sm:   11,
    base: 14,
    md:   15,
    lg:   18,
    xl:   22,
    '2xl': 28,
    '3xl': 34,
  },
  weights: {
    regular: '400',
    medium:  '500',
  },
};
```

### Touch targets e espaçamento

```js
export const spacing = {
  touchMin:    44,   // px mínimos para área tocável (mobile-first)
  touchComfy:  64,   // px confortáveis para itens de lista
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   18,
  full: 999,
};
```

---

## Estrutura de arquivos sugerida

```
volver/
├── App.js                    # entrada do app, configura navegação
├── CONTEXT.md                # este arquivo
├── assets/                   # fontes, ícones, imagens
│   └── fonts/
├── src/
│   ├── theme/
│   │   └── index.js          # cores, tipografia, espaçamentos
│   ├── navigation/
│   │   └── index.js          # configuração do React Navigation
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── RecipesScreen.js
│   │   ├── ListScreen.js
│   │   ├── MarketScreen.js
│   │   └── ProfileScreen.js
│   ├── components/           # componentes reutilizáveis
│   │   ├── MenuCard.js
│   │   ├── RecipeCard.js
│   │   ├── ListItem.js
│   │   └── ProgressBar.js
│   ├── database/
│   │   ├── db.js             # configuração e inicialização do SQLite
│   │   └── queries.js        # funções de leitura e escrita
│   ├── services/
│   │   └── mealApi.js        # integração com TheMealDB
│   └── utils/
│       └── listGenerator.js  # lógica de geração da lista a partir de receitas
└── package.json
```

---

## Modelo de dados (banco SQLite)

```sql
-- Receitas salvas localmente
CREATE TABLE recipes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  api_id      TEXT UNIQUE,        -- id da TheMealDB
  name        TEXT NOT NULL,
  category    TEXT,
  image_url   TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ingredientes de cada receita
CREATE TABLE ingredients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id   INTEGER REFERENCES recipes(id),
  name        TEXT NOT NULL,
  quantity    TEXT,
  unit        TEXT
);

-- Listas de compras
CREATE TABLE lists (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  is_template INTEGER DEFAULT 0,   -- 1 = lista recorrente salva
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Itens de cada lista
CREATE TABLE list_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id     INTEGER REFERENCES lists(id),
  name        TEXT NOT NULL,
  quantity    TEXT,
  unit        TEXT,
  category    TEXT,               -- hortifruti, proteínas, etc.
  origin      TEXT,               -- nome da receita de origem (ou "Manual")
  checked     INTEGER DEFAULT 0,  -- 0 = não comprado, 1 = comprado
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API TheMealDB — referência rápida

```
Base URL: https://www.themealdb.com/api/json/v1/1

Buscar por nome:     /search.php?s=chicken
Buscar por categoria:/filter.php?c=Seafood
Receita aleatória:   /random.php
Detalhe de receita:  /lookup.php?i={id}
Listar categorias:   /categories.php
```

Retorno relevante de uma receita:
```json
{
  "idMeal": "52772",
  "strMeal": "Teriyaki Chicken Casserole",
  "strCategory": "Chicken",
  "strMealThumb": "https://...",
  "strIngredient1": "soy sauce",
  "strMeasure1": "3/4 cup",
  ...até strIngredient20 / strMeasure20
}
```

> Atenção: os ingredientes vêm em campos separados (strIngredient1 a strIngredient20), não em array. Será necessário uma função para convertê-los.

---

## Plano de desenvolvimento — fases

| Fase | Status | Objetivo |
|---|---|---|
| Fase 1 — Ambiente | Próxima | Node.js, Expo, VS Code, rodar no celular |
| Fase 2 — Núcleo | Pendente | Navegação, telas, tema, SQLite |
| Fase 3 — Funcionalidades | Pendente | API, geração de lista, listas recorrentes |
| Fase 4 — Polimento | Pendente | Testes, GitHub, APK |

---

## Regras para o Claude Code

1. Nunca avançar para a próxima etapa sem confirmar que a atual está funcionando no Expo Go
2. Sempre criar arquivos na estrutura de pastas definida acima
3. Usar o tema (`src/theme/index.js`) para todas as cores e espaçamentos — nunca valores hardcoded
4. Comentar o código em português, de forma simples e didática
5. Quando houver erro, explicar o que causou antes de propor a correção
6. Preferir componentes pequenos e reutilizáveis a telas gigantes
7. Salvar progresso no GitHub ao final de cada etapa concluída

// Camada de persistência usando localStorage.
// Funciona offline, sem instalação, ideal para protótipo web.
// No futuro (mobile), esta camada pode ser trocada por SQLite sem mudar o resto do app.

const KEYS = {
  lists:       'volver_lists',
  listItems:   'volver_list_items',
  recipes:     'volver_recipes',
  ingredients: 'volver_ingredients',
  recipeCache: 'volver_recipe_cache',
};

function ler(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || [];
  } catch {
    return [];
  }
}

function salvar(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function proximoId(lista) {
  if (lista.length === 0) return 1;
  return Math.max(...lista.map((i) => i.id)) + 1;
}

export const db = { ler, salvar, proximoId, KEYS };

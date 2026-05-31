// Integração com a API Spoonacular.
// A chave fica em .env e nunca vai para o GitHub.

const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// Busca receitas pelo nome (em português)
export async function buscarReceitas(query) {
  const url =
    `${BASE_URL}/recipes/complexSearch` +
    `?query=${encodeURIComponent(query)}` +
    `&language=pt` +
    `&addRecipeInformation=true` +
    `&fillIngredients=true` +
    `&number=10` +
    `&apiKey=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

// Busca detalhes completos de uma receita (ingredientes, instruções)
export async function buscarReceitaPorId(id) {
  const url =
    `${BASE_URL}/recipes/${id}/information` +
    `?includeNutrition=false` +
    `&apiKey=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return await res.json();
}

// Extrai a lista de ingredientes de uma receita já carregada
export function extrairIngredientes(receita) {
  const ingredientes = receita.extendedIngredients || [];
  return ingredientes.map((ing) => ({
    name: ing.name || ing.originalName,
    quantity: ing.amount ? String(ing.amount) : null,
    unit: ing.unit || null,
  }));
}

// Integração com a API TheMealDB. Fase 3.

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function buscarReceitas(nome) {
  const res = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(nome)}`);
  const data = await res.json();
  return data.meals || [];
}

export async function buscarReceitaPorId(id) {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] || null;
}

export function extrairIngredientes(receita) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nome = receita[`strIngredient${i}`];
    const medida = receita[`strMeasure${i}`];
    if (nome && nome.trim()) {
      ingredientes.push({ name: nome.trim(), quantity: medida?.trim() || null });
    }
  }
  return ingredientes;
}

import receitasBR from '../data/receitasBR.json';
import { traduzir } from './traducaoApi';
import { buscarReceitas as buscarSpoonacular } from './spoonacularApi';
import { buscarNoMealDB } from './mealDbApi';
import { db } from '../database/db';

// ── Cache automático (separado das receitas salvas pelo usuário) ──

function lerCache() {
  try { return JSON.parse(localStorage.getItem(db.KEYS.recipeCache)) || []; }
  catch { return []; }
}

function salvarNoCache(receitas) {
  const cache = lerCache();
  const ids = new Set(cache.map((r) => r.id));
  const novas = receitas.filter((r) => !ids.has(r.id));
  if (novas.length === 0) return;
  // Limita cache a 200 receitas para não crescer indefinidamente
  const atualizado = [...novas, ...cache].slice(0, 200);
  localStorage.setItem(db.KEYS.recipeCache, JSON.stringify(atualizado));
}

function buscarPorTitulo(query, lista) {
  const q = query.toLowerCase().trim();
  return lista.filter((r) => r.title.toLowerCase().includes(q));
}

// ── Orquestrador principal ──

export async function buscarReceitas(query) {
  const q = query.trim();
  if (!q) return [];

  // 1. Base estática brasileira (em português, sempre disponível)
  const naBase = buscarPorTitulo(q, receitasBR);
  if (naBase.length > 0) return naBase;

  // 2. Cache de buscas anteriores (resultados de API já salvos)
  const noCache = buscarPorTitulo(q, lerCache());
  if (noCache.length > 0) return noCache;

  // 3. Traduz a busca para inglês e tenta a Spoonacular
  let queryEN = q;
  try { queryEN = await traduzir(q, 'pt', 'en'); } catch { /* usa original */ }

  try {
    const resultados = await buscarSpoonacular(queryEN);
    if (resultados.length > 0) {
      salvarNoCache(resultados);
      return resultados;
    }
  } catch (e) {
    const quotaOuAuth = /40[12]/.test(e.message);
    if (!quotaOuAuth) throw e;
    // Quota esgotada → cai para TheMealDB
  }

  // 4. TheMealDB como fallback (gratuito, sem limite)
  const meals = await buscarNoMealDB(queryEN);
  if (meals.length > 0) salvarNoCache(meals);
  return meals;
}

export { lerCache, salvarNoCache };

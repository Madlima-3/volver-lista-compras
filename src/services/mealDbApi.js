const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function buscarNoMealDB(query) {
  const url = `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TheMealDB: Erro ${res.status}`);
  const data = await res.json();
  return (data.meals || []).slice(0, 10).map(normalizarMeal);
}

function normalizarMeal(meal) {
  const extendedIngredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    const quantity = meal[`strMeasure${i}`]?.trim();
    if (name) extendedIngredients.push({ name, quantity: quantity || null, unit: null });
  }
  return {
    id: `mealdb_${meal.idMeal}`,
    source: 'mealdb',
    title: meal.strMeal,
    image: meal.strMealThumb || null,
    readyInMinutes: null,
    servings: null,
    cuisines: [meal.strArea || meal.strCategory || ''],
    extendedIngredients,
  };
}

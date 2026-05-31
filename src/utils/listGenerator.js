// Gera lista de compras a partir de receitas, agrupando ingredientes duplicados.

export function gerarListaDeReceitas(receitas) {
  const mapa = {};
  for (const receita of receitas) {
    for (const ingrediente of receita.ingredientes) {
      const chave = ingrediente.name.toLowerCase();
      if (mapa[chave]) {
        mapa[chave].origins.push(receita.name);
      } else {
        mapa[chave] = { name: ingrediente.name, quantity: ingrediente.quantity, origins: [receita.name] };
      }
    }
  }
  return Object.values(mapa).map((item) => ({ ...item, origin: item.origins.join(', ') }));
}

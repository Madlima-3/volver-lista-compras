// Funções de leitura e escrita. Cada função faz uma coisa só.

import { db } from './db';

export function criarLista(nome) {
  const listas = db.ler(db.KEYS.lists);
  const nova = {
    id: db.proximoId(listas),
    name: nome,
    status: 'ativa',
    is_template: 0,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  db.salvar(db.KEYS.lists, [...listas, nova]);
  return nova.id;
}

// Retrocompatibilidade: listas antigas sem status são tratadas como 'ativa'
export function buscarListas() {
  return db.ler(db.KEYS.lists)
    .map((l) => ({ ...l, status: l.status || 'ativa' }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Retorna a lista ativa mais recente (usada na HomePage)
export function buscarListaAtiva() {
  return buscarListas().find((l) => l.status === 'ativa') || null;
}

export function salvarLista(listId) {
  const listas = db.ler(db.KEYS.lists).map((l) =>
    l.id === listId
      ? { ...l, status: 'efetuada', completed_at: new Date().toISOString() }
      : l
  );
  db.salvar(db.KEYS.lists, listas);
}

export function ativarLista(listId) {
  const listas = db.ler(db.KEYS.lists).map((l) =>
    l.id === listId ? { ...l, status: 'ativa', completed_at: null } : l
  );
  db.salvar(db.KEYS.lists, listas);
}

export function renomearLista(listId, novoNome) {
  const listas = db.ler(db.KEYS.lists).map((l) =>
    l.id === listId ? { ...l, name: novoNome } : l
  );
  db.salvar(db.KEYS.lists, listas);
}

// Cria uma cópia da lista com todos os itens desmarcados
export function duplicarLista(listId, novoNome) {
  const listas = db.ler(db.KEYS.lists);
  const novaId = db.proximoId(listas);
  const nova = {
    id: novaId,
    name: novoNome,
    status: 'ativa',
    is_template: 0,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  db.salvar(db.KEYS.lists, [...listas, nova]);

  // Copia cada item da lista original, sempre desmarcado
  buscarItensDaLista(listId).forEach((item) => {
    adicionarItem(novaId, {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      origin: item.origin,
    });
  });

  return novaId;
}

export function deletarLista(listId) {
  db.salvar(db.KEYS.lists, db.ler(db.KEYS.lists).filter((l) => l.id !== listId));
  db.salvar(db.KEYS.listItems, db.ler(db.KEYS.listItems).filter((i) => i.list_id !== listId));
}

export function adicionarItem(listId, item) {
  const itens = db.ler(db.KEYS.listItems);
  const novo = {
    id: db.proximoId(itens),
    list_id: listId,
    name: item.name,
    quantity: item.quantity || null,
    unit: item.unit || null,
    category: item.category || null,
    origin: item.origin || 'Manual',
    checked: 0,
    created_at: new Date().toISOString(),
  };
  db.salvar(db.KEYS.listItems, [...itens, novo]);
  return novo.id;
}

export function buscarItensDaLista(listId) {
  return db.ler(db.KEYS.listItems)
    .filter((i) => i.list_id === listId)
    .sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name));
}

export function marcarItem(itemId, marcado) {
  const itens = db.ler(db.KEYS.listItems).map((i) =>
    i.id === itemId ? { ...i, checked: marcado ? 1 : 0 } : i
  );
  db.salvar(db.KEYS.listItems, itens);
}

export function deletarItem(itemId) {
  db.salvar(db.KEYS.listItems, db.ler(db.KEYS.listItems).filter((i) => i.id !== itemId));
}

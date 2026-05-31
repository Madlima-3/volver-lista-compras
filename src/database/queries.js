// Funções de leitura e escrita. Cada função faz uma coisa só.

import { db } from './db';

export function criarLista(nome) {
  const listas = db.ler(db.KEYS.lists);
  const nova = { id: db.proximoId(listas), name: nome, is_template: 0, created_at: new Date().toISOString() };
  db.salvar(db.KEYS.lists, [...listas, nova]);
  return nova.id;
}

export function buscarListas() {
  return db.ler(db.KEYS.lists).sort((a, b) => b.created_at.localeCompare(a.created_at));
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

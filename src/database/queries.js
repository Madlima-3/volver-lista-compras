// Funções de leitura e escrita no banco. Cada função faz uma coisa só.

import { getBanco } from './db';

// --- Listas ---

export async function criarLista(nome) {
  const db = getBanco();
  const resultado = await db.runAsync('INSERT INTO lists (name) VALUES (?)', nome);
  return resultado.lastInsertRowId;
}

export async function buscarListas() {
  const db = getBanco();
  return db.getAllAsync('SELECT * FROM lists ORDER BY created_at DESC');
}

// --- Itens da lista ---

export async function adicionarItem(listId, item) {
  const db = getBanco();
  const { name, quantity = null, unit = null, category = null, origin = 'Manual' } = item;
  const resultado = await db.runAsync(
    'INSERT INTO list_items (list_id, name, quantity, unit, category, origin) VALUES (?, ?, ?, ?, ?, ?)',
    listId, name, quantity, unit, category, origin
  );
  return resultado.lastInsertRowId;
}

export async function buscarItensDaLista(listId) {
  const db = getBanco();
  return db.getAllAsync('SELECT * FROM list_items WHERE list_id = ? ORDER BY category, name', listId);
}

export async function marcarItem(itemId, marcado) {
  const db = getBanco();
  await db.runAsync('UPDATE list_items SET checked = ? WHERE id = ?', marcado ? 1 : 0, itemId);
}

export async function deletarItem(itemId) {
  const db = getBanco();
  await db.runAsync('DELETE FROM list_items WHERE id = ?', itemId);
}

// Funções de leitura e escrita. Cada função faz uma coisa só.

import { db } from './db';

export function criarLista(nome) {
  const listas = db.ler(db.KEYS.lists);
  const nova = {
    id: db.proximoId(listas),
    name: nome,
    status: 'ativa',
    pinned: false,
    is_template: 0,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  db.salvar(db.KEYS.lists, [...listas, nova]);
  return nova.id;
}

// Retrocompatibilidade: listas antigas sem status/pinned recebem valores padrão
export function buscarListas() {
  return db.ler(db.KEYS.lists)
    .map((l) => ({ ...l, status: l.status || 'ativa', pinned: l.pinned || false }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Retorna a lista a exibir na HomePage:
// prioridade para a fixada pelo usuário, senão a ativa mais recente
export function buscarListaAtiva() {
  const ativas = buscarListas().filter((l) => l.status === 'ativa');
  return ativas.find((l) => l.pinned) || ativas[0] || null;
}

// Liga/desliga a fixação de uma lista na HomePage (somente uma pode estar fixada)
export function alternarFixacao(listId) {
  const listas = db.ler(db.KEYS.lists);
  const jaFixada = listas.find((l) => l.id === listId)?.pinned;
  const atualizadas = listas.map((l) => ({
    ...l,
    // se a lista já estava fixada, desfixa; caso contrário, fixa só esta e desfixa as demais
    pinned: jaFixada ? false : l.id === listId,
  }));
  db.salvar(db.KEYS.lists, atualizadas);
}

export function salvarLista(listId) {
  // Ao efetuar, remove a fixação pois listas efetuadas não aparecem no Início
  const listas = db.ler(db.KEYS.lists).map((l) =>
    l.id === listId
      ? { ...l, status: 'efetuada', pinned: false, completed_at: new Date().toISOString() }
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

// Inicializa o banco de dados SQLite e cria as tabelas se ainda não existirem.
// Esta função deve ser chamada uma vez quando o app abre.

import * as SQLite from 'expo-sqlite';

let db;

export async function inicializarBanco() {
  db = await SQLite.openDatabaseAsync('volver.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS recipes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      api_id     TEXT UNIQUE,
      name       TEXT NOT NULL,
      category   TEXT,
      image_url  TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER REFERENCES recipes(id),
      name      TEXT NOT NULL,
      quantity  TEXT,
      unit      TEXT
    );

    CREATE TABLE IF NOT EXISTS lists (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      is_template INTEGER DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS list_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id    INTEGER REFERENCES lists(id),
      name       TEXT NOT NULL,
      quantity   TEXT,
      unit       TEXT,
      category   TEXT,
      origin     TEXT,
      checked    INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// Retorna a instância do banco já aberta (chame inicializarBanco() antes)
export function getBanco() {
  if (!db) throw new Error('Banco não inicializado. Chame inicializarBanco() primeiro.');
  return db;
}

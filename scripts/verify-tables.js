const Database = require('better-sqlite3');
const path = require('path');
const db = new Database('traida.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name));

const messagesCols = db.prepare("PRAGMA table_info(messages)").all();
console.log('Messages Cols:', messagesCols.map(c => c.name));

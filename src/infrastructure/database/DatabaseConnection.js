const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseConnection {
  static _instance = null;

  constructor() {
    if (DatabaseConnection._instance) {
      return DatabaseConnection._instance;
    }

    this._db = null;
    this._initDatabase();
    DatabaseConnection._instance = this;
  }

  static getInstance() {
    if (!DatabaseConnection._instance) {
      DatabaseConnection._instance = new DatabaseConnection();
    }
    return DatabaseConnection._instance;
  }

  _resolveDatabasePath() {
    if (process.env.VERCEL) {
      return '/tmp/acme_store.db';
    }

    const envPath = process.env.SQLITE_DB_PATH || './data/acme_store.db';
    const resolved = path.isAbsolute(envPath)
      ? envPath
      : path.resolve(process.cwd(), envPath);

    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return resolved;
  }

  _initDatabase() {
    const dbPath = this._resolveDatabasePath();
    this._db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al conectar con SQLite:', err.message);
      } else {
        this._db.run('PRAGMA foreign_keys = ON;');
      }
    });
  }

  getDb() {
    return this._db;
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this._db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this._db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this._db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this._db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (!this._db) return resolve();
      this._db.close((err) => {
        if (err) return reject(err);
        DatabaseConnection._instance = null;
        resolve();
      });
    });
  }
}

module.exports = DatabaseConnection;

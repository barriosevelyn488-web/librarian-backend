import DatabaseConnection from './DatabaseConnection.js';
import seed from './seed.js';

class DatabaseInitializer {
  static async initialize() {
    const db = DatabaseConnection.getInstance();

    const ddl = `
      -- 1. Tabla de Usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        identificacion TEXT NOT NULL UNIQUE,
        nombre TEXT NOT NULL,
        telefono TEXT,
        direccion TEXT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Tabla de Libros e Inventario
      CREATE TABLE IF NOT EXISTS libros (
        id_libro INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn TEXT NOT NULL UNIQUE,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        editorial TEXT,
        anio_publicacion INTEGER,
        precio_venta REAL NOT NULL CHECK (precio_venta >= 0),
        stock_total INTEGER NOT NULL DEFAULT 0 CHECK (stock_total >= 0),
        stock_disponible INTEGER NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
        resumen TEXT,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK (stock_disponible <= stock_total)
      );

      -- 3. Tabla de Préstamos
      CREATE TABLE IF NOT EXISTS prestamos (
        id_prestamo INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_libro INTEGER NOT NULL,
        fecha_prestamo TEXT NOT NULL,
        fecha_tentativa_devolucion TEXT NOT NULL,
        fecha_devolucion_real TEXT NULL,
        estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'devuelto', 'retrasado')),
        notas TEXT,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
        FOREIGN KEY (id_libro) REFERENCES libros(id_libro) ON DELETE RESTRICT
      );

      -- 4. Tabla de Ventas (Cabecera)
      CREATE TABLE IF NOT EXISTS ventas (
        id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL DEFAULT 0 CHECK (total >= 0),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
      );

      -- 5. Tabla de Detalle de Ventas
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
        id_venta INTEGER NOT NULL,
        id_libro INTEGER NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
        FOREIGN KEY (id_libro) REFERENCES libros(id_libro) ON DELETE RESTRICT
      );

      -- Índices de alto rendimiento
      CREATE INDEX IF NOT EXISTS idx_libros_titulo ON libros(titulo);
      CREATE INDEX IF NOT EXISTS idx_libros_autor ON libros(autor);
      CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado);
      CREATE INDEX IF NOT EXISTS idx_prestamos_usuario ON prestamos(id_usuario);
      CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(id_usuario);
    `;

    await db.exec(ddl);

    const checkUsers = await db.get('SELECT COUNT(*) as count FROM usuarios');
    if (!checkUsers || checkUsers.count === 0) {
      await seed();
    }

    return true;
  }
}

export default DatabaseInitializer;

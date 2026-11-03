const path = require('path');
const DatabaseConnection = require('./DatabaseConnection');
const DatabaseInitializer = require('./DatabaseInitializer');
const BcryptPasswordHasher = require('../security/BcryptPasswordHasher');

async function seed() {
  console.log('[Seed] Iniciando sembrado de datos iniciales para Acme Store...');

  const db = DatabaseConnection.getInstance();
  await DatabaseInitializer.initialize();

  const hasher = new BcryptPasswordHasher();
  const adminPasswordHash = await hasher.hash('Admin123!');
  const clientePasswordHash = await hasher.hash('Cliente123!');

  // 1. Usuarios Iniciales
  const users = [
    {
      identificacion: 'ADM-1001',
      nombre: 'Administrador Principal',
      telefono: '+57 300 123 4567',
      direccion: 'Avenida Siempreviva 742, Piso 4',
      email: 'admin@acmestore.com',
      password_hash: adminPasswordHash,
      rol: 'admin'
    },
    {
      identificacion: 'CLI-2001',
      nombre: 'Carlos Mendoza',
      telefono: '+57 311 987 6543',
      direccion: 'Carrera 45 # 26 - 85, Apto 302',
      email: 'cliente@acmestore.com',
      password_hash: clientePasswordHash,
      rol: 'cliente'
    },
    {
      identificacion: 'CLI-2002',
      nombre: 'Elena Restrepo',
      telefono: '+57 315 456 7890',
      direccion: 'Calle 100 # 15 - 20',
      email: 'elena.restrepo@example.com',
      password_hash: clientePasswordHash,
      rol: 'cliente'
    }
  ];

  for (const u of users) {
    await db.run(
      `INSERT OR IGNORE INTO usuarios (identificacion, nombre, telefono, direccion, email, password_hash, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u.identificacion, u.nombre, u.telefono, u.direccion, u.email, u.password_hash, u.rol]
    );
  }

  // 2. Libros Iniciales con Sinopsis Detallada
  const books = [
    {
      isbn: '978-0132350884',
      titulo: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      autor: 'Robert C. Martin',
      editorial: 'Prentice Hall',
      anio_publicacion: 2008,
      precio_venta: 45.99,
      stock_total: 15,
      stock_disponible: 14,
      resumen: 'Incluso el código malo puede funcionar. Pero si el código no está limpio, puede poner a una organización de desarrollo de rodillas. Cada año, incontables horas y recursos significativos se pierden debido a código mal escrito. En este libro esencial, Robert C. Martin ("Uncle Bob") presenta un paradigma revolucionario con las mejores prácticas y principios SOLID para escribir código legible, mantenible y profesional.'
    },
    {
      isbn: '978-0201633610',
      titulo: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      autor: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      editorial: 'Addison-Wesley',
      anio_publicacion: 1994,
      precio_venta: 54.50,
      stock_total: 10,
      stock_disponible: 10,
      resumen: 'La biblia fundamental de la Programación Orientada a Objetos y la arquitectura de software. Conocido ampliamente como el libro de la "Banda de los Cuatro" (GoF), captura 23 patrones de diseño clásicos clasificados en Creacionales, Estructurales y de Comportamiento, explicando cómo diseñar software flexible y reutilizable sin reinventar la rueda.'
    },
    {
      isbn: '978-0134494166',
      titulo: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
      autor: 'Robert C. Martin',
      editorial: 'Prentice Hall',
      anio_publicacion: 2017,
      precio_venta: 42.00,
      stock_total: 20,
      stock_disponible: 19,
      resumen: 'Aplicando las reglas universales de la arquitectura de software, este libro enseña cómo separar la lógica de negocio de los detalles de infraestructura, frameworks, bases de datos y la interfaz gráfica. Una guía indispensable para ingenieros que aspiran a construir sistemas altamente escalables, desacoplados y fáciles de testear.'
    },
    {
      isbn: '978-8437604947',
      titulo: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      editorial: 'Editorial Sudamericana',
      anio_publicacion: 1967,
      precio_venta: 28.50,
      stock_total: 25,
      stock_disponible: 25,
      resumen: 'Una de las cumbres universales de la literatura en español y estandarte del realismo mágico. Narra la historia de la familia Buendía a lo largo de siete generaciones en el mítico pueblo de Macondo, explorando el aislamiento, el amor trágico, las guerras civiles y el destino inexorable de la estirpe humana.'
    },
    {
      isbn: '978-0451524935',
      titulo: '1984',
      autor: 'George Orwell',
      editorial: 'Secker & Warburg',
      anio_publicacion: 1949,
      precio_venta: 19.99,
      stock_total: 22,
      stock_disponible: 22,
      resumen: 'Una sobrecogedora novela distópica que advierte sobre los peligros del totalitarismo, la vigilancia omnipresente del "Gran Hermano" y la manipulación de la verdad histórica a través de la Neolengua y la Policía del Pensamiento. Su protagonista, Winston Smith, emprende una solitaria y peligrosa rebelión moral.'
    },
    {
      isbn: '978-0345391803',
      titulo: 'The Hitchhiker\'s Guide to the Galaxy',
      autor: 'Douglas Adams',
      editorial: 'Pan Books',
      anio_publicacion: 1979,
      precio_venta: 22.00,
      stock_total: 12,
      stock_disponible: 12,
      resumen: 'Segundos antes de que la Tierra sea demolida para dar paso a una autopista hiperespacial, Arthur Dent es rescatado por su amigo Ford Prefect, un investigador encubierto de la Guía del Autoestopista Galáctico. Juntos emprenden un hilarante viaje interestelar en busca de la respuesta al sentido de la vida, el universo y todo lo demás.'
    }
  ];

  for (const b of books) {
    await db.run(
      `INSERT OR IGNORE INTO libros (isbn, titulo, autor, editorial, anio_publicacion, precio_venta, stock_total, stock_disponible, resumen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.isbn, b.titulo, b.autor, b.editorial, b.anio_publicacion, b.precio_venta, b.stock_total, b.stock_disponible, b.resumen]
    );
  }

  // 3. Préstamo de Ejemplo
  await db.run(
    `INSERT OR IGNORE INTO prestamos (id_prestamo, id_usuario, id_libro, fecha_prestamo, fecha_tentativa_devolucion, estado, notas)
     VALUES (1, 2, 1, '2026-11-01', '2026-11-15', 'activo', 'Préstamo de prueba para desarrollo')`
  );

  console.log('[Seed] Sembrado completado con éxito.');
  console.log('Credenciales de acceso:');
  console.log('  Admin:   admin@acmestore.com   / Admin123!');
  console.log('  Cliente: cliente@acmestore.com / Cliente123!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Error en seed:', err);
    process.exit(1);
  });
}

module.exports = seed;

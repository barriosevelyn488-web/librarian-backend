const assert = require('assert');
const http = require('http');
const BootstrapFactory = require('../src/index');

function makeRequest(app, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: '127.0.0.1',
        port: port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          server.close();
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

async function runTests() {
  console.log('🧪 Iniciando Suite de Pruebas de Integración (Acme Store)...');

  const { expressApp } = await BootstrapFactory.createApplication();

  // Test 1: Health Check
  console.log('1. Verificando Health Check (/api/health)...');
  const healthRes = await makeRequest(expressApp, 'GET', '/api/health');
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthRes.body.success, true);
  console.log('   ✓ Health check 200 OK');

  // Test 2: Login Admin
  console.log('2. Verificando Login de Administrador...');
  const adminLogin = await makeRequest(expressApp, 'POST', '/api/auth/login', {}, {
    email: 'admin@acmestore.com',
    password: 'Admin123!'
  });
  assert.strictEqual(adminLogin.status, 200);
  assert.strictEqual(adminLogin.body.data.rol, 'admin');
  assert.ok(adminLogin.body.token, 'Debe devolver un JWT token');
  const adminToken = adminLogin.body.token;
  console.log('   ✓ Admin login exitoso con JWT');

  // Test 3: Login Cliente
  console.log('3. Verificando Login de Cliente...');
  const clientLogin = await makeRequest(expressApp, 'POST', '/api/auth/login', {}, {
    email: 'cliente@acmestore.com',
    password: 'Cliente123!'
  });
  assert.strictEqual(clientLogin.status, 200);
  assert.strictEqual(clientLogin.body.data.rol, 'cliente');
  const clientToken = clientLogin.body.token;
  console.log('   ✓ Cliente login exitoso');

  // Test 4: Credenciales inválidas
  console.log('4. Verificando rechazo de credenciales inválidas...');
  const badLogin = await makeRequest(expressApp, 'POST', '/api/auth/login', {}, {
    email: 'admin@acmestore.com',
    password: 'WrongPassword'
  });
  assert.strictEqual(badLogin.status, 401);
  console.log('   ✓ 401 Unauthorized verificado');

  // Test 5: Catálogo de libros con sinopsis
  console.log('5. Verificando Catálogo de Libros y Sinopsis...');
  const booksRes = await makeRequest(expressApp, 'GET', '/api/books');
  assert.strictEqual(booksRes.status, 200);
  assert.ok(booksRes.body.data.length > 0);
  assert.ok(booksRes.body.data[0].resumen, 'Los libros deben incluir sinopsis (resumen)');
  console.log(`   ✓ Catálogo recuperó ${booksRes.body.data.length} libros con sinopsis`);

  // Test 6: Búsqueda de libros
  console.log('6. Verificando Búsqueda de Libros por título/autor...');
  const searchRes = await makeRequest(expressApp, 'GET', '/api/books/search?q=Clean');
  assert.strictEqual(searchRes.status, 200);
  assert.ok(searchRes.body.data.length >= 1);
  console.log(`   ✓ Búsqueda exitosa (${searchRes.body.data.length} coincidencias)`);

  // Test 7: Crear libro por Administrador
  console.log('7. Verificando creación de libro (Rol Admin)...');
  const newBookIsbn = `TEST-${Date.now()}`;
  const createBookRes = await makeRequest(expressApp, 'POST', '/api/books', {
    Authorization: `Bearer ${adminToken}`
  }, {
    isbn: newBookIsbn,
    titulo: 'Libro de Prueba Automatizada',
    autor: 'Ingeniero de Software',
    editorial: 'Editorial Acme',
    anioPublicacion: 2026,
    precioVenta: 29.99,
    stockTotal: 10,
    stockDisponible: 10,
    resumen: 'Una sinopsis completa para verificar la persistencia del resumen del libro.'
  });
  assert.strictEqual(createBookRes.status, 201);
  const createdBookId = createBookRes.body.data.id;
  console.log(`   ✓ Libro creado exitosamente con ID ${createdBookId}`);

  // Test 8: Proteger creación de libros frente a rol Cliente
  console.log('8. Verificando que Rol Cliente NO pueda crear libros...');
  const forbiddenBookRes = await makeRequest(expressApp, 'POST', '/api/books', {
    Authorization: `Bearer ${clientToken}`
  }, {
    isbn: `FORBID-${Date.now()}`,
    titulo: 'Libro Ilegal',
    autor: 'Hacker'
  });
  assert.strictEqual(forbiddenBookRes.status, 403);
  console.log('   ✓ 403 Forbidden verificado');

  // Test 9: Préstamo de libro
  console.log('9. Verificando Préstamo de libro por el Cliente...');
  const loanRes = await makeRequest(expressApp, 'POST', '/api/loans', {
    Authorization: `Bearer ${clientToken}`
  }, {
    libroId: createdBookId,
    fechaTentativaDevolucion: '2026-12-01'
  });
  assert.strictEqual(loanRes.status, 201);
  const loanId = loanRes.body.data.id;
  console.log(`   ✓ Préstamo creado exitosamente con ID ${loanId}`);

  // Test 10: Devolución de préstamo
  console.log('10. Verificando Devolución de libro prestado...');
  const returnRes = await makeRequest(expressApp, 'PATCH', `/api/loans/${loanId}/return`, {
    Authorization: `Bearer ${clientToken}`
  });
  assert.strictEqual(returnRes.status, 200);
  assert.strictEqual(returnRes.body.data.estado, 'devuelto');
  console.log('   ✓ Libro devuelto exitosamente');

  // Test 11: Compra multilibro con pasarela de pago PayPal
  console.log('11. Verificando Compra Multi-libro con Pasarela de Pago...');
  const saleRes = await makeRequest(expressApp, 'POST', '/api/sales', {
    Authorization: `Bearer ${clientToken}`
  }, {
    items: [
      { libroId: createdBookId, cantidad: 2 }
    ]
  });
  assert.strictEqual(saleRes.status, 201);
  assert.ok(saleRes.body.data.pago, 'La venta debe retornar comprobante de pago');
  assert.ok(saleRes.body.data.pago.transactionId.startsWith('PAYPAL-'), 'Debe incluir ID de transacción PayPal');
  console.log(`   ✓ Venta procesada exitosamente con ID de pago: ${saleRes.body.data.pago.transactionId}`);

  // Test 12: Inmutabilidad de Identificación en el Perfil
  console.log('12. Verificando regla de negocio: Inmutabilidad de identificación en Perfil...');
  const profileRes = await makeRequest(expressApp, 'GET', '/api/profile', {
    Authorization: `Bearer ${clientToken}`
  });
  const originalId = profileRes.body.data.identificacion;

  const updateProfileRes = await makeRequest(expressApp, 'PUT', '/api/profile', {
    Authorization: `Bearer ${clientToken}`
  }, {
    nombre: 'Carlos Mendoza Actualizado',
    telefono: '+57 320 000 1122',
    direccion: 'Nueva Dirección 123',
    identificacion: 'HACKED-ID-9999' // Intento de cambio malicioso
  });
  assert.strictEqual(updateProfileRes.status, 200);
  assert.strictEqual(updateProfileRes.body.data.identificacion, originalId, 'La identificación debe mantenerse inmutable');
  console.log('   ✓ Inmutabilidad de identificación garantizada');

  // Test 13: Gestión de Usuarios por el Administrador
  console.log('13. Verificando Gestión de Usuarios por el Administrador...');
  const usersRes = await makeRequest(expressApp, 'GET', '/api/users', {
    Authorization: `Bearer ${adminToken}`
  });
  assert.strictEqual(usersRes.status, 200);
  assert.ok(usersRes.body.data.length >= 2);

  // Crear nuevo usuario desde Admin
  const testUserEmail = `user.${Date.now()}@test.com`;
  const createUserRes = await makeRequest(expressApp, 'POST', '/api/users', {
    Authorization: `Bearer ${adminToken}`
  }, {
    identificacion: `ID-${Date.now()}`,
    nombre: 'Usuario Creado por Admin',
    email: testUserEmail,
    password: 'Password123!',
    rol: 'cliente'
  });
  assert.strictEqual(createUserRes.status, 201);
  const newUserId = createUserRes.body.data.id;

  // Actualizar rol a admin
  const updateRoleRes = await makeRequest(expressApp, 'PUT', `/api/users/${newUserId}`, {
    Authorization: `Bearer ${adminToken}`
  }, {
    rol: 'admin'
  });
  assert.strictEqual(updateRoleRes.status, 200);
  assert.strictEqual(updateRoleRes.body.data.rol, 'admin');

  // Eliminar usuario de prueba
  const deleteUserRes = await makeRequest(expressApp, 'DELETE', `/api/users/${newUserId}`, {
    Authorization: `Bearer ${adminToken}`
  });
  assert.strictEqual(deleteUserRes.status, 200);
  console.log('   ✓ CRUD completo de Gestión de Usuarios verificado');

  console.log('\n🎉 ¡TODAS LAS 13 PRUEBAS DE INTEGRACIÓN PASARON EXITOSAMENTE!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ ERROR EN PRUEBAS:', err);
  process.exit(1);
});

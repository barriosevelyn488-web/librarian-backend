# Acme Store - Backend REST API (100% POO, SOLID y Clean Architecture)

API REST empresarial para la administracion y operacion de libreria y biblioteca virtual: catalogo editorial con sinopsis completa, prestamos con control de inventario y devoluciones, ventas multilibro con comprobante fiscal y pasarela de pago, administracion de usuarios y control de acceso basado en roles (RBAC).

Construido estrictamente bajo **Programacion Orientada a Objetos (POO)** y los 5 **Principios SOLID**, garantizando desacoplamiento, alta cohesion y testeabilidad sin mezclar paradigmas funcionales.

---

## 1. Repositorio Frontend Conectado
- **Frontend App:** [https://github.com/barriosevelyn488-web/acme-store-frontend](https://github.com/barriosevelyn488-web/acme-store-frontend)

---

## 2. Arquitectura del Sistema (Clean Architecture)

```
src/
├── domain/                      # Capa Central de Dominio (Sin dependencias externas)
│   ├── entities/               # Entidades de Negocio con encapsulamiento estricto
│   │   ├── Book.js             # Entidad Libro con control de stock y sinopsis
│   │   ├── Loan.js             # Entidad Prestamo con estados (activo, devuelto, retrasado)
│   │   ├── Sale.js             # Entidad Venta (Cabecera y calculo de total)
│   │   ├── SaleDetail.js       # Entidad Detalle de Venta (Libro, cantidad, subtotal)
│   │   └── User.js             # Entidad Usuario con proteccion de inmutabilidad de ID
│   ├── errors/
│   │   └── DomainErrors.js     # Jerarquia de Excepciones de Dominio fuertemente tipadas
│   ├── repositories/           # Interfaces / Contratos de Repositorios (DIP)
│   │   ├── IBookRepository.js
│   │   ├── ILoanRepository.js
│   │   ├── ISaleRepository.js
│   │   └── IUserRepository.js
│   └── services/               # Contratos de Servicios de Dominio
│       └── IPaymentGateway.js  # Interfaz para Estrategia de Pasarelas de Pago (OCP)
│
├── application/                 # Capa de Casos de Uso y Orquestacion
│   └── services/               # Servicios de Aplicacion (POO)
│       ├── AuthService.js      # Registro y Login con hashing y generacion JWT
│       ├── BookService.js      # Busqueda, filtrado y CRUD de catalogo
│       ├── LoanService.js      # Prestamos, devoluciones e inventario
│       ├── SaleService.js      # Ventas multilibro y cobro con pasarela PayPal
│       ├── ProfileService.js   # Perfil personal (Identificacion protegida)
│       └── UserService.js      # Gestion de usuarios y asignacion de roles (Admin)
│
├── infrastructure/              # Capa de Implementacion Externa y Persistencia
│   ├── database/
│   │   ├── DatabaseConnection.js   # Singleton de conexion SQLite
│   │   ├── DatabaseInitializer.js  # DDL relacional 3NF e indices
│   │   └── seed.js                 # Sembrado de datos con sinopsis de libros
│   ├── repositories/           # Implementaciones SQLite de los contratos
│   │   ├── SqliteBookRepository.js
│   │   ├── SqliteLoanRepository.js
│   │   ├── SqliteSaleRepository.js
│   │   └── SqliteUserRepository.js
│   ├── security/
│   │   ├── BcryptPasswordHasher.js # Cifrado unidireccional con Salt
│   │   └── JwtTokenService.js      # Firma y verificacion de Tokens JWT
│   └── payments/
│       └── PayPalPaymentGateway.js # Implementacion Strategy de pago PayPal
│
├── presentation/                # Capa de Entrega HTTP (Express en POO)
│   ├── middlewares/            # Middlewares encapsulados en Clases
│   │   ├── AuthMiddleware.js       # Verificacion dual: Cookies HTTP-Only & Bearer
│   │   ├── RoleMiddleware.js       # Control de acceso RBAC (admin / cliente)
│   │   ├── RateLimitMiddleware.js  # Proteccion contra ataques de fuerza bruta
│   │   └── ErrorHandlerMiddleware.js # Mapeo de errores de dominio a codigos HTTP
│   ├── controllers/            # Controladores en Clases
│   │   ├── AuthController.js
│   │   ├── BookController.js
│   │   ├── LoanController.js
│   │   ├── SaleController.js
│   │   ├── ProfileController.js
│   │   └── UserController.js
│   ├── routes/                 # Routers modulares en Clases
│   │   ├── AuthRouter.js
│   │   ├── BookRouter.js
│   │   ├── LoanRouter.js
│   │   ├── SaleRouter.js
│   │   ├── ProfileRouter.js
│   │   └── UserRouter.js
│   └── App.js                  # Clase Principal Express (Helmet, CORS, Cookies)
│
├── api/
│   └── index.js                # Handler Serverless para despliegue en Vercel
├── bruno/                      # Coleccion Bruno de pruebas de endpoints
├── test/
│   └── integration.test.js     # Suite de 13 pruebas de integracion automatizadas
└── src/index.js                # Composition Root (Inyeccion de Dependencias)
```

---

## 3. Base de Datos Relacional SQL (Tercera Forma Normal - 3NF)

El sistema utiliza **SQLite** con motor relacional estructurado en 3NF, garantizando integridad referencial mediante claves foraneas activas (`PRAGMA foreign_keys = ON;`) y reglas de integridad de dominio (`CHECK`, `UNIQUE`, `NOT NULL`):

1. **`usuarios`**: Clave primaria `id_usuario`. Identificacion y email unicos. Rol restringido a `'admin'` o `'cliente'`.
2. **`libros`**: Clave primaria `id_libro`. ISBN unico. Campos de stock (`stock_total`, `stock_disponible`), precio de venta y columna `resumen TEXT` para la sinopsis completa. Regla `CHECK (stock_disponible <= stock_total)`.
3. **`prestamos`**: Clave primaria `id_prestamo`. Claves foraneas hacia `usuarios(id_usuario)` y `libros(id_libro)` con restriccion `ON DELETE RESTRICT`. Estados controlados (`'activo'`, `'devuelto'`, `'retrasado'`).
4. **`ventas`**: Cabecera de venta con clave foranea al cliente y total acumulado.
5. **`detalle_ventas`**: Detalle transaccional de venta por libro (1 o multiples ejemplares) con clave foranea a `ventas` (`ON DELETE CASCADE`) y a `libros` (`ON DELETE RESTRICT`).

---

## 4. Analisis de Ciberseguridad y Mitigacion de Amenazas

La aplicacion fue disenada bajo el principio de defensa en profundidad:

1. **Inyeccion SQL (SQLi):** Mitigada al 100%. Todas las consultas en los repositorios de infraestructura utilizan sentencias preparadas parametrizadas (`db.run(sql, params)`, `db.get(sql, params)`, `db.all(sql, params)`). Ninguna entrada de usuario se concatena directamente a SQL.
2. **Ataques de Fuerza Bruta y DoS:** `RateLimitMiddleware` limita los intentos en rutas de autenticacion (`/api/auth`) a maximo 15 peticiones por ventana de 15 minutos por direccion IP.
3. **Secuestro de Sesion (XSS / Token Theft):** El token JWT se transmite prioritariamente en cookies seguras con cabeceras `httpOnly: true` (inaccesibles por JavaScript malicioso), `sameSite: 'lax'` (proteccion contra CSRF) y flag `secure` en produccion.
4. **Almacenamiento de Contrasenas:** Cifrado unidireccional irreversible mediante `bcryptjs` con 10 rondas de salt criptografico en `BcryptPasswordHasher`.
5. **Cabeceras HTTP de Seguridad:** Implementacion de `helmet` para configurar `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, y politicas CSP.
6. **CORS Seguro:** Politica de Cross-Origin Resource Sharing con verificacion de origen explicito y soporte estricto de credenciales.
7. **Control de Acceso Basado en Roles (RBAC):** `RoleMiddleware` valida que solo usuarios autenticados con rol `'admin'` puedan crear, actualizar o eliminar libros, consultar historiales globales o administrar usuarios.
8. **Inmutabilidad de Identificacion:** Regla de negocio en la entidad `User` que rechaza cualquier intento de modificacion del documento de identidad tras su creacion.

---

## 5. Aplicacion de Principios SOLID y Patrones de Diseno

1. **S - Single Responsibility Principle (SRP):** Cada clase tiene una unica razon para cambiar. Las entidades encapsulan validaciones y reglas de negocio, los repositorios gestionan persistencia SQL y los controladores gestionan la interfaz HTTP.
2. **O - Open/Closed Principle (OCP):** El modulo de pagos se basa en el contrato `IPaymentGateway`. Se implemento `PayPalPaymentGateway`, pero se pueden conectar `StripePaymentGateway` o `MercadoPagoGateway` sin modificar `SaleService`.
3. **L - Liskov Substitution Principle (LSP):** Cualquier implementacion de `IBookRepository`, `IUserRepository` o `IPaymentGateway` puede sustituir a su clase base sin alterar la logica de la aplicacion.
4. **I - Interface Segregation Principle (ISP):** Contratos atomizados y especificos para cada modulo (`IBookRepository`, `ILoanRepository`, `ISaleRepository`, `IUserRepository`).
5. **D - Dependency Inversion Principle (DIP):** Las capas de dominio y aplicacion dependen de abstracciones, nunca de detalles concretos. El Composition Root (`BootstrapFactory`) inyecta las dependencias en tiempo de arranque.

### Patrones de Diseno Utilizados:
- **Singleton:** `DatabaseConnection` asegura una unica instancia de conexion a la base de datos.
- **Strategy:** `IPaymentGateway` define la familia de algoritmos de procesamiento de pagos intercambiables.
- **Repository:** Desacopla la persistencia SQL de la logica de dominio.
- **Factory / Composition Root:** `BootstrapFactory` ensambla y orquesta el grafo completo de dependencias.

---

## 6. Credenciales de Acceso

| Rol | Correo Electronico | Contrasena | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@acmestore.com` | `Admin123!` | Acceso total al catalogo, prestamos globales, ventas globales y Gestion de Usuarios. |
| **Cliente** | `cliente@acmestore.com` | `Cliente123!` | Catalogo, solicitar prestamos personales, compras de libros, perfil personal. |

---

## 7. Instalacion y Ejecucion Local

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/barriosevelyn488-web/acme-store-backend.git
cd acme-store-backend
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Copiar el archivo de plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```

### Paso 4: Sembrar la base de datos SQL con catalogo inicial
```bash
npm run seed
```

### Paso 5: Ejecutar suite de pruebas de integracion automatizadas
```bash
npm test
```

### Paso 6: Iniciar el servidor
```bash
npm start
```
El servidor estara operativo en: `http://localhost:3000`.
Health check disponible en: `http://localhost:3000/api/health`.

---

## 8. Pruebas con Coleccion Bruno

La carpeta `bruno/` contiene la coleccion completa de peticiones REST para probar la API con [Bruno](https://www.usebruno.com/):
- **Coleccion:** `bruno/bruno.json`
- **Ambiente:** `bruno/environments/Local.bru`
- **Peticiones incluidas:**
  - `Auth/Login Admin`
  - `Auth/Login Cliente`
  - `Books/Get All Books` (incluye sinopsis completa)
  - `Sales/Checkout Multi-Book` (con pasarela PayPal)
  - `Users/List Users (Admin)` (gestion administrativa de usuarios)

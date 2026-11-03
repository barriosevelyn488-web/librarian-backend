# Acme Store - Backend REST API (100% POO & Clean Architecture)

API REST empresarial para la gestión integral de catálogo de libros, préstamos de biblioteca con control de stock, ventas multilibro con comprobante fiscal y pasarela de pago, perfil de usuario con protección de inmutabilidad y módulo de administración y control de acceso basado en roles (RBAC).

Construido estrictamente bajo **Programación Orientada a Objetos (POO)** y los 5 **Principios SOLID**, garantizando desacoplamiento, alta cohesión y testeabilidad.

---

## 🏛️ Arquitectura del Sistema (Clean Architecture)

```
src/
├── domain/                      # Capa Central de Dominio (Sin dependencias externas)
│   ├── entities/               # Entidades de Negocio con encapsulamiento estricto
│   │   ├── Book.js             # Entidad Libro con control de stock y sinopsis
│   │   ├── Loan.js             # Entidad Préstamo con estados (activo, devuelto, retrasado)
│   │   ├── Sale.js             # Entidad Venta (Cabecera y cálculo total)
│   │   ├── SaleDetail.js       # Entidad Detalle de Venta (Libro, cantidad, subtotal)
│   │   └── User.js             # Entidad Usuario con protección de inmutabilidad de ID
│   ├── errors/
│   │   └── DomainErrors.js     # Excepciones de Dominio fuertemente tipadas
│   ├── repositories/           # Interfaces / Contratos de Repositorios (DIP)
│   │   ├── IBookRepository.js
│   │   ├── ILoanRepository.js
│   │   ├── ISaleRepository.js
│   │   └── IUserRepository.js
│   └── services/               # Contratos de Servicios de Dominio
│       └── IPaymentGateway.js  # Interfaz para Estrategia de Pasarelas de Pago (OCP)
│
├── application/                 # Capa de Casos de Uso y Orquestación
│   └── services/               # Servicios de Aplicación (POO)
│       ├── AuthService.js      # Registro y Login con hashing y generación JWT
│       ├── BookService.js      # Búsqueda, filtrado y CRUD de catálogo
│       ├── LoanService.js      # Préstamos, devoluciones e inventario
│       ├── SaleService.js      # Ventas multilibro y cobro con pasarela PayPal
│       ├── ProfileService.js   # Perfil personal (Identificación protegida)
│       └── UserService.js      # Gestión de usuarios y asignación de roles (Admin)
│
├── infrastructure/              # Capa de Implementación Externa y Persistencia
│   ├── database/
│   │   ├── DatabaseConnection.js   # Singleton de conexión SQLite
│   │   ├── DatabaseInitializer.js  # DDL relacional 3NF e índices
│   │   └── seed.js                 # Sembrado de datos con sinopsis de libros
│   ├── repositories/           # Implementaciones SQLite de los contratos
│   │   ├── SqliteBookRepository.js
│   │   ├── SqliteLoanRepository.js
│   │   ├── SqliteSaleRepository.js
│   │   └── SqliteUserRepository.js
│   ├── security/
│   │   ├── BcryptPasswordHasher.js # Cifrado unidireccional con Salt
│   │   └── JwtTokenService.js      # Firma y verificación de Tokens JWT
│   └── payments/
│       └── PayPalPaymentGateway.js # Implementación Strategy de pago PayPal
│
├── presentation/                # Capa de Entrega HTTP (Express en POO)
│   ├── middlewares/            # Middlewares encapsulados en Clases
│   │   ├── AuthMiddleware.js       # Verificación dual: Cookies HTTP-Only & Bearer
│   │   ├── RoleMiddleware.js       # Control de acceso RBAC (admin / cliente)
│   │   ├── RateLimitMiddleware.js  # Protección contra ataques de fuerza bruta
│   │   └── ErrorHandlerMiddleware.js # Mapeo de errores de dominio a HTTP
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
├── bruno/                      # Colección Bruno de pruebas de endpoints
├── test/
│   └── integration.test.js     # Suite de 13 pruebas de integración automatizadas
└── src/index.js                # Composition Root (Inyección de Dependencias)
```

---

## 💎 Aplicación de Principios SOLID

1. **S - Single Responsibility Principle (SRP):**
   - Cada clase responde a una única razón de cambio. Las entidades encapsulan reglas de dominio puras (e.g. `Book.canBeSold()`, `User.attemptChangeIdentificacion()`), los repositorios manejan SQL, y los servicios coordinan los casos de uso.
2. **O - Open/Closed Principle (OCP):**
   - El sistema de pagos está basado en la interfaz `IPaymentGateway`. Se implementó `PayPalPaymentGateway`, pero se puede conectar `StripePaymentGateway` o `MercadoPagoGateway` sin alterar una sola línea de `SaleService`.
3. **L - Liskov Substitution Principle (LSP):**
   - Cualquier implementación que herede de `IBookRepository`, `IUserRepository` o `IPaymentGateway` es completamente intercambiable sin alterar el comportamiento de la capa de aplicación.
4. **I - Interface Segregation Principle (ISP):**
   - Los contratos están atomizados y especializados por entidad y propósito (`IBookRepository`, `ILoanRepository`, `ISaleRepository`, `IUserRepository`).
5. **D - Dependency Inversion Principle (DIP):**
   - Las capas superiores no dependen de librerías de bajo nivel. Los servicios de aplicación dependen de interfaces y abstracciones, las cuales son inyectadas en el punto de composición (`BootstrapFactory`).

---

## 🔒 Capas de Seguridad Implementadas

1. **Protección de Cabeceras HTTP:** Implementación de `helmet` para prevenir XSS, Clickjacking y MIME sniffing.
2. **Mitigación de Fuerza Bruta / DDoS:** `RateLimitMiddleware` configurado para limitar intentos en `/api/auth` (15 solicitudes por ventana de 15 min).
3. **Manejo de Sesión Seguro:** JWT transmitido mediante Cookies `httpOnly: true`, `sameSite: 'lax'` y `secure` en producción, mitigando la exposición de tokens a scripts maliciosos.
4. **Cifrado de Contraseñas:** Hash con Salt Rounds mediante `BcryptPasswordHasher`.
5. **Inmutabilidad de Identificación:** Regla de negocio a nivel entidad que prohíbe terminantemente alterar el documento de identidad una vez creado.

---

## 👥 Credenciales de Acceso

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@acmestore.com` | `Admin123!` | Acceso total al catálogo, préstamos globales, ventas globales y Gestión de Usuarios. |
| **Cliente** | `cliente@acmestore.com` | `Cliente123!` | Catálogo, solicitar préstamos personales, compras de libros, perfil personal. |

---

## 🚀 Puesta en Marcha Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Sembrar base de datos
```bash
npm run seed
```

### 3. Ejecutar pruebas automatizadas
```bash
npm test
```

### 4. Iniciar servidor
```bash
npm start
```
El servidor escuchará en `http://localhost:3000`.

---

## 🧪 Pruebas con Bruno

La carpeta `bruno/` contiene la colección lista para importar en el cliente [Bruno](https://www.usebruno.com/):
- **Colección:** `bruno/bruno.json`
- **Ambiente:** `bruno/environments/Local.bru`
- **Peticiones:**
  - `Auth/Login Admin`
  - `Auth/Login Cliente`
  - `Books/Get All Books` (Incluye sinopsis detallada)
  - `Sales/Checkout Multi-Book` (Cobro con PayPal)
  - `Users/List Users (Admin)` (Gestión de usuarios)

---

## 🌐 Repositorio Frontend Conectado
- **Frontend:** [https://github.com/barriosevelyn488-web/acme-store-frontend](https://github.com/barriosevelyn488-web/acme-store-frontend)

require('dotenv').config();
const DatabaseConnection = require('./infrastructure/database/DatabaseConnection');
const DatabaseInitializer = require('./infrastructure/database/DatabaseInitializer');

// Repositorios
const SqliteUserRepository = require('./infrastructure/repositories/SqliteUserRepository');
const SqliteBookRepository = require('./infrastructure/repositories/SqliteBookRepository');
const SqliteLoanRepository = require('./infrastructure/repositories/SqliteLoanRepository');
const SqliteSaleRepository = require('./infrastructure/repositories/SqliteSaleRepository');

// Seguridad y Pasarela
const BcryptPasswordHasher = require('./infrastructure/security/BcryptPasswordHasher');
const JwtTokenService = require('./infrastructure/security/JwtTokenService');
const PayPalPaymentGateway = require('./infrastructure/payments/PayPalPaymentGateway');

// Servicios de Aplicación
const AuthService = require('./application/services/AuthService');
const BookService = require('./application/services/BookService');
const LoanService = require('./application/services/LoanService');
const SaleService = require('./application/services/SaleService');
const ProfileService = require('./application/services/ProfileService');
const UserService = require('./application/services/UserService');

// Middlewares
const AuthMiddleware = require('./presentation/middlewares/AuthMiddleware');
const RoleMiddleware = require('./presentation/middlewares/RoleMiddleware');
const RateLimitMiddleware = require('./presentation/middlewares/RateLimitMiddleware');
const ErrorHandlerMiddleware = require('./presentation/middlewares/ErrorHandlerMiddleware');

// Controladores
const AuthController = require('./presentation/controllers/AuthController');
const BookController = require('./presentation/controllers/BookController');
const LoanController = require('./presentation/controllers/LoanController');
const SaleController = require('./presentation/controllers/SaleController');
const ProfileController = require('./presentation/controllers/ProfileController');
const UserController = require('./presentation/controllers/UserController');

// Enrutadores
const AuthRouter = require('./presentation/routes/AuthRouter');
const BookRouter = require('./presentation/routes/BookRouter');
const LoanRouter = require('./presentation/routes/LoanRouter');
const SaleRouter = require('./presentation/routes/SaleRouter');
const ProfileRouter = require('./presentation/routes/ProfileRouter');
const UserRouter = require('./presentation/routes/UserRouter');

// Aplicación Principal
const App = require('./presentation/App');

/**
 * BootstrapFactory
 * Clase responsable de ensamblar el grafo de dependencias según Clean Architecture y DIP.
 */
class BootstrapFactory {
  static async createApplication(customDbPath = null) {
    // 1. Conexión e Inicialización de Base de Datos
    if (customDbPath) {
      process.env.SQLITE_DB_PATH = customDbPath;
    }
    const dbConnection = DatabaseConnection.getInstance();
    await DatabaseInitializer.initialize();

    // 2. Infraestructura y Seguridad
    const userRepository = new SqliteUserRepository();
    const bookRepository = new SqliteBookRepository();
    const loanRepository = new SqliteLoanRepository();
    const saleRepository = new SqliteSaleRepository();

    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService();
    const paymentGateway = new PayPalPaymentGateway();

    // 3. Servicios de Aplicación
    const authService = new AuthService(userRepository, passwordHasher, tokenService);
    const bookService = new BookService(bookRepository);
    const loanService = new LoanService(loanRepository, bookRepository, userRepository);
    const saleService = new SaleService(saleRepository, bookRepository, userRepository, paymentGateway);
    const profileService = new ProfileService(userRepository, passwordHasher);
    const userService = new UserService(userRepository, passwordHasher);

    // 4. Middlewares
    const authMiddleware = new AuthMiddleware(tokenService);
    const adminRoleMiddleware = new RoleMiddleware(['admin']);
    const authRateLimiter = RateLimitMiddleware.createAuthLimiter();
    const errorHandlerMiddleware = new ErrorHandlerMiddleware();

    // 5. Controladores
    const authController = new AuthController(authService);
    const bookController = new BookController(bookService);
    const loanController = new LoanController(loanService);
    const saleController = new SaleController(saleService);
    const profileController = new ProfileController(profileService);
    const userController = new UserController(userService);

    // 6. Enrutadores
    const authRouter = new AuthRouter(authController, authMiddleware, authRateLimiter);
    const bookRouter = new BookRouter(bookController, authMiddleware, adminRoleMiddleware);
    const loanRouter = new LoanRouter(loanController, authMiddleware, adminRoleMiddleware);
    const saleRouter = new SaleRouter(saleController, authMiddleware, adminRoleMiddleware);
    const profileRouter = new ProfileRouter(profileController, authMiddleware);
    const userRouter = new UserRouter(userController, authMiddleware, adminRoleMiddleware);

    // 7. Aplicación Principal
    const application = new App({
      authRouter,
      bookRouter,
      loanRouter,
      saleRouter,
      profileRouter,
      userRouter,
      errorHandlerMiddleware
    });

    return {
      application,
      expressApp: application.getExpressApp(),
      db: dbConnection,
      services: {
        authService,
        bookService,
        loanService,
        saleService,
        profileService,
        userService
      }
    };
  }
}

// Inicialización del servidor si se ejecuta como script principal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  BootstrapFactory.createApplication().then(({ expressApp }) => {
    expressApp.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`   ACME STORE API - REST SERVICE (POO)   `);
      console.log(`   Servidor activo en: http://localhost:${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  }).catch(err => {
    console.error('Error al inicializar la aplicación:', err);
    process.exit(1);
  });
}

module.exports = BootstrapFactory;

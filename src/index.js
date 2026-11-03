import 'dotenv/config';
import { fileURLToPath } from 'url';

// Base de Datos
import DatabaseConnection from './infrastructure/database/DatabaseConnection.js';
import DatabaseInitializer from './infrastructure/database/DatabaseInitializer.js';

// Repositorios
import SqliteUserRepository from './infrastructure/repositories/SqliteUserRepository.js';
import SqliteBookRepository from './infrastructure/repositories/SqliteBookRepository.js';
import SqliteLoanRepository from './infrastructure/repositories/SqliteLoanRepository.js';
import SqliteSaleRepository from './infrastructure/repositories/SqliteSaleRepository.js';

// Seguridad y Pasarela
import BcryptPasswordHasher from './infrastructure/security/BcryptPasswordHasher.js';
import JwtTokenService from './infrastructure/security/JwtTokenService.js';
import PayPalPaymentGateway from './infrastructure/payments/PayPalPaymentGateway.js';

// Servicios de Aplicacion
import AuthService from './application/services/AuthService.js';
import BookService from './application/services/BookService.js';
import LoanService from './application/services/LoanService.js';
import SaleService from './application/services/SaleService.js';
import ProfileService from './application/services/ProfileService.js';
import UserService from './application/services/UserService.js';

// Middlewares
import AuthMiddleware from './presentation/middlewares/AuthMiddleware.js';
import RoleMiddleware from './presentation/middlewares/RoleMiddleware.js';
import RateLimitMiddleware from './presentation/middlewares/RateLimitMiddleware.js';
import ErrorHandlerMiddleware from './presentation/middlewares/ErrorHandlerMiddleware.js';

// Controladores
import AuthController from './presentation/controllers/AuthController.js';
import BookController from './presentation/controllers/BookController.js';
import LoanController from './presentation/controllers/LoanController.js';
import SaleController from './presentation/controllers/SaleController.js';
import ProfileController from './presentation/controllers/ProfileController.js';
import UserController from './presentation/controllers/UserController.js';

// Enrutadores
import AuthRouter from './presentation/routes/AuthRouter.js';
import BookRouter from './presentation/routes/BookRouter.js';
import LoanRouter from './presentation/routes/LoanRouter.js';
import SaleRouter from './presentation/routes/SaleRouter.js';
import ProfileRouter from './presentation/routes/ProfileRouter.js';
import UserRouter from './presentation/routes/UserRouter.js';

// Aplicacion Principal
import App from './presentation/App.js';

/**
 * BootstrapFactory
 * Clase responsable de ensamblar el grafo de dependencias segun Clean Architecture y DIP.
 */
export class BootstrapFactory {
  static async createApplication(customDbPath = null) {
    // 1. Conexion e Inicializacion de Base de Datos
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

    // 3. Servicios de Aplicacion
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

    // 7. Aplicacion Principal
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

// Inicializacion del servidor si se ejecuta como script principal
if (process.argv[1] === fileURLToPath(import.meta.url)) {
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
    console.error('Error al inicializar la aplicacion:', err);
    process.exit(1);
  });
}

export default BootstrapFactory;

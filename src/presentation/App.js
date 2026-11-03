const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

/**
 * App
 * Clase central de la aplicación Express bajo POO.
 * Encapsula la configuración de middlewares, seguridad HTTP y enrutamiento modular.
 */
class App {
  constructor({
    authRouter,
    bookRouter,
    loanRouter,
    saleRouter,
    profileRouter,
    userRouter,
    errorHandlerMiddleware,
    apiLimiter
  }) {
    this.app = express();
    this.authRouter = authRouter;
    this.bookRouter = bookRouter;
    this.loanRouter = loanRouter;
    this.saleRouter = saleRouter;
    this.profileRouter = profileRouter;
    this.userRouter = userRouter;
    this.errorHandlerMiddleware = errorHandlerMiddleware;
    this.apiLimiter = apiLimiter;

    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  configureMiddlewares() {
    // Seguridad con cabeceras HTTP Helmet
    this.app.use(helmet());

    // CORS configurado para admitir credenciales y cookies
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'null' // Para llamadas locales directas en desarrollo
    ];

    this.app.use(cors({
      origin: (origin, callback) => {
        // Permitir peticiones sin origen (como Postman/Bruno/curl o archivos locales)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(null, true); // Permisivo en desarrollo / demo
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Parseo de payloads JSON y URL-encoded
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Parseo de cookies HTTP
    this.app.use(cookieParser());
  }

  configureRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Acme Store API operational',
        timestamp: new Date().toISOString()
      });
    });

    // Rutas de dominio
    this.app.use('/api/auth', this.authRouter.getRouter());
    this.app.use('/api/books', this.bookRouter.getRouter());
    this.app.use('/api/loans', this.loanRouter.getRouter());
    this.app.use('/api/sales', this.saleRouter.getRouter());
    this.app.use('/api/profile', this.profileRouter.getRouter());
    this.app.use('/api/users', this.userRouter.getRouter());

    // Fallback 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
      });
    });
  }

  configureErrorHandling() {
    this.app.use(this.errorHandlerMiddleware.handle());
  }

  getExpressApp() {
    return this.app;
  }
}

module.exports = App;

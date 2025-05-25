import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authenticate'; // Importar middleware de autenticação

const router = Router();
const authController = new AuthController();

// Rota para login (pública)
router.post('/login', authController.login);

// Rota para obter informações do usuário logado (protegida por autenticação)
// Exemplo: GET /api/auth/me
router.get('/me', authenticateToken, authController.getMe);

// Futuramente, pode adicionar rotas para registro, refresh token, etc.

export default router;


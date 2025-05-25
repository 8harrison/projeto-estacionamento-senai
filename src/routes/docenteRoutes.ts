import { Router } from 'express';
import { DocenteController } from '../controllers/DocenteController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const docenteController = new DocenteController();

// Aplicar autenticação a todas as rotas de docentes
router.use(authenticateToken);

// Rotas CRUD para Docentes
// Somente administradores podem criar, atualizar ou deletar docentes
router.post('/', authorizeRole('administrador'), docenteController.create);
router.get('/', authorizeRole(['administrador', 'porteiro']), docenteController.findAll); // Porteiros podem listar
router.get('/:id', authorizeRole(['administrador', 'porteiro']), docenteController.findById); // Porteiros podem ver detalhes
router.put('/:id', authorizeRole('administrador'), docenteController.update);
router.delete('/:id', authorizeRole('administrador'), docenteController.delete);

export default router;


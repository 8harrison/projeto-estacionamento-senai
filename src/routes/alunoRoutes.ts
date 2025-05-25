import { Router } from 'express';
import { AlunoController } from '../controllers/AlunoController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const alunoController = new AlunoController();

// Aplicar autenticação a todas as rotas de alunos
router.use(authenticateToken);

// Rotas CRUD para Alunos
// Somente administradores podem criar, atualizar ou deletar alunos
router.post('/', authorizeRole('administrador'), alunoController.create);
router.get('/', authorizeRole(['administrador', 'porteiro']), alunoController.findAll); // Porteiros podem listar
router.get('/:id', authorizeRole(['administrador', 'porteiro']), alunoController.findById); // Porteiros podem ver detalhes
router.put('/:id', authorizeRole('administrador'), alunoController.update);
router.delete('/:id', authorizeRole('administrador'), alunoController.delete);

export default router;


import { Router } from 'express';
import { VeiculoController } from '../controllers/VeiculoController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const veiculoController = new VeiculoController();

// Aplicar autenticação a todas as rotas de veículos
router.use(authenticateToken);

// Rotas CRUD para Veículos
// Administradores podem gerenciar todos os veículos.
// Porteiros podem listar e visualizar detalhes.
router.post('/', authorizeRole('administrador'), veiculoController.create);
router.get('/', authorizeRole(['administrador', 'porteiro']), veiculoController.findAll);
router.get('/:id', authorizeRole(['administrador', 'porteiro']), veiculoController.findById);
router.put('/:id', authorizeRole('administrador'), veiculoController.update);
router.delete('/:id', authorizeRole('administrador'), veiculoController.delete);

export default router;


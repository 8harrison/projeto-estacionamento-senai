import { Router } from 'express';
import { VagaController } from '../controllers/VagaController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const vagaController = new VagaController();

// Aplicar autenticação a todas as rotas de vagas
router.use(authenticateToken);

// Rotas CRUD para Vagas
// Administradores podem gerenciar (criar, atualizar, deletar) vagas.
// Porteiros podem listar todas, listar disponíveis e ver detalhes.

router.post('/', authorizeRole('administrador'), vagaController.create);

// GET /vagas - Lista todas as vagas (com filtros opcionais ?ocupada=true/false&tipo=Comum)
router.get('/', authorizeRole(['administrador', 'porteiro']), vagaController.findAll);

// GET /vagas/disponiveis - Lista vagas não ocupadas (filtro opcional ?tipo=Comum)
router.get('/disponiveis', authorizeRole(['administrador', 'porteiro']), vagaController.findAvailable);

router.get('/:id', authorizeRole(['administrador', 'porteiro']), vagaController.findById);
router.put('/:id', authorizeRole('administrador'), vagaController.update);
router.delete('/:id', authorizeRole('administrador'), vagaController.delete);

export default router;


import { Router } from 'express';
import { EstacionamentoController } from '../controllers/EstacionamentoController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const estacionamentoController = new EstacionamentoController();

// Aplicar autenticação a todas as rotas de estacionamento
router.use(authenticateToken);

// Rotas para Estacionamento
// Porteiros e Administradores podem registrar entrada/saída, listar ativos e ver detalhes.
// Administradores podem ver o histórico completo.

// POST /estacionamentos - Registrar entrada
router.post('/', authorizeRole(['administrador', 'porteiro']), estacionamentoController.registrarEntrada);

// PATCH /estacionamentos/:id/saida - Registrar saída
router.patch('/:id/saida', authorizeRole(['administrador', 'porteiro']), estacionamentoController.registrarSaida);

// GET /estacionamentos - Listar histórico completo (somente admin? ou ambos?)
// Vamos permitir ambos por enquanto, mas pode ser restrito a admin se necessário.
router.get('/', authorizeRole(['administrador', 'porteiro']), estacionamentoController.findAll);

// GET /estacionamentos/ativos - Listar estacionamentos ativos (sem saída)
router.get('/ativos', authorizeRole(['administrador', 'porteiro']), estacionamentoController.findActive);

// GET /estacionamentos/:id - Ver detalhes de um registro específico
router.get('/:id', authorizeRole(['administrador', 'porteiro']), estacionamentoController.findById);

export default router;


import { Router } from 'express';
import { VagaController } from '../controllers/VagaController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const vagaController = new VagaController();

/**
 * @swagger
 * tags:
 *   name: Vagas
 *   description: Gerenciamento de vagas do estacionamento
 */

// Aplicar autenticação a todas as rotas de vaga
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Vaga:
 *       type: object
 *       required:
 *         - numero
 *         - tipo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado da vaga.
 *           readOnly: true
 *           example: 1
 *         numero:
 *           type: string
 *           description: Número único de identificação da vaga.
 *           maxLength: 10
 *           example: "A01"
 *         tipo:
 *           type: string
 *           description: Tipo da vaga.
 *           enum: [Comum, Prioritária, Docente]
 *           example: "Comum"
 *         ocupada:
 *           type: boolean
 *           description: Indica se a vaga está atualmente ocupada.
 *           default: false
 *           readOnly: true # Status gerenciado pela lógica de entrada/saída
 *           example: false
 *         ativa:
 *           type: boolean
 *           description: Indica se o cadastro da vaga está ativo.
 *           default: true
 *           readOnly: true
 *           example: true
 *         data_cadastro:
 *           type: string
 *           format: date
 *           description: Data de cadastro da vaga.
 *           readOnly: true
 *           example: "2024-05-26"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp de criação do registro.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp da última atualização do registro.
 *           readOnly: true
 *     VagaInput:
 *       type: object
 *       required:
 *         - numero
 *         - tipo
 *       properties:
 *         numero:
 *           type: string
 *           description: Número único de identificação da vaga.
 *           maxLength: 10
 *           example: "A01"
 *         tipo:
 *           type: string
 *           description: Tipo da vaga.
 *           enum: [Comum, Prioritária, Docente]
 *           example: "Comum"
 */

/**
 * @swagger
 * /vagas:
 *   post:
 *     summary: Cria uma nova vaga
 *     tags: [Vagas]
 *     description: Endpoint para adicionar uma nova vaga ao sistema. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VagaInput'
 *     responses:
 *       201:
 *         description: Vaga criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vaga'
 *       400:
 *         description: Dados inválidos fornecidos.
 *       401:
 *         description: Não autorizado (token inválido/ausente).
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       409:
 *         description: Conflito (número da vaga já existe).
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/', authorizeRole(['administrador']), vagaController.create);

/**
 * @swagger
 * /vagas:
 *   get:
 *     summary: Lista todas as vagas
 *     tags: [Vagas]
 *     description: Retorna uma lista de todas as vagas cadastradas, com filtros opcionais. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ocupada
 *         schema:
 *           type: boolean
 *         description: Filtrar por vagas ocupadas (true) ou desocupadas (false).
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Comum, Prioritária, Docente]
 *         description: Filtrar por tipo de vaga.
 *     responses:
 *       200:
 *         description: Lista de vagas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vaga'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', authorizeRole(['administrador', 'porteiro']), vagaController.findAll);

/**
 * @swagger
 * /vagas/disponiveis:
 *   get:
 *     summary: Lista vagas disponíveis
 *     tags: [Vagas]
 *     description: Retorna uma lista de vagas que não estão ocupadas, opcionalmente filtradas por tipo. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Comum, Prioritária, Docente]
 *         description: Filtrar por tipo de vaga disponível.
 *     responses:
 *       200:
 *         description: Lista de vagas disponíveis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vaga'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/disponiveis', authorizeRole(['administrador', 'porteiro']), vagaController.findAvailable);

/**
 * @swagger
 * /vagas/{id}:
 *   get:
 *     summary: Busca uma vaga pelo ID
 *     tags: [Vagas]
 *     description: Retorna os detalhes de uma vaga específica. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico da vaga a ser buscada.
 *     responses:
 *       200:
 *         description: Detalhes da vaga.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vaga'
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Vaga não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id', authorizeRole(['administrador', 'porteiro']), vagaController.findById);

/**
 * @swagger
 * /vagas/{id}:
 *   put:
 *     summary: Atualiza uma vaga existente
 *     tags: [Vagas]
 *     description: Atualiza os dados de uma vaga existente (número, tipo). O status 'ocupada' não pode ser alterado por esta rota. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico da vaga a ser atualizada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VagaInput' # Reutiliza o schema de input
 *     responses:
 *       200:
 *         description: Vaga atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vaga'
 *       400:
 *         description: ID inválido ou dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Vaga não encontrada.
 *       409:
 *         description: Conflito (número da vaga já existe para outra vaga).
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id', authorizeRole(['administrador']), vagaController.update);

/**
 * @swagger
 * /vagas/{id}:
 *   delete:
 *     summary: Deleta (inativa) uma vaga
 *     tags: [Vagas]
 *     description: Marca uma vaga como inativa no sistema. Apenas administradores podem realizar esta ação. A vaga não pode estar ocupada.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico da vaga a ser inativada.
 *     responses:
 *       204:
 *         description: Vaga inativada com sucesso (sem conteúdo no corpo da resposta).
 *       400:
 *         description: ID inválido ou vaga está ocupada.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Vaga não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete('/:id', authorizeRole(['administrador']), vagaController.delete);

export default router;


import { Router } from 'express';
import { EstacionamentoController } from '../controllers/EstacionamentoController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const estacionamentoController = new EstacionamentoController();

/**
 * @swagger
 * tags:
 *   name: Estacionamento
 *   description: Operações de registro de entrada e saída de veículos
 */

// Aplicar autenticação a todas as rotas de estacionamento
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Estacionamento:
 *       type: object
 *       required:
 *         - veiculoId
 *         - vagaId
 *         - data_entrada
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do registro de estacionamento.
 *           readOnly: true
 *           example: 1
 *         veiculoId:
 *           type: integer
 *           description: ID do veículo que estacionou.
 *           example: 1
 *         vagaId:
 *           type: integer
 *           description: ID da vaga utilizada.
 *           example: 5
 *         data_entrada:
 *           type: string
 *           format: date-time
 *           description: Timestamp da entrada do veículo.
 *           readOnly: true
 *           example: "2024-05-26T10:00:00Z"
 *         data_saida:
 *           type: string
 *           format: date-time
 *           description: Timestamp da saída do veículo (null se ainda estacionado).
 *           nullable: true
 *           readOnly: true
 *           example: null
 *         valor_cobrado:
 *           type: number
 *           format: float
 *           description: Valor cobrado pelo período estacionado (calculado na saída).
 *           nullable: true
 *           readOnly: true
 *           example: 15.50
 *         valor_pago:
 *           type: number
 *           format: float
 *           description: Valor efetivamente pago pelo usuário na saída.
 *           nullable: true
 *           example: 15.50
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
 *     EstacionamentoEntradaInput:
 *       type: object
 *       required:
 *         - veiculoId
 *         - vagaId
 *       properties:
 *         veiculoId:
 *           type: integer
 *           description: ID do veículo que está entrando.
 *           example: 1
 *         vagaId:
 *           type: integer
 *           description: ID da vaga que será ocupada.
 *           example: 5
 *     EstacionamentoSaidaInput:
 *       type: object
 *       properties:
 *         valorPago:
 *           type: number
 *           format: float
 *           description: Valor pago pelo usuário (opcional, pode ser calculado automaticamente ou apenas registrado).
 *           nullable: true
 *           example: 15.50
 */

/**
 * @swagger
 * /estacionamentos/entrada:
 *   post:
 *     summary: Registra a entrada de um veículo
 *     tags: [Estacionamento]
 *     description: Cria um novo registro de estacionamento, marcando a vaga como ocupada. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstacionamentoEntradaInput'
 *     responses:
 *       201:
 *         description: Entrada registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estacionamento'
 *       400:
 *         description: Dados inválidos (veiculoId/vagaId faltando ou inválidos, veículo/vaga não encontrados, vaga já ocupada, veículo já estacionado).
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/entrada', authorizeRole(['administrador', 'porteiro', 'master']), estacionamentoController.registrarEntrada);

/**
 * @swagger
 * /estacionamentos/saida/{id}:
 *   patch:
 *     summary: Registra a saída de um veículo
 *     tags: [Estacionamento]
 *     description: Atualiza um registro de estacionamento existente, marcando a data/hora de saída, calculando o valor (se aplicável) e desocupando a vaga. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do registro de estacionamento a ser finalizado.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstacionamentoSaidaInput' # Corpo opcional
 *     responses:
 *       200:
 *         description: Saída registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estacionamento'
 *       400:
 *         description: ID inválido ou valorPago inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Registro de estacionamento não encontrado ou saída já registrada.
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch('/saida/:id', authorizeRole(['administrador', 'porteiro', 'master']), estacionamentoController.registrarSaida);

/**
 * @swagger
 * /estacionamentos:
 *   get:
 *     summary: Lista todos os registros de estacionamento
 *     tags: [Estacionamento]
 *     description: Retorna uma lista de todos os registros de entrada e saída. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: veiculoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do veículo.
 *       - in: query
 *         name: vagaId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID da vaga.
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de entrada (a partir de YYYY-MM-DD).
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de entrada (até YYYY-MM-DD).
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por registros ativos (saída ainda não registrada).
 *     responses:
 *       200:
 *         description: Lista de registros de estacionamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Estacionamento'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', authorizeRole(['administrador', 'porteiro', 'master']), estacionamentoController.findAll);

/**
 * @swagger
 * /estacionamentos/ativos:
 *   get:
 *     summary: Lista registros de estacionamento ativos
 *     tags: [Estacionamento]
 *     description: Retorna uma lista de registros onde a saída ainda não foi registrada (data_saida é null). Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros ativos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Estacionamento'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/ativos', authorizeRole(['administrador', 'porteiro', 'master']), estacionamentoController.findActive);

/**
 * @swagger
 * /estacionamentos/{id}:
 *   get:
 *     summary: Busca um registro de estacionamento pelo ID
 *     tags: [Estacionamento]
 *     description: Retorna os detalhes de um registro específico de entrada/saída. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do registro de estacionamento.
 *     responses:
 *       200:
 *         description: Detalhes do registro.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estacionamento'
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Registro não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id', authorizeRole(['administrador', 'porteiro', 'master']), estacionamentoController.findById);

export default router;


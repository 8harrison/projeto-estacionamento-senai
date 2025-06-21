import { Router } from 'express';
import { AlunoController } from '../controllers/AlunoController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const alunoController = new AlunoController();

/**
 * @swagger
 * tags:
 *   name: Alunos
 *   description: Gerenciamento de alunos
 */

// Aplicar autenticação a todas as rotas de aluno
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Aluno:
 *       type: object
 *       required:
 *         - matricula
 *         - nome
 *         - turno
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do aluno.
 *           readOnly: true
 *           example: 1
 *         matricula:
 *           type: string
 *           description: Matrícula única do aluno.
 *           maxLength: 20
 *           example: "R20241234"
 *         nome:
 *           type: string
 *           description: Nome completo do aluno.
 *           maxLength: 100
 *           example: "João da Silva"
 *         curso:
 *           type: string
 *           description: Curso do aluno.
 *           maxLength: 50
 *           nullable: true
 *           example: "Engenharia de Software"
 *         turno:
 *           type: string
 *           description: Turno do aluno.
 *           enum: [Manhã, Tarde, Noite]
 *           example: "Noite"
 *         telefone:
 *           type: string
 *           description: Telefone de contato do aluno.
 *           maxLength: 15
 *           nullable: true
 *           example: "(11) 98765-4321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contato do aluno.
 *           maxLength: 100
 *           nullable: true
 *           example: "joao.silva@email.com"
 *         ativo:
 *           type: boolean
 *           description: Indica se o cadastro do aluno está ativo.
 *           default: true
 *           readOnly: true
 *           example: true
 *         data_cadastro:
 *           type: string
 *           format: date
 *           description: Data de cadastro do aluno.
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
 *         veiculos: # Adicionado para mostrar veículos associados
 *           type: array
 *           description: Lista de veículos associados a este aluno.
 *           readOnly: true
 *           items:
 *             $ref: '#/components/schemas/Veiculo' # Referencia o schema Veiculo (definido em veiculoRoutes.ts ou globalmente)
 *     AlunoInput:
 *       type: object
 *       required:
 *         - matricula
 *         - nome
 *         - turno
 *       properties:
 *         matricula:
 *           type: string
 *           description: Matrícula única do aluno.
 *           maxLength: 20
 *           example: "R20241234"
 *         nome:
 *           type: string
 *           description: Nome completo do aluno.
 *           maxLength: 100
 *           example: "João da Silva"
 *         curso:
 *           type: string
 *           description: Curso do aluno.
 *           maxLength: 50
 *           nullable: true
 *           example: "Engenharia de Software"
 *         turno:
 *           type: string
 *           description: Turno do aluno.
 *           enum: [Manhã, Tarde, Noite]
 *           example: "Noite"
 *         telefone:
 *           type: string
 *           description: Telefone de contato do aluno.
 *           maxLength: 15
 *           nullable: true
 *           example: "(11) 98765-4321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contato do aluno.
 *           maxLength: 100
 *           nullable: true
 *           example: "joao.silva@email.com"
 */

/**
 * @swagger
 * /alunos:
 *   post:
 *     summary: Cria um novo aluno
 *     tags: [Alunos]
 *     description: Endpoint para adicionar um novo aluno ao sistema. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoInput'
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno' # Retorna o aluno criado (sem veículos inicialmente)
 *       400:
 *         description: Dados inválidos fornecidos.
 *       401:
 *         description: Não autorizado (token inválido/ausente).
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       409:
 *         description: Conflito (matrícula já existe).
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/', authorizeRole(['administrador', 'master']), alunoController.create);

/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos
 *     tags: [Alunos]
 *     description: Retorna uma lista de todos os alunos cadastrados, incluindo seus veículos. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alunos com seus veículos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aluno'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', authorizeRole(['administrador', 'porteiro', 'master']), alunoController.findAll);

/**
 * @swagger
 * /alunos/{id}:
 *   get:
 *     summary: Busca um aluno pelo ID
 *     tags: [Alunos]
 *     description: Retorna os detalhes de um aluno específico, incluindo seus veículos. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do aluno a ser buscado.
 *     responses:
 *       200:
 *         description: Detalhes do aluno com seus veículos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Aluno não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id', authorizeRole(['administrador', 'porteiro', 'master']), alunoController.findById);

/**
 * @swagger
 * /alunos/{id}:
 *   put:
 *     summary: Atualiza um aluno existente
 *     tags: [Alunos]
 *     description: Atualiza os dados de um aluno existente. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do aluno a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoInput' # Reutiliza o schema de input
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno' # Retorna o aluno atualizado (pode não incluir veículos aqui, use GET /alunos/{id} para ver)
 *       400:
 *         description: ID inválido ou dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Aluno não encontrado.
 *       409:
 *         description: Conflito (matrícula já existe para outro aluno).
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id', authorizeRole(['administrador', 'master']), alunoController.update);

/**
 * @swagger
 * /alunos/{id}:
 *   delete:
 *     summary: Deleta (inativa) um aluno
 *     tags: [Alunos]
 *     description: Marca um aluno como inativo no sistema. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do aluno a ser inativado.
 *     responses:
 *       204:
 *         description: Aluno inativado com sucesso (sem conteúdo no corpo da resposta).
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Aluno não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete('/:id', authorizeRole(['administrador', 'master']), alunoController.delete);

export default router;


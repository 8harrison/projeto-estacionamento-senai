import { Router } from 'express';
import { DocenteController } from '../controllers/DocenteController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const docenteController = new DocenteController();

/**
 * @swagger
 * tags:
 *   name: Docentes
 *   description: Gerenciamento de docentes
 */

// Aplicar autenticação a todas as rotas de docente
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Docente:
 *       type: object
 *       required:
 *         - matricula
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do docente.
 *           readOnly: true
 *           example: 1
 *         matricula:
 *           type: string
 *           description: Matrícula única do docente.
 *           maxLength: 20
 *           example: "P2024001"
 *         nome:
 *           type: string
 *           description: Nome completo do docente.
 *           maxLength: 100
 *           example: "Maria Oliveira"
 *         departamento:
 *           type: string
 *           description: Departamento do docente.
 *           maxLength: 50
 *           nullable: true
 *           example: "Ciência da Computação"
 *         telefone:
 *           type: string
 *           description: Telefone de contato do docente.
 *           maxLength: 15
 *           nullable: true
 *           example: "(11) 91234-5678"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contato do docente.
 *           maxLength: 100
 *           nullable: true
 *           example: "maria.oliveira@email.com"
 *         ativo:
 *           type: boolean
 *           description: Indica se o cadastro do docente está ativo.
 *           default: true
 *           readOnly: true
 *           example: true
 *         data_cadastro:
 *           type: string
 *           format: date
 *           description: Data de cadastro do docente.
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
 *           description: Lista de veículos associados a este docente.
 *           readOnly: true
 *           items:
 *             $ref: '#/components/schemas/Veiculo' # Referencia o schema Veiculo
 *     DocenteInput:
 *       type: object
 *       required:
 *         - matricula
 *         - nome
 *       properties:
 *         matricula:
 *           type: string
 *           description: Matrícula única do docente.
 *           maxLength: 20
 *           example: "P2024001"
 *         nome:
 *           type: string
 *           description: Nome completo do docente.
 *           maxLength: 100
 *           example: "Maria Oliveira"
 *         departamento:
 *           type: string
 *           description: Departamento do docente.
 *           maxLength: 50
 *           nullable: true
 *           example: "Ciência da Computação"
 *         telefone:
 *           type: string
 *           description: Telefone de contato do docente.
 *           maxLength: 15
 *           nullable: true
 *           example: "(11) 91234-5678"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contato do docente.
 *           maxLength: 100
 *           nullable: true
 *           example: "maria.oliveira@email.com"
 */

/**
 * @swagger
 * /docentes:
 *   post:
 *     summary: Cria um novo docente
 *     tags: [Docentes]
 *     description: Endpoint para adicionar um novo docente ao sistema. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocenteInput'
 *     responses:
 *       201:
 *         description: Docente criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docente' # Retorna o docente criado
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
router.post('/', authorizeRole(['administrador', 'master']), docenteController.create);

/**
 * @swagger
 * /docentes:
 *   get:
 *     summary: Lista todos os docentes
 *     tags: [Docentes]
 *     description: Retorna uma lista de todos os docentes cadastrados, incluindo seus veículos. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de docentes com seus veículos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Docente'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', authorizeRole(['administrador', 'porteiro', 'master']), docenteController.findAll);

/**
 * @swagger
 * /docentes/{id}:
 *   get:
 *     summary: Busca um docente pelo ID
 *     tags: [Docentes]
 *     description: Retorna os detalhes de um docente específico, incluindo seus veículos. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do docente a ser buscado.
 *     responses:
 *       200:
 *         description: Detalhes do docente com seus veículos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docente'
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Docente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id', authorizeRole(['administrador', 'porteiro', 'master']), docenteController.findById);

/**
 * @swagger
 * /docentes/{id}:
 *   put:
 *     summary: Atualiza um docente existente
 *     tags: [Docentes]
 *     description: Atualiza os dados de um docente existente. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do docente a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocenteInput' # Reutiliza o schema de input
 *     responses:
 *       200:
 *         description: Docente atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docente' # Retorna o docente atualizado
 *       400:
 *         description: ID inválido ou dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Docente não encontrado.
 *       409:
 *         description: Conflito (matrícula já existe para outro docente).
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id', authorizeRole(['administrador', 'master']), docenteController.update);

/**
 * @swagger
 * /docentes/{id}:
 *   delete:
 *     summary: Deleta (inativa) um docente
 *     tags: [Docentes]
 *     description: Marca um docente como inativo no sistema. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do docente a ser inativado.
 *     responses:
 *       204:
 *         description: Docente inativado com sucesso (sem conteúdo no corpo da resposta).
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Docente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete('/:id', authorizeRole(['administrador', 'master']), docenteController.delete);

export default router;


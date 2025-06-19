import { Router } from 'express';
import { VeiculoController } from '../controllers/VeiculoController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const veiculoController = new VeiculoController();

/**
 * @swagger
 * tags:
 *   name: Veículos
 *   description: Gerenciamento de veículos dos alunos e docentes
 */

// Aplicar autenticação a todas as rotas de veículo
// router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     ProprietarioResumido:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "João da Silva"
 *         matricula:
 *           type: string
 *           example: "R20241234"
 *     Veiculo:
 *       type: object
 *       required:
 *         - placa
 *         - modelo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do veículo.
 *           readOnly: true
 *           example: 1
 *         placa:
 *           type: string
 *           description: Placa única do veículo (formato Mercosul ou antigo).
 *           maxLength: 10
 *           example: "BRA2E19"
 *         modelo:
 *           type: string
 *           description: Modelo do veículo.
 *           maxLength: 50
 *           example: "Fiat Mobi"
 *         cor:
 *           type: string
 *           description: Cor do veículo.
 *           maxLength: 30
 *           nullable: true
 *           example: "Branco"
 *         alunoId:
 *           type: integer
 *           description: ID do aluno proprietário (se aplicável).
 *           nullable: true
 *           example: 1
 *         docenteId:
 *           type: integer
 *           description: ID do docente proprietário (se aplicável).
 *           nullable: true
 *           example: null
 *         ativo:
 *           type: boolean
 *           description: Indica se o cadastro do veículo está ativo.
 *           default: true
 *           readOnly: true
 *           example: true
 *         data_cadastro:
 *           type: string
 *           format: date
 *           description: Data de cadastro do veículo.
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
 *         aluno: # Adicionado para mostrar detalhes do proprietário
 *           $ref: '#/components/schemas/ProprietarioResumido'
 *           description: Detalhes do aluno proprietário (presente se alunoId não for nulo).
 *           readOnly: true
 *           nullable: true
 *         docente: # Adicionado para mostrar detalhes do proprietário
 *           $ref: '#/components/schemas/ProprietarioResumido'
 *           description: Detalhes do docente proprietário (presente se docenteId não for nulo).
 *           readOnly: true
 *           nullable: true
 *     VeiculoInput:
 *       type: object
 *       required:
 *         - placa
 *         - modelo
 *       properties:
 *         placa:
 *           type: string
 *           description: Placa única do veículo (formato Mercosul ou antigo).
 *           maxLength: 10
 *           example: "BRA2E19"
 *         modelo:
 *           type: string
 *           description: Modelo do veículo.
 *           maxLength: 50
 *           example: "Fiat Mobi"
 *         cor:
 *           type: string
 *           description: Cor do veículo.
 *           maxLength: 30
 *           nullable: true
 *           example: "Branco"
 *         alunoId:
 *           type: integer
 *           description: ID do aluno proprietário. Deve ser fornecido se docenteId não for.
 *           nullable: true
 *           example: 1
 *         docenteId:
 *           type: integer
 *           description: ID do docente proprietário. Deve ser fornecido se alunoId não for.
 *           nullable: true
 *           example: null
 *       oneOf:
 *         - required: [alunoId]
 *         - required: [docenteId]
 *       example:
 *         placa: "ABC1D23"
 *         modelo: "Honda Civic"
 *         cor: "Preto"
 *         alunoId: 2
 */

/**
 * @swagger
 * /veiculos:
 *   post:
 *     summary: Cria um novo veículo
 *     tags: [Veículos]
 *     description: Endpoint para adicionar um novo veículo ao sistema, associado a um aluno ou docente. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VeiculoInput'
 *     responses:
 *       201:
 *         description: Veículo criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo' # Retorna o veículo criado (sem proprietário incluído por padrão)
 *       400:
 *         description: Dados inválidos (placa/modelo faltando, proprietário inválido ou não encontrado).
 *       401:
 *         description: Não autorizado (token inválido/ausente).
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       409:
 *         description: Conflito (placa já existe).
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/', authenticateToken, authorizeRole(['administrador']), veiculoController.create);

/**
 * @swagger
 * /veiculos:
 *   get:
 *     summary: Lista todos os veículos
 *     tags: [Veículos]
 *     description: Retorna uma lista de todos os veículos cadastrados, incluindo detalhes resumidos do proprietário. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de veículos com proprietários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Veiculo'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', authenticateToken, authorizeRole(['administrador', 'porteiro']), veiculoController.findAll);

/**
 * @swagger
 * /veiculos/buscar:
 *   get:
 *     summary: Busca veículos por placa ou modelo
 *     tags: [Veículos]
 *     description: Retorna uma lista de veículos que correspondem ao termo de busca (placa ou modelo), incluindo detalhes resumidos do proprietário. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: termo
 *         schema:
 *           type: string
 *         required: true
 *         description: Termo de busca para placa ou modelo (busca parcial).
 *         example: "BRA2E"
 *     responses:
 *       200:
 *         description: Lista de veículos encontrados com proprietários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Veiculo'
 *       400:
 *         description: Termo de busca não fornecido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/buscar', veiculoController.findByPlacaOrModelo);

/**
 * @swagger
 * /veiculos/{id}:
 *   get:
 *     summary: Busca um veículo pelo ID
 *     tags: [Veículos]
 *     description: Retorna os detalhes de um veículo específico, incluindo detalhes resumidos do proprietário. Acessível por administradores e porteiros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do veículo a ser buscado.
 *     responses:
 *       200:
 *         description: Detalhes do veículo com proprietário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo'
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Veículo não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id',authenticateToken, authorizeRole(['administrador', 'porteiro']), veiculoController.findById);

/**
 * @swagger
 * /veiculos/{id}:
 *   put:
 *     summary: Atualiza um veículo existente
 *     tags: [Veículos]
 *     description: Atualiza os dados de um veículo existente. Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do veículo a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VeiculoInput' # Reutiliza o schema de input
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo' # Retorna o veículo atualizado com proprietário
 *       400:
 *         description: ID inválido, dados inválidos ou proprietário inválido/não encontrado.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Veículo não encontrado.
 *       409:
 *         description: Conflito (placa já existe para outro veículo).
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id',authenticateToken, authorizeRole(['administrador']), veiculoController.update);

/**
 * @swagger
 * /veiculos/{id}:
 *   delete:
 *     summary: Deleta (inativa) um veículo
 *     tags: [Veículos]
 *     description: Marca um veículo como inativo no sistema (ou deleta permanentemente, verificar implementação). Apenas administradores podem realizar esta ação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico do veículo a ser deletado/inativado.
 *     responses:
 *       204:
 *         description: Veículo deletado/inativado com sucesso (sem conteúdo no corpo da resposta).
 *       400:
 *         description: ID inválido ou veículo possui registro de estacionamento ativo (se aplicável).
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       404:
 *         description: Veículo não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete('/:id',authenticateToken, authorizeRole(['administrador']), veiculoController.delete);

export default router;


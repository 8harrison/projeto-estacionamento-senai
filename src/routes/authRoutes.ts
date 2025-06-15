import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorize'; // Importar authorizeRole

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para login, registro e gerenciamento de sessão
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário.
 *           example: admin@exemplo.com
 *         senha:
 *           type: string
 *           format: password
 *           description: Senha do usuário.
 *           example: senha123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token JWT para autenticação.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxvLmNvbSIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Administrador"
 *             email:
 *               type: string
 *               format: email
 *               example: admin@exemplo.com
 *             role:
 *               type: string
 *               enum: [administrador, porteiro]
 *               example: administrador
 *     RegisterUserInput:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - role
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do novo usuário.
 *           example: "Novo Porteiro"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do novo usuário (deve ser único).
 *           example: porteiro2@exemplo.com
 *         senha:
 *           type: string
 *           format: password
 *           description: Senha para o novo usuário.
 *           example: senhaPorteiro456
 *         role:
 *           type: string
 *           description: Papel do novo usuário.
 *           enum: [administrador, porteiro]
 *           example: porteiro
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nome:
 *           type: string
 *           example: "Novo Porteiro"
 *         email:
 *           type: string
 *           format: email
 *           example: porteiro2@exemplo.com
 *         role:
 *           type: string
 *           enum: [administrador, porteiro]
 *           example: porteiro
 *         ativo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Autenticação]
 *     description: Autentica um usuário (administrador ou porteiro) com email e senha, retornando um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Requisição inválida (email ou senha faltando).
 *       401:
 *         description: Credenciais inválidas ou usuário inativo.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário (administrador ou porteiro)
 *     tags: [Autenticação]
 *     description: Cria um novo usuário com role 'administrador' ou 'porteiro'. Apenas usuários autenticados com role 'administrador' podem acessar este endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserInput'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos (campos faltando, email já existe, role inválida).
 *       401:
 *         description: Não autorizado (token inválido/ausente).
 *       403:
 *         description: Acesso negado (usuário não é administrador).
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/register', authenticateToken, authorizeRole(['administrador']), authController.register);

router.get('/usuarios', authenticateToken, authorizeRole(['administrador']), authController.getAll)


// Rota para verificar o token atual (exemplo)
// router.get('/me', authenticateToken, authController.getMe); // Descomente se precisar desta rota

export default router;

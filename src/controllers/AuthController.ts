import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UsuarioCreationAttributes } from '../models/Usuario'; // Importar interface

// Função wrapper para lidar com erros assíncronos nos controllers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export class AuthController {
  private authService = new AuthService();

  // Método para login
  public login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      return;
    }

    try {
      const result = await this.authService.login(email, senha);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(401).json({ message: 'Credenciais inválidas ou usuário inativo.' });
      }
    } catch (error: any) {
      // Logar o erro real no servidor
      console.error("Erro no controller de login:", error.message);
      // Enviar uma resposta genérica para o cliente
      res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
    }
  });

  // Método para registrar novo usuário (Admin/Porteiro)
  public register = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userData: UsuarioCreationAttributes = req.body;

    // Validação básica de entrada
    if (!userData.nome || !userData.email || !userData.senha || !userData.role) {
      res.status(400).json({ message: 'Nome, email, senha e role são obrigatórios.' });
      return;
    }

    try {
      const novoUsuario = await this.authService.registerUser(userData);
      res.status(201).json(novoUsuario);
    } catch (error: any) {
      console.error("Erro no controller de registro:", error.message);
      // Se o erro for de validação do serviço, repassar a mensagem
      if (error.message.includes('Erro:') || error.message.includes('Role inválida')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor ao tentar registrar usuário.' });
      }
    }
  });

  public getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarios = await this.authService.getAllUsers()

      res.status(200).json(usuarios)
      return
    } catch (e) {
      res.status(500).json({ message: 'Erro interno ao buscar usuários.' })
      return
    }
  })

  public getAllPorteiros = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarios = await this.authService.getAllPorteiros()

      res.status(200).json(usuarios)
      return
    } catch (e) {
      res.status(500).json({ message: 'Erro interno ao buscar usuários.' })
      return
    }
  })

  public updateUserAsPorteiro = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      // Adicionar validação dos dados de entrada (req.body) aqui
      const userData = req.body

      const userAtualizado = await this.authService.updateUserAsPorteiro(+id, userData)

      if (!userAtualizado) {
        res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
        return
      }
      res.status(200).json(userAtualizado);
      return
    } catch (error: any) {
      console.error('Erro no controller ao atualizar usuário:', error.message);
      if (error.message.includes('Já existe um registro')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
      return
    }
  })

  public updateUserAsAdm = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      // Adicionar validação dos dados de entrada (req.body) aqui
      const userData = req.body

      const userAtualizado = await this.authService.updateUserAsAdm(+id, userData)

      if (!userAtualizado) {
        res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
        return
      }
      res.status(200).json(userAtualizado);
      return
    } catch (error: any) {
      console.error('Erro no controller ao atualizar usuário:', error.message);
      if (error.message.includes('Já existe um registro')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
      return
    }
  })
}


import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.');
}

export class AuthService {
  public async login(email: string, senha: string): Promise<{ token: string; usuario: { id: number; nome: string; email: string; role: string } } | null> {
    try {
      const usuario = await Usuario.findOne({ where: { email: email, ativo: true } });

      if (!usuario) {
        console.log(`Tentativa de login falhou: Usuário não encontrado para o email ${email}`);
        return null; // Usuário não encontrado ou inativo
      }

      const senhaValida = await usuario.checkPassword(senha);

      if (!senhaValida) {
        console.log(`Tentativa de login falhou: Senha inválida para o email ${email}`);
        return null; // Senha incorreta
      }

      // Gerar o token JWT
      const payload = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora

      console.log(`Login bem-sucedido para o email ${email}`);
      return {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        },
      };
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      throw new Error('Erro interno ao tentar realizar o login.');
    }
  }

  // Futuramente, pode adicionar métodos para registro, recuperação de senha, etc.
}


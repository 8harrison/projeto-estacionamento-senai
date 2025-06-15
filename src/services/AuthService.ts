import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import { UsuarioAttributes, UsuarioCreationAttributes } from '../models/Usuario'; // Importar interfaces
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

  // Método para registrar novos usuários (Admin ou Porteiro)
  public async registerUser(data: UsuarioCreationAttributes): Promise<Omit<UsuarioAttributes, 'senha_hash'>> {
    try {
      // Validar role permitida
      if (data.role !== 'administrador' && data.role !== 'porteiro') {
        throw new Error('Role inválida. Permitido apenas \'administrador\' ou \'porteiro\'.');
      }

      // O hook beforeCreate no modelo Usuario já cuida do hash da senha
      const novoUsuario = await Usuario.create(data);

      // Retornar dados do usuário sem a senha
      const { senha_hash, ...usuarioSemSenha } = novoUsuario.get({ plain: true });
      return usuarioSemSenha;

    } catch (error: any) {
      console.error('Erro ao registrar novo usuário:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Email '${data.email}' já está em uso.`);
      }
      if (error.message.includes('Role inválida')) {
          throw new Error(error.message);
      }
      throw new Error('Erro no serviço ao registrar novo usuário.');
    }
  }

  public async getAllUsers(): Promise<Omit<UsuarioAttributes, 'senha_hash'>[]> {
    const users = await Usuario.findAll()
    return users.map(user => {
      const {senha_hash, ...usuario_sem_senha} = user.get({plain: true})
      return usuario_sem_senha
    })
  }
}


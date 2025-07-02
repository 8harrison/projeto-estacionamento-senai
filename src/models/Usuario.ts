import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

// Interface para atributos do Usuário
export interface UsuarioAttributes {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  role: 'porteiro' | 'administrador' | 'master';
  ativo: boolean;
}

// Interface para atributos de criação (senha é obrigatória na criação)
// Tornamos senha_hash opcional na criação, pois será gerado pelo hook
export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'ativo' | 'senha_hash'> {
  senha: string; // Senha em texto plano na criação
}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha_hash?: string;
  public role!: 'porteiro' | 'administrador' | 'master';
  public ativo!: boolean;

  // Atributo virtual para senha (não persistido)
  public senha?: string;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para verificar senha
  public async checkPassword(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

Usuario.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('porteiro', 'administrador', 'master'),
    allowNull: false,
    defaultValue: 'porteiro',
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: 'Usuarios', // Nome da tabela no banco
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario: Usuario) => {
      if (usuario.senha) { // 'senha' é um atributo virtual
        const salt = await bcrypt.genSalt(10);
        usuario.senha_hash = await bcrypt.hash(usuario.senha, salt);
      }
    },
    beforeUpdate: async (usuario: Usuario) => {
      // Se uma nova senha foi fornecida (via atributo virtual 'senha')
      if (usuario.senha) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha_hash = await bcrypt.hash(usuario.senha, salt);
      }
    },
  },
});

export default Usuario;


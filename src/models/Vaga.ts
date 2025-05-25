import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Estacionamento from './Estacionamento'; // Importar para associação

// Interface para atributos da Vaga
export interface VagaAttributes {
  id: number;
  numero: string;
  localizacao: string | null;
  tipo: 'Comum' | 'Prioritária' | 'Docente';
  ocupada: boolean;
}

// Interface para atributos de criação (id, ocupada são opcionais)
export interface VagaCreationAttributes extends Optional<VagaAttributes, 'id' | 'ocupada'> {}

class Vaga extends Model<VagaAttributes, VagaCreationAttributes> implements VagaAttributes {
  public id!: number;
  public numero!: string;
  public localizacao!: string | null;
  public tipo!: 'Comum' | 'Prioritária' | 'Docente';
  public ocupada!: boolean;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associação com Estacionamento (Uma Vaga pode ter muitos registros de Estacionamento)
  public readonly estacionamentos?: Estacionamento[];
}

Vaga.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'vaga_id', // Mapeia para o nome da coluna no SQL original
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  localizacao: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('Comum', 'Prioritária', 'Docente'),
    allowNull: false,
    defaultValue: 'Comum',
  },
  ocupada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'Vagas',
  timestamps: true, // Habilita createdAt e updatedAt
  // O campo data_atualizacao do SQL original é coberto pelo updatedAt do Sequelize
  underscored: true, // Usa snake_case para colunas geradas automaticamente
});

export default Vaga;


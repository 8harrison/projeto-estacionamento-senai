import { DataTypes, Model, Optional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Veiculo from './Veiculo';
import Vaga from './Vaga';

// Interface para atributos do Estacionamento
export interface EstacionamentoAttributes {
  id: number;
  veiculoId: ForeignKey<Veiculo['id']>;
  vagaId: ForeignKey<Vaga['id']>;
  data_entrada: Date;
  data_saida: Date | null;
  valor_pago: number | null;
}

// Interface para atributos de criação (id, data_saida, valor_pago são opcionais)
// data_entrada também é opcional na criação, pois tem defaultValue
export interface EstacionamentoCreationAttributes extends Optional<EstacionamentoAttributes, 'id' | 'data_entrada' | 'data_saida' | 'valor_pago'> {}

class Estacionamento extends Model<EstacionamentoAttributes, EstacionamentoCreationAttributes> implements EstacionamentoAttributes {
  public id!: number;
  public veiculoId!: ForeignKey<Veiculo['id']>;
  public vagaId!: ForeignKey<Vaga['id']>;
  public data_entrada!: Date;
  public data_saida!: Date | null;
  public valor_pago!: number | null;

  // Timestamps automáticos (não usados explicitamente aqui, mas habilitados por padrão)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associações (definidas posteriormente)
  public readonly veiculo?: Veiculo;
  public readonly vaga?: Vaga;

  // --- Hooks para simular Triggers --- 

  // Hook afterCreate: Atualiza a vaga para ocupada após um novo registro de estacionamento
  static async afterCreateHook(instance: Estacionamento) {
    try {
      const vaga = await Vaga.findByPk(instance.vagaId);
      if (vaga) {
        vaga.ocupada = true;
        await vaga.save();
        console.log(`Hook afterCreate: Vaga ${vaga.id} marcada como ocupada.`);
      } else {
        console.warn(`Hook afterCreate: Vaga ${instance.vagaId} não encontrada.`);
      }
    } catch (error) {
      console.error('Erro no hook afterCreate do Estacionamento:', error);
      // Considerar logar o erro ou lançá-lo dependendo da política de erros
    }
  }

  // Hook afterUpdate: Atualiza a vaga para desocupada quando data_saida é preenchida
  static async afterUpdateHook(instance: Estacionamento) {
    // Verifica se a data_saida foi definida nesta atualização
    // instance.changed() retorna false ou um array de chaves alteradas
    const changedKeys = instance.changed();
    if (changedKeys && Array.isArray(changedKeys) && changedKeys.includes('data_saida') && instance.data_saida !== null) {
      try {
        const vaga = await Vaga.findByPk(instance.vagaId);
        if (vaga) {
          vaga.ocupada = false;
          await vaga.save();
          console.log(`Hook afterUpdate: Vaga ${vaga.id} marcada como desocupada.`);
        } else {
          console.warn(`Hook afterUpdate: Vaga ${instance.vagaId} não encontrada.`);
        }
      } catch (error) {
        console.error('Erro no hook afterUpdate do Estacionamento:', error);
        // Considerar logar o erro ou lançá-lo
      }
    }
  }
}

Estacionamento.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'estacionamento_id', // Mapeia para o nome da coluna no SQL original
  },
  veiculoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Veiculos',
      key: 'veiculo_id',
    },
    field: 'veiculo_id', // Nome explícito da coluna FK
  },
  vagaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vagas',
      key: 'vaga_id',
    },
    field: 'vaga_id', // Nome explícito da coluna FK
  },
  data_entrada: {
    type: DataTypes.DATE, // DATETIME no SQL original
    allowNull: false,
    defaultValue: DataTypes.NOW, // Define a data/hora atual no momento da criação
  },
  data_saida: {
    type: DataTypes.DATE, // DATETIME no SQL original
    allowNull: true,
  },
  valor_pago: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'Estacionamentos',
  timestamps: true, // Habilita createdAt e updatedAt
  underscored: true,
  hooks: {
    afterCreate: Estacionamento.afterCreateHook,
    afterUpdate: Estacionamento.afterUpdateHook,
  },
});

export default Estacionamento;


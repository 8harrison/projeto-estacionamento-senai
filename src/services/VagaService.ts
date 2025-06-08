import { Vaga } from "../models";
import { VagaAttributes, VagaCreationAttributes } from "../models/Vaga";
import { FindOptions, Op, WhereOptions } from "sequelize";

export class VagaService {

  // Criar uma nova vaga
  public async create(data: VagaCreationAttributes): Promise<VagaAttributes> {
    try {
      const vaga = await Vaga.create(data);
      return vaga.get({ plain: true });
    } catch (error: any) {
      console.error("Erro ao criar vaga:", error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Número de vaga '${data.numero}' já existe.`);
      }
      throw new Error("Erro no serviço ao criar vaga.");
    }
  }

  // Buscar todas as vagas (com opção de filtro, ex: por tipo, status)
  public async findAll(options?: FindOptions<VagaAttributes>): Promise<VagaAttributes[]> {
    try {
      // Exemplo de filtro que pode ser passado via options:
      // options = { where: { ocupada: false, tipo: 'Comum' } }
      const vagas = await Vaga.findAll(options);
      return vagas.map(vaga => vaga.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar vagas:", error);
      throw new Error("Erro no serviço ao buscar vagas.");
    }
  }

  // Buscar uma vaga por ID
  public async findById(id: number): Promise<VagaAttributes | null> {
    try {
      const vaga = await Vaga.findByPk(id);
      return vaga ? vaga.get({ plain: true }) : null;
    } catch (error) {
      console.error(`Erro ao buscar vaga por ID ${id}:`, error);
      throw new Error("Erro no serviço ao buscar vaga por ID.");
    }
  }

  // Atualizar uma vaga por ID
  public async update(id: number, data: Partial<VagaAttributes>): Promise<VagaAttributes | null> {
    try {
      const vaga = await Vaga.findByPk(id);
      if (!vaga) {
        return null;
      }
      // Impedir alteração de 'ocupada' diretamente por aqui? A ocupação é controlada pelos estacionamentos.
      // Poderia permitir alterar 'localizacao', 'tipo', 'numero' (se não for unique?)
      delete data.id;

      await vaga.update(data);
      return vaga.get({ plain: true });
    } catch (error: any) {
      console.error(`Erro ao atualizar vaga por ID ${id}:`, error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Número de vaga '${data.numero}' já existe.`);
      }
      throw new Error("Erro no serviço ao atualizar vaga.");
    }
  }

  // Deletar uma vaga por ID
  public async delete(id: number): Promise<boolean> {
    try {
      const vaga = await Vaga.findByPk(id);
      if (!vaga) {
        return false;
      }
      // Verificar se a vaga está ocupada ou tem histórico de estacionamento?
      // Se houver FK constraint em Estacionamentos, a exclusão pode falhar.
      // Vamos assumir que a exclusão é permitida por enquanto.
      await vaga.destroy();
      return true;
    } catch (error: any) {
        console.error(`Erro ao deletar vaga por ID ${id}:`, error);
        // Tratar erro de FK constraint
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('Erro: Não é possível excluir a vaga pois existem registros de estacionamento associados a ela.');
        }
        throw new Error("Erro no serviço ao deletar vaga.");
    }
  }

  // Método específico para listar vagas disponíveis (não ocupadas)
  public async findAvailable(tipo?: 'Comum' | 'Prioritária' | 'Docente'): Promise<VagaAttributes[]> {
    try {
      const whereClause: WhereOptions<VagaAttributes> = { ocupada: false };
      if (tipo) {
        whereClause.tipo = tipo;
      }
      const vagasDisponiveis = await Vaga.findAll({ where: whereClause });
      return vagasDisponiveis.map(vaga => vaga.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar vagas disponíveis:", error);
      throw new Error("Erro no serviço ao buscar vagas disponíveis.");
    }
  }
}


import { Veiculo, Aluno, Docente } from "../models";
import { VeiculoAttributes, VeiculoCreationAttributes } from "../models/Veiculo";
import { FindOptions, Op, WhereOptions } from "sequelize"; // Importar Op e WhereOptions

export class VeiculoService {

  // Criar um novo veículo
  public async create(data: VeiculoCreationAttributes): Promise<VeiculoAttributes> {
    try {
      // Validação explícita de proprietário antes de tentar criar
      if ((!data.alunoId && !data.docenteId) || (data.alunoId && data.docenteId)) {
        throw new Error("O veículo deve pertencer a um Aluno ou a um Docente, mas não a ambos ou nenhum.");
      }
      // Verificar se o aluno ou docente existe e está ativo
      if (data.alunoId) {
        const aluno = await Aluno.findOne({ where: { id: data.alunoId, ativo: true } });
        if (!aluno) throw new Error(`Aluno com ID ${data.alunoId} não encontrado ou inativo.`);
      }
      if (data.docenteId) {
        const docente = await Docente.findOne({ where: { id: data.docenteId, ativo: true } });
        if (!docente) throw new Error(`Docente com ID ${data.docenteId} não encontrado ou inativo.`);
      }

      const veiculo = await Veiculo.create(data);
      return veiculo.get({ plain: true });
    } catch (error: any) {
      console.error("Erro ao criar veículo:", error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Placa '${data.placa}' já existe.`);
      }
      // Repassar a mensagem de erro de validação personalizada
      if (error.message.includes("Aluno com ID") || error.message.includes("Docente com ID") || error.message.includes("pertencer a um Aluno ou a um Docente")) {
          throw new Error(error.message);
      }
      throw new Error("Erro no serviço ao criar veículo.");
    }
  }

  // Buscar todos os veículos (com opção de filtro e inclusão de proprietário)
  public async findAll(options?: FindOptions<VeiculoAttributes>): Promise<VeiculoAttributes[]> {
    try {
      const defaultOptions: FindOptions<VeiculoAttributes> = {
        include: [
          { model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'matricula'] }, // Inclui dados básicos do aluno
          { model: Docente, as: 'docente', attributes: ['id', 'nome', 'matricula'] } // Inclui dados básicos do docente
        ]
      };
      // Mesclar where clauses se existirem
      const finalOptions = { 
        ...options, 
        include: defaultOptions.include, 
        where: { ...defaultOptions.where, ...options?.where } 
      };
      const veiculos = await Veiculo.findAll(finalOptions);
      return veiculos.map(veiculo => veiculo.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      throw new Error("Erro no serviço ao buscar veículos.");
    }
  }

  // Buscar um veículo por ID (com inclusão de proprietário)
  public async findById(id: number): Promise<VeiculoAttributes | null> {
    try {
      const veiculo = await Veiculo.findByPk(id, {
        include: [
          { model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'matricula', 'curso'] },
          { model: Docente, as: 'docente', attributes: ['id', 'nome', 'matricula', 'departamento'] }
        ]
      });
      return veiculo ? veiculo.get({ plain: true }) : null;
    } catch (error) {
      console.error(`Erro ao buscar veículo por ID ${id}:`, error);
      throw new Error("Erro no serviço ao buscar veículo por ID.");
    }
  }

  // Buscar veículos por placa ou modelo (com inclusão de proprietário)
  public async findByPlacaOrModelo(query: string): Promise<VeiculoAttributes[]> {
    try {
      if (!query || query.trim() === '') {
        return []; // Retorna vazio se a query for inválida
      }
      const searchTerm = `%${query}%`; // Para busca parcial (LIKE)
      const veiculos = await Veiculo.findAll({
        where: {
          [Op.or]: [
            { placa: { [Op.like]: searchTerm } },
            { modelo: { [Op.like]: searchTerm } }
          ]
        },
        include: [
          { model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'matricula'] },
          { model: Docente, as: 'docente', attributes: ['id', 'nome', 'matricula'] }
        ]
      });
      return veiculos.map(veiculo => veiculo.get({ plain: true }));
    } catch (error) {
      console.error(`Erro ao buscar veículo por placa ou modelo (${query}):`, error);
      throw new Error("Erro no serviço ao buscar veículo por placa ou modelo.");
    }
  }

  // Atualizar um veículo por ID
  public async update(id: number, data: Partial<VeiculoAttributes>): Promise<VeiculoAttributes | null> {
    try {
      const veiculo = await Veiculo.findByPk(id);
      if (!veiculo) {
        return null;
      }

      // Validação para garantir que a atualização não viole a regra do proprietário
      const finalAlunoId = data.alunoId !== undefined ? data.alunoId : veiculo.alunoId;
      const finalDocenteId = data.docenteId !== undefined ? data.docenteId : veiculo.docenteId;
      if ((finalAlunoId === null && finalDocenteId === null) || (finalAlunoId !== null && finalDocenteId !== null)) {
        throw new Error("Atualização inválida: O veículo deve pertencer a um Aluno ou a um Docente, mas não a ambos ou nenhum.");
      }
      // Verificar se o novo proprietário (se alterado) existe e está ativo
      if (data.alunoId && data.alunoId !== veiculo.alunoId) {
          const aluno = await Aluno.findOne({ where: { id: data.alunoId, ativo: true } });
          if (!aluno) throw new Error(`Aluno com ID ${data.alunoId} não encontrado ou inativo.`);
      }
      if (data.docenteId && data.docenteId !== veiculo.docenteId) {
          const docente = await Docente.findOne({ where: { id: data.docenteId, ativo: true } });
          if (!docente) throw new Error(`Docente com ID ${data.docenteId} não encontrado ou inativo.`);
      }

      // Remover campos não permitidos para atualização
      delete data.id;

      await veiculo.update(data);
      // Recarregar para incluir associações atualizadas
      const veiculoAtualizado = await this.findById(id);
      return veiculoAtualizado;

    } catch (error: any) {
      console.error(`Erro ao atualizar veículo por ID ${id}:`, error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Placa '${data.placa}' já existe.`);
      }
      if (error.message.includes("Aluno com ID") || error.message.includes("Docente com ID") || error.message.includes("Atualização inválida")) {
          throw new Error(error.message);
      }
      throw new Error("Erro no serviço ao atualizar veículo.");
    }
  }

  // Deletar um veículo por ID
  public async delete(id: number): Promise<boolean> {
    try {
      const veiculo = await Veiculo.findByPk(id);
      if (!veiculo) {
        return false;
      }
      // Adicionar verificação se o veículo está atualmente estacionado?
      // const estacionamentoAtivo = await Estacionamento.findOne({ where: { veiculoId: id, data_saida: null } });
      // if (estacionamentoAtivo) {
      //   throw new Error("Não é possível excluir veículo com registro de estacionamento ativo.");
      // }
      
      await veiculo.destroy();
      return true;
    } catch (error: any) {
      console.error(`Erro ao deletar veículo por ID ${id}:`, error);
      // Tratar erro de FK constraint?
      if (error.message.includes("Não é possível excluir veículo")) {
          throw new Error(error.message);
      }
      throw new Error("Erro no serviço ao deletar veículo.");
    }
  }
}


import { Estacionamento, Veiculo, Vaga, Aluno, Docente } from "../models";
import { EstacionamentoAttributes, EstacionamentoCreationAttributes } from "../models/Estacionamento";
import { FindOptions, Op } from "sequelize";
import sequelize from "../config/database"; // Importar para transações

export class EstacionamentoService {

  // Registrar a entrada de um veículo em uma vaga
  public async registrarEntrada(data: { veiculoId: number; vagaId: number }): Promise<Partial<EstacionamentoAttributes>> {
    const transaction = await sequelize.transaction(); // Iniciar transação
    try {
      // 1. Verificar se o veículo existe
      const veiculo = await Veiculo.findByPk(data.veiculoId, {
        transaction,
        include: [
          { model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'matricula', 'curso'] },
          { model: Docente, as: 'docente', attributes: ['id', 'nome', 'matricula', 'departamento'] }
        ]
      });
      if (!veiculo) {
        throw new Error(`Veículo com ID ${data.veiculoId} não encontrado.`);
      }

      // 2. Verificar se a vaga existe e está disponível
      const vaga = await Vaga.findByPk(data.vagaId, { transaction });
      if (!vaga) {
        throw new Error(`Vaga com ID ${data.vagaId} não encontrada.`);
      }
      if (vaga.ocupada) {
        throw new Error(`Vaga ${vaga.numero} (ID: ${data.vagaId}) já está ocupada.`);
      }

      // 3. Verificar se o veículo já não está estacionado em outra vaga (sem data_saida)
      const estacionamentoAtivo = await Estacionamento.findOne({
        where: {
          veiculoId: data.veiculoId,
          data_saida: null
        },
        transaction
      });
      if (estacionamentoAtivo) {
        throw new Error(`Veículo com ID ${data.veiculoId} (Placa: ${veiculo.placa}) já possui um registro de entrada ativo na vaga ID ${estacionamentoAtivo.vagaId}.`);
      }

      // 4. Criar o registro de estacionamento
      // A data_entrada será definida pelo defaultValue: DataTypes.NOW
      const novoEstacionamento = await Estacionamento.create({
        veiculoId: data.veiculoId,
        vagaId: data.vagaId,
        data_saida: null, // Explicitamente nulo na entrada
        valor_pago: null
      }, { transaction });

      // 5. Atualizar o status da vaga para ocupada (o hook afterCreate fará isso, mas podemos fazer explicitamente na transação também para garantir)
      // O hook afterCreate já faz isso, então não precisamos repetir aqui se confiarmos no hook.
      // Se quisermos garantir atomicidade total na transação:
      // vaga.ocupada = true;
      // await vaga.save({ transaction });

      await transaction.commit(); // Confirmar a transação
      console.log(`Entrada registrada para Veículo ID ${data.veiculoId} na Vaga ID ${data.vagaId}`);

      // Recarregar para obter os dados completos, incluindo a data_entrada gerada
      const resultado = await Estacionamento.findByPk(novoEstacionamento.id, {
        include: [
          { model: Veiculo, as: 'veiculo', attributes: ['placa', 'modelo'] },
          { model: Vaga, as: 'vaga', attributes: ['numero', 'tipo'] }
        ]
      });
     
        
      const registro = {...resultado?.get({plain: true}), veiculo: {...veiculo.get({plain: true})}}
      return registro;

    } catch (error: any) {
      await transaction.rollback(); // Desfazer a transação em caso de erro
      console.error("Erro ao registrar entrada:", error);
      // Repassar mensagens de erro específicas
      if (error.message.includes("não encontrado") || error.message.includes("já está ocupada") || error.message.includes("já possui um registro de entrada ativo")) {
        throw new Error(error.message);
      }
      throw new Error("Erro no serviço ao registrar entrada de veículo.");
    }
  }

  // Registrar a saída de um veículo
  public async registrarSaida(estacionamentoId: number, valorPago?: number): Promise<EstacionamentoAttributes | null> {
    const transaction = await sequelize.transaction();
    try {
      // 1. Encontrar o registro de estacionamento ativo
      const estacionamento = await Estacionamento.findOne({
        where: {
          id: estacionamentoId,
          data_saida: null // Garantir que estamos registrando a saída de uma entrada ativa
        },
        include: [{
          model: Vaga, as: 'vaga'
        }], // Incluir a vaga para atualizar seu status
        transaction
      });

      if (!estacionamento) {
        // Pode ser que o ID não exista ou a saída já foi registrada
        const existe = await Estacionamento.findByPk(estacionamentoId, { transaction });
        if (!existe) throw new Error(`Registro de estacionamento com ID ${estacionamentoId} não encontrado.`);
        if (existe.data_saida !== null) throw new Error(`Saída para o registro de estacionamento ID ${estacionamentoId} já foi registrada em ${existe.data_saida}.`);
        // Se chegou aqui, é um caso inesperado
        throw new Error(`Registro de estacionamento ativo com ID ${estacionamentoId} não encontrado.`);
      }

      // 2. Atualizar o registro com a data de saída e valor pago
      estacionamento.data_saida = new Date(); // Hora atual
      if (valorPago !== undefined) {
        estacionamento.valor_pago = valorPago;
      }
      await estacionamento.save({ transaction });

      // 3. Atualizar o status da vaga para desocupada (o hook afterUpdate fará isso)
      // Se quisermos garantir atomicidade total na transação:
      // const vaga = estacionamento.vaga;
      // if (vaga) {
      //   vaga.ocupada = false;
      //   await vaga.save({ transaction });
      // } else {
      //   // Logar um aviso, pois a vaga associada não foi encontrada durante a inclusão
      //   console.warn(`Vaga associada ao estacionamento ID ${estacionamentoId} não encontrada para atualização de status.`);
      // }

      await transaction.commit();
      console.log(`Saída registrada para Estacionamento ID ${estacionamentoId}`);

      // Retornar o registro atualizado
      const resultado = await Estacionamento.findByPk(estacionamento.id, {
        include: [
          { model: Veiculo, as: 'veiculo', attributes: ['placa', 'modelo'] },
          { model: Vaga, as: 'vaga', attributes: ['numero', 'tipo'] }
        ]
      });
      return resultado!.get({ plain: true });

    } catch (error: any) {
      await transaction.rollback();
      console.error("Erro ao registrar saída:", error);
      if (error.message.includes("não encontrado") || error.message.includes("já foi registrada")) {
        throw new Error(error.message);
      }
      throw new Error("Erro no serviço ao registrar saída de veículo.");
    }
  }

  // Buscar todos os registros de estacionamento (com filtros, paginação, etc.)
  public async findAll(options?: FindOptions<EstacionamentoAttributes>): Promise<EstacionamentoAttributes[]> {
    try {
      const defaultOptions: FindOptions<EstacionamentoAttributes> = {
        include: [
          { model: Veiculo, as: 'veiculo', attributes: ['placa', 'modelo'], 
            include: [
              {
                model: Aluno,
                as: 'aluno',
                attributes: ['nome', 'matricula']
              },
              {
                model: Docente,
                as: 'docente',
                attributes: ['nome', 'matricula']
              }
            ] },
          { model: Vaga, as: 'vaga', attributes: ['numero', 'tipo'] }
        ],
        order: [['data_entrada', 'DESC']] // Ordenar pelos mais recentes primeiro
      };
      const finalOptions = { ...defaultOptions, ...options };

      // Exemplo de como adicionar filtro por período no options:
      // options.where = { data_entrada: { [Op.between]: [startDate, endDate] } };

      const estacionamentos = await Estacionamento.findAll(finalOptions);
      return estacionamentos.map(est => est.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar registros de estacionamento:", error);
      throw new Error("Erro no serviço ao buscar registros de estacionamento.");
    }
  }

  // Buscar um registro de estacionamento por ID
  public async findById(id: number): Promise<EstacionamentoAttributes | null> {
    try {
      const estacionamento = await Estacionamento.findByPk(id, {
        include: [
          { model: Veiculo, as: 'veiculo' }, // Incluir todos os dados do veículo
          { model: Vaga, as: 'vaga' }      // Incluir todos os dados da vaga
        ]
      });
      return estacionamento ? estacionamento.get({ plain: true }) : null;
    } catch (error) {
      console.error(`Erro ao buscar estacionamento por ID ${id}:`, error);
      throw new Error("Erro no serviço ao buscar estacionamento por ID.");
    }
  }

  // Buscar registros de estacionamento ativos (sem data de saída)
  public async findActive(): Promise<EstacionamentoAttributes[]> {
    try {
      const options: FindOptions<EstacionamentoAttributes> = {
        where: { data_saida: null },
        include: [
          { model: Veiculo, as: 'veiculo', attributes: ['placa', 'modelo'] },
          { model: Vaga, as: 'vaga', attributes: ['numero', 'tipo'] }
        ],
        order: [['data_entrada', 'ASC']] // Ordenar pelos mais antigos primeiro
      };
      return await this.findAll(options);
    } catch (error) {
      console.error("Erro ao buscar estacionamentos ativos:", error);
      throw new Error("Erro no serviço ao buscar estacionamentos ativos.");
    }
  }

  // Não há métodos update/delete diretos para Estacionamento, pois as ações são registrar entrada/saída.
}


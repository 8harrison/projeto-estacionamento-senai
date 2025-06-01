import { fakerPT_BR as faker } from '@faker-js/faker';
import sequelize from './config/database'; // Ajuste o caminho se necessário
import { Vaga, Docente, Aluno, Veiculo, Usuario, Estacionamento } from './models'; // Importar todos os modelos
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

// Função auxiliar para gerar números de vaga únicos
const gerarNumerosVaga = (total: number): string[] => {
    const numeros = new Set<string>();
    const prefixos = ['A', 'B', 'C', 'D', 'E'];
    while (numeros.size < total) {
        const prefixo = prefixos[faker.number.int({ min: 0, max: prefixos.length - 1 })];
        const numero = faker.number.int({ min: 1, max: 50 }).toString().padStart(2, '0');
        numeros.add(`${prefixo}${numero}`);
    }
    return Array.from(numeros);
};

// Função auxiliar para gerar matrículas únicas
const gerarMatriculasUnicas = (prefixo: string, total: number, existentes: Set<string>): string[] => {
    const matriculas: string[] = [];
    while (matriculas.length < total) {
        const ano = faker.number.int({ min: 2020, max: 2024 });
        const sequencial = faker.number.int({ min: 1, max: 9999 }).toString().padStart(4, '0');
        const matricula = `${prefixo}${ano}${sequencial}`;
        if (!existentes.has(matricula)) {
            matriculas.push(matricula);
            existentes.add(matricula);
        }
    }
    return matriculas;
};

// Função auxiliar para gerar placas únicas
const gerarPlacasUnicas = (total: number, existentes: Set<string>): string[] => {
    const placas: string[] = [];
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';

    while (placas.length < total) {
        let placa = '';
        // Formato Mercosul (LLLNLNN)
        for (let i = 0; i < 3; i++) placa += letras.charAt(Math.floor(Math.random() * letras.length));
        placa += numeros.charAt(Math.floor(Math.random() * numeros.length));
        placa += letras.charAt(Math.floor(Math.random() * letras.length));
        for (let i = 0; i < 2; i++) placa += numeros.charAt(Math.floor(Math.random() * numeros.length));

        if (!existentes.has(placa)) {
            placas.push(placa);
            existentes.add(placa);
        }
    }
    return placas;
};

const seedDatabase = async () => {
    try {
        console.log('Conectando ao banco de dados...');
        await sequelize.authenticate();
        console.log('Conexão bem-sucedida.');

        // Limpar tabelas na ordem correta (cuidado com FKs!)
        // É mais seguro deletar na ordem inversa da criação ou desabilitar FK checks temporariamente (se o DB permitir)
        console.log('Limpando tabelas existentes (cuidado com FKs)...');
        await Estacionamento.destroy({ where: {}, truncate: false });
        await Veiculo.destroy({ where: {}, truncate: false });
        await Vaga.destroy({ where: {}, truncate: false });
        await Aluno.destroy({ where: {}, truncate: false });
        await Docente.destroy({ where: {}, truncate: false });
        await Usuario.destroy({ where: { email: { [Op.ne]: 'admin@exemplo.com' } } }); // Não deletar admin padrão
        console.log('Tabelas limpas.');

        // --- Criar Usuários Padrão (se não existirem) ---
        console.log('Criando usuários padrão (admin/porteiro)...');
        const adminSenhaHash = await bcrypt.hash('admin123', 10);
        const porteiroSenhaHash = await bcrypt.hash('porteiro123', 10);

        const [adminUser, adminCreated] = await Usuario.findOrCreate({
            where: { email: 'admin@exemplo.com' },
            defaults:
            {
                nome: 'Administrador Padrão',
                email: 'admin@exemplo.com',
                senha: adminSenhaHash,
                senha_hash: adminSenhaHash,
                role: 'administrador',
                ativo: true
            }
        });
        if (adminCreated) console.log('Usuário administrador padrão criado.');

        const [porteiroUser, porteiroCreated] = await Usuario.findOrCreate({
            where: { email: 'porteiro@exemplo.com' },
            defaults:
            {
                nome: 'Porteiro Padrão',
                email: 'porteiro@exemplo.com',
                senha: porteiroSenhaHash,
                senha_hash: porteiroSenhaHash,
                role: 'porteiro',
                ativo: true
            }
        });
        if (porteiroCreated) console.log('Usuário porteiro padrão criado.');

        // --- Seed Vagas (100) ---
        console.log('Criando vagas...');
        const totalVagas = 100;
        const numerosVaga = gerarNumerosVaga(totalVagas);
        const vagasData = numerosVaga.map(numero => ({
            numero: numero,
            tipo: faker.helpers.arrayElement(['Comum', 'Prioritária', 'Docente']),
            ocupada: false,
            ativa: true,
            data_cadastro: faker.date.past({ years: 1 })
        }));
        await Vaga.bulkCreate(vagasData);
        console.log(`${totalVagas} vagas criadas.`);

        // --- Seed Docentes (30) ---
        console.log('Criando docentes...');
        const totalDocentes = 30;
        const matriculasExistentes = new Set<string>();
        const matriculasDocente = gerarMatriculasUnicas('P', totalDocentes, matriculasExistentes);
        const docentesData = matriculasDocente.map(matricula => ({
            matricula: matricula,
            nome: faker.person.fullName(),
            departamento: faker.commerce.department(),
            telefone: faker.phone.number({ style: 'national' }),
            email: faker.internet.email().toLowerCase(),
            ativo: true,
            data_cadastro: faker.date.past({ years: 2 })
        }));
        const docentesCriados = await Docente.bulkCreate(docentesData);
        console.log(`${totalDocentes} docentes criados.`);

        // --- Seed Alunos (300: 100 por turno) ---
        console.log('Criando alunos...');
        const totalAlunosPorTurno = 100;
        const turnos = ['Manhã', 'Tarde', 'Noite'];
        const alunosCriados: Aluno[] = [];

        for (const turno of turnos) {
            const matriculasAluno = gerarMatriculasUnicas('R', totalAlunosPorTurno, matriculasExistentes);
            const alunosData = matriculasAluno.map(matricula => ({
                matricula: matricula,
                nome: faker.person.fullName(),
                curso: faker.helpers.arrayElement(['Engenharia de Software', 'Ciência da Computação', 'Sistemas de Informação', 'Redes de Computadores']),
                turno: turno,
                telefone: faker.phone.number({ style: 'national' }),
                email: faker.internet.email().toLowerCase(),
                ativo: true,
                data_cadastro: faker.date.past({ years: 3 })
            }));
            const alunosDoTurno = await Aluno.bulkCreate(alunosData);
            alunosCriados.push(...alunosDoTurno);
            console.log(`${totalAlunosPorTurno} alunos do turno ${turno} criados.`);
        }
        console.log(`${alunosCriados.length} alunos criados no total.`);

        // --- Seed Veículos Docentes (1-2 por docente) ---
        console.log('Criando veículos para docentes...');
        const placasExistentes = new Set<string>();
        const veiculosDocenteData = [];
        for (const docente of docentesCriados) {
            const numVeiculos = faker.number.int({ min: 1, max: 2 });
            const placas = gerarPlacasUnicas(numVeiculos, placasExistentes);
            for (const placa of placas) {
                veiculosDocenteData.push({
                    placa: placa,
                    modelo: `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}`,
                    cor: faker.vehicle.color(),
                    docenteId: docente.id,
                    alunoId: null,
                    ativo: true,
                    data_cadastro: faker.date.between({ from: docente.data_cadastro, to: new Date() })
                });
            }
        }
        await Veiculo.bulkCreate(veiculosDocenteData);
        console.log(`${veiculosDocenteData.length} veículos de docentes criados.`);

        // --- Seed Veículos Alunos (1-2 para 50 por turno) ---
        console.log('Criando veículos para alunos...');
        const veiculosAlunoData = [];
        const alunosComCarroPorTurno = 50;

        for (const turno of turnos) {
            const alunosDoTurno = alunosCriados.filter(a => a.turno === turno);
            const alunosSelecionados = faker.helpers.arrayElements(alunosDoTurno, alunosComCarroPorTurno);
            
            for (const aluno of alunosSelecionados) {
                const numVeiculos = faker.number.int({ min: 1, max: 2 });
                const placas = gerarPlacasUnicas(numVeiculos, placasExistentes);
                for (const placa of placas) {
                    veiculosAlunoData.push({
                        placa: placa,
                        modelo: `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}`,
                        cor: faker.vehicle.color(),
                        alunoId: aluno.id,
                        docenteId: null,
                        ativo: true,
                        data_cadastro: faker.date.between({ from: aluno.data_cadastro, to: new Date() })
                    });
                }
            }
        }
        await Veiculo.bulkCreate(veiculosAlunoData);
        console.log(`${veiculosAlunoData.length} veículos de alunos criados.`);

        console.log('Seed concluído com sucesso!');

    } catch (error) {
        console.error('Erro durante o processo de seed:', error);
    } finally {
        await sequelize.close();
        console.log('Conexão com o banco de dados fechada.');
    }
};

// Executar a função de seed
seedDatabase();


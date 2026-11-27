import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";
import type { LetraAlternativa } from "../src/generated/prisma/client.js";

const SALT_ROUNDS = 10;

async function garantirAula(dados: {
  titulo: string;
  disciplinaId: number;
  videoUrl: string | null;
}) {
  const existente = await prisma.aula.findFirst({
    where: {
      titulo: dados.titulo,
      disciplinaId: dados.disciplinaId,
    },
  });

  if (existente) {
    return await prisma.aula.update({
      where: { id: existente.id },
      data: {
        videoUrl: dados.videoUrl,
      },
    });
  }

  return await prisma.aula.create({
    data: dados,
  });
}

async function garantirQuestaoComAlternativas(dados: {
  aulaId: number;
  numeroQuestao: number;
  textoQuestao: string;
  alternativas: {
    letra: LetraAlternativa;
    texto: string;
    correta: boolean;
  }[];
}) {
  const questao = await prisma.questao.upsert({
    where: {
      aulaId_numeroQuestao: {
        aulaId: dados.aulaId,
        numeroQuestao: dados.numeroQuestao,
      },
    },
    update: {
      textoQuestao: dados.textoQuestao,
    },
    create: {
      aulaId: dados.aulaId,
      numeroQuestao: dados.numeroQuestao,
      textoQuestao: dados.textoQuestao,
    },
  });

  const alternativasCriadas = [];
  for (const alt of dados.alternativas) {
    const alternativa = await prisma.alternativa.upsert({
      where: {
        questaoId_letra: {
          questaoId: questao.id,
          letra: alt.letra,
        },
      },
      update: {
        texto: alt.texto,
        correta: alt.correta,
      },
      create: {
        questaoId: questao.id,
        letra: alt.letra,
        texto: alt.texto,
        correta: alt.correta,
      },
    });
    alternativasCriadas.push(alternativa);
  }

  return { questao, alternativas: alternativasCriadas };
}

async function main() {
  console.log("Iniciando o povoamento (seed) do banco de dados...");

  const senhaAdminHash = await bcrypt.hash("Admin@123", SALT_ROUNDS);
  const senhaAlunoHash = await bcrypt.hash("Aluno@123", SALT_ROUNDS);

  // 1. Administradores (1 ativo e 1 pendente de aprovação)
  const adminAtivo = await prisma.admin.upsert({
    where: { email: "admin@plataforma.com" },
    update: {
      nome: "Prof. Dr. Carlos Eduardo",
      telefone: "83999990001",
      senha: senhaAdminHash,
      aprovado: true,
    },
    create: {
      nome: "Prof. Dr. Carlos Eduardo",
      telefone: "83999990001",
      email: "admin@plataforma.com",
      senha: senhaAdminHash,
      aprovado: true,
    },
  });

  await prisma.admin.upsert({
    where: { email: "mariana.admin@plataforma.com" },
    update: {
      nome: "Profa. Dra. Mariana Costa",
      telefone: "83999990002",
      senha: senhaAdminHash,
      aprovado: false,
    },
    create: {
      nome: "Profa. Dra. Mariana Costa",
      telefone: "83999990002",
      email: "mariana.admin@plataforma.com",
      senha: senhaAdminHash,
      aprovado: false,
    },
  });

  // 2. Alunos
  const alunoPrincipal = await prisma.aluno.upsert({
    where: { email: "joao.aluno@plataforma.com" },
    update: {
      nome: "João Pedro Silva",
      telefone: "83988880001",
      senha: senhaAlunoHash,
    },
    create: {
      nome: "João Pedro Silva",
      telefone: "83988880001",
      email: "joao.aluno@plataforma.com",
      senha: senhaAlunoHash,
    },
  });

  await prisma.aluno.upsert({
    where: { email: "ana.aluno@plataforma.com" },
    update: {
      nome: "Ana Beatriz Lima",
      telefone: "83988880002",
      senha: senhaAlunoHash,
    },
    create: {
      nome: "Ana Beatriz Lima",
      telefone: "83988880002",
      email: "ana.aluno@plataforma.com",
      senha: senhaAlunoHash,
    },
  });

  // 3. Disciplinas (Medicina)
  const discAnatomia = await prisma.disciplina.upsert({
    where: { nome: "Anatomia Humana" },
    update: {},
    create: { nome: "Anatomia Humana" },
  });

  const discFisiologia = await prisma.disciplina.upsert({
    where: { nome: "Fisiologia Médica" },
    update: {},
    create: { nome: "Fisiologia Médica" },
  });

  const discFarmacologia = await prisma.disciplina.upsert({
    where: { nome: "Farmacologia Clínica" },
    update: {},
    create: { nome: "Farmacologia Clínica" },
  });

  // 4. Aulas
  const aulaCardiovascular = await garantirAula({
    titulo: "Sistema Cardiovascular e Ciclo Cardíaco",
    disciplinaId: discAnatomia.id,
    videoUrl: "https://www.youtube.com/watch?v=X9ZZ6tcxArI",
  });

  const aulaNeuroanatomia = await garantirAula({
    titulo: "Sistema Nervoso Central e Pares Cranianos",
    disciplinaId: discAnatomia.id,
    videoUrl: "https://www.youtube.com/watch?v=qPix_X-9t7E",
  });

  const aulaFisiologiaRenal = await garantirAula({
    titulo: "Fisiologia Renal e Equilíbrio Ácido-Base",
    disciplinaId: discFisiologia.id,
    videoUrl: "https://www.youtube.com/watch?v=l128tW1H5a8",
  });

  await garantirAula({
    titulo: "Farmacocinética e Farmacodinâmica Básica",
    disciplinaId: discFarmacologia.id,
    videoUrl: "https://www.youtube.com/watch?v=NKV5nSU-h-k",
  });

  // 5. Questões e Alternativas
  const q1Cardio = await garantirQuestaoComAlternativas({
    aulaId: aulaCardiovascular.id,
    numeroQuestao: 1,
    textoQuestao:
      "Qual valva cardíaca impede o refluxo de sangue do ventrículo esquerdo para o átrio esquerdo durante a sístole ventricular?",
    alternativas: [
      {
        letra: "A",
        texto: "Valva tricúspide",
        correta: false,
      },
      {
        letra: "B",
        texto: "Valva mitral (bicúspide)",
        correta: true,
      },
      {
        letra: "C",
        texto: "Valva pulmonar",
        correta: false,
      },
      {
        letra: "D",
        texto: "Valva aórtica",
        correta: false,
      },
    ],
  });

  const q2Cardio = await garantirQuestaoComAlternativas({
    aulaId: aulaCardiovascular.id,
    numeroQuestao: 2,
    textoQuestao:
      "Qual estrutura é considerada o marca-passo fisiológico normal do coração humano?",
    alternativas: [
      { letra: "A", texto: "Nó atrioventricular (AV)", correta: false },
      { letra: "B", texto: "Feixe de His", correta: false },
      { letra: "C", texto: "Nó sinoatrial (SA)", correta: true },
      { letra: "D", texto: "Fibras de Purkinje", correta: false },
    ],
  });

  await garantirQuestaoComAlternativas({
    aulaId: aulaNeuroanatomia.id,
    numeroQuestao: 1,
    textoQuestao:
      "Qual par craniano é responsável pela inervação motora da maioria dos músculos intrínsecos e extrínsecos da língua?",
    alternativas: [
      {
        letra: "A",
        texto: "Nervo glossofaríngeo (IX par)",
        correta: false,
      },
      {
        letra: "B",
        texto: "Nervo hipoglosso (XII par)",
        correta: true,
      },
      {
        letra: "C",
        texto: "Nervo vago (X par)",
        correta: false,
      },
      {
        letra: "D",
        texto: "Nervo trigêmeo (V par)",
        correta: false,
      },
    ],
  });

  await garantirQuestaoComAlternativas({
    aulaId: aulaFisiologiaRenal.id,
    numeroQuestao: 1,
    textoQuestao:
      "Em qual segmento do néfron ocorre a maior parte da reabsorção obrigatória de água e sódio filtrados?",
    alternativas: [
      { letra: "A", texto: "Túbulo contorcido distal", correta: false },
      { letra: "B", texto: "Túbulo contorcido proximal", correta: true },
      { letra: "C", texto: "Ducto coletor medular", correta: false },
      {
        letra: "D",
        texto: "Ramo ascendente espesso da alça de Henle",
        correta: false,
      },
    ],
  });

  // 6. Progresso e respostas iniciais de exemplo para o Aluno Principal
  const altCorretaQ1 = q1Cardio.alternativas.find((a) => a.letra === "B")!;
  const altIncorretaQ2 = q2Cardio.alternativas.find((a) => a.letra === "A")!;

  await prisma.respostaAluno.upsert({
    where: {
      alunoId_questaoId: {
        alunoId: alunoPrincipal.id,
        questaoId: q1Cardio.questao.id,
      },
    },
    update: {
      alternativaId: altCorretaQ1.id,
      acertou: true,
    },
    create: {
      alunoId: alunoPrincipal.id,
      questaoId: q1Cardio.questao.id,
      alternativaId: altCorretaQ1.id,
      acertou: true,
    },
  });

  await prisma.respostaAluno.upsert({
    where: {
      alunoId_questaoId: {
        alunoId: alunoPrincipal.id,
        questaoId: q2Cardio.questao.id,
      },
    },
    update: {
      alternativaId: altIncorretaQ2.id,
      acertou: false,
    },
    create: {
      alunoId: alunoPrincipal.id,
      questaoId: q2Cardio.questao.id,
      alternativaId: altIncorretaQ2.id,
      acertou: false,
    },
  });

  await prisma.progressoAula.upsert({
    where: {
      alunoId_aulaId: {
        alunoId: alunoPrincipal.id,
        aulaId: aulaCardiovascular.id,
      },
    },
    update: {
      assistida: true,
    },
    create: {
      alunoId: alunoPrincipal.id,
      aulaId: aulaCardiovascular.id,
      assistida: true,
    },
  });

  console.log("Seed concluída com sucesso!");
  console.log(`Admin ativo: ${adminAtivo.email} / Admin@123`);
  console.log(`Aluno exemplo: ${alunoPrincipal.email} / Aluno@123`);
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

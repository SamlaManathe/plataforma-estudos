import { prisma } from "../config/prisma.js";

export async function getAulaComQuestoes(aulaId: number) {
  return await prisma.aula.findUnique({
    where: { id: aulaId },
    include: {
      questoes: {
        include: { alternativas: true },
        orderBy: { numeroQuestao: "asc" },
      },
    },
  });
}

export async function getRespostasAlunoNaAula(alunoId: number, aulaId: number) {
  return await prisma.respostaAluno.findMany({
    where: {
      alunoId,
      questao: { aulaId },
    },
    include: {
      questao: true,
      alternativa: true,
    },
  });
}

export async function createRespostasEmLote(
  registros: Array<{
    alunoId: number;
    questaoId: number;
    alternativaId: number;
    acertou: boolean;
  }>,
) {
  return await prisma.$transaction(
    registros.map((item) =>
      prisma.respostaAluno.create({
        data: item,
      }),
    ),
  );
}

export async function upsertAulaAssistida(alunoId: number, aulaId: number) {
  return await prisma.progressoAula.upsert({
    where: {
      alunoId_aulaId: { alunoId, aulaId },
    },
    update: { assistida: true },
    create: {
      alunoId,
      aulaId,
      assistida: true,
    },
  });
}

export async function getResumoGeralAluno(alunoId: number) {
  const [aluno, disciplinas, respostas, progressos] = await Promise.all([
    prisma.aluno.findUnique({ where: { id: alunoId } }),
    prisma.disciplina.findMany({
      include: {
        aulas: {
          orderBy: { id: "asc" },
          include: {
            questoes: {
              orderBy: { numeroQuestao: "asc" },
              include: { alternativas: true },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.respostaAluno.findMany({
      where: { alunoId },
      include: {
        questao: true,
        alternativa: true,
      },
    }),
    prisma.progressoAula.findMany({
      where: { alunoId, assistida: true },
    }),
  ]);

  return { aluno, disciplinas, respostas, progressos };
}

export async function getRelatorioTodosAlunos() {
  return await prisma.aluno.findMany({
    orderBy: { nome: "asc" },
    include: {
      aulasVistas: {
        include: {
          aula: { include: { disciplina: true } },
        },
      },
      respostas: {
        orderBy: { respondidoEm: "desc" },
        include: {
          alternativa: true,
          questao: {
            include: {
              alternativas: true,
              aula: {
                include: { disciplina: true },
              },
            },
          },
        },
      },
    },
  });
}
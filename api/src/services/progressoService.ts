import type {
  EnviarRespostasAulaDTO,
  MarcarAulaAssistidaDTO,
} from "@plataforma-estudos/shared/progresso";
import * as repository from "../repositories/progressoRepository.js";
import * as alunoRepository from "../repositories/alunoRepository.js";

export async function enviarRespostasAula(dados: EnviarRespostasAulaDTO) {
  const aluno = await alunoRepository.getOne(dados.alunoId);
  if (!aluno) {
    throw new Error("Aluno não encontrado.");
  }

  const aula = await repository.getAulaComQuestoes(dados.aulaId);
  if (!aula) {
    throw new Error("Aula não encontrada.");
  }

  if (aula.questoes.length === 0) {
    throw new Error("Esta aula não possui questionário cadastrado.");
  }

  const jaRespondidas = await repository.getRespostasAlunoNaAula(
    dados.alunoId,
    dados.aulaId,
  );
  if (jaRespondidas.length > 0) {
    throw new Error(
      "Você já enviou as respostas deste questionário. Não é possível refazê-lo.",
    );
  }

  if (dados.respostas.length !== aula.questoes.length) {
    throw new Error(
      `Responda todas as ${aula.questoes.length} questões antes de enviar.`,
    );
  }

  type QuestaoComAlternativas = (typeof aula.questoes)[number];
  type AlternativaItem = QuestaoComAlternativas["alternativas"][number];

  const registrosParaSalvar = dados.respostas.map((resp) => {
    const questao = aula.questoes.find(
      (q: QuestaoComAlternativas) => q.id === resp.questaoId,
    );
    if (!questao) {
      throw new Error(`A questão ${resp.questaoId} não pertence a esta aula.`);
    }

    const alternativa = questao.alternativas.find(
      (a: AlternativaItem) => a.id === resp.alternativaId,
    );
    if (!alternativa) {
      throw new Error(
        `Alternativa inválida para a questão ${questao.numeroQuestao}.`,
      );
    }

    return {
      alunoId: dados.alunoId,
      questaoId: questao.id,
      alternativaId: alternativa.id,
      acertou: alternativa.correta,
    };
  });

  await repository.createRespostasEmLote(registrosParaSalvar);
  return await repository.getRespostasAlunoNaAula(dados.alunoId, dados.aulaId);
}

export async function marcarAulaAssistida(dados: MarcarAulaAssistidaDTO) {
  const aluno = await alunoRepository.getOne(dados.alunoId);
  if (!aluno) {
    throw new Error("Aluno não encontrado.");
  }

  const aula = await repository.getAulaComQuestoes(dados.aulaId);
  if (!aula) {
    throw new Error("Aula não encontrada.");
  }

  if (aula.questoes.length > 0) {
    const respostas = await repository.getRespostasAlunoNaAula(
      dados.alunoId,
      dados.aulaId,
    );
    if (respostas.length < aula.questoes.length) {
      throw new Error(
        "Responda e envie o questionário desta aula antes de marcá-la como assistida.",
      );
    }
  }

  return await repository.upsertAulaAssistida(dados.alunoId, dados.aulaId);
}

export async function getRespostasAlunoNaAula(alunoId: number, aulaId: number) {
  const aluno = await alunoRepository.getOne(alunoId);
  if (!aluno) {
    throw new Error("Aluno não encontrado.");
  }

  return await repository.getRespostasAlunoNaAula(alunoId, aulaId);
}

export async function getDashboardAluno(alunoId: number) {
  const { aluno, disciplinas, respostas, progressos } =
    await repository.getResumoGeralAluno(alunoId);

  if (!aluno) {
    throw new Error("Aluno não encontrado.");
  }

  type ProgressoItem = (typeof progressos)[number];
  type RespostaItem = (typeof respostas)[number];
  type DisciplinaItem = (typeof disciplinas)[number];
  type AulaItem = DisciplinaItem["aulas"][number];
  type QuestaoItem = AulaItem["questoes"][number];

  const aulasAssistidasIds = new Set(
    progressos.map((p: ProgressoItem) => p.aulaId),
  );
  const respostasPorQuestao = new Map<number, RespostaItem>(
    respostas.map((r: RespostaItem) => [r.questaoId, r]),
  );

  let totalAulasPlataforma = 0;
  let totalAulasAssistidas = 0;
  let totalQuestoesRespondidas = 0;
  let totalQuestoesAcertadas = 0;

  const disciplinasDetalhadas = disciplinas.map((disc: DisciplinaItem) => {
    const aulasComProgresso = disc.aulas.map((aula: AulaItem) => {
      totalAulasPlataforma += 1;
      const assistida = aulasAssistidasIds.has(aula.id);
      if (assistida) totalAulasAssistidas += 1;

      const totalQuestoes = aula.questoes.length;
      const respostasDaAula = aula.questoes
        .map((q: QuestaoItem) => respostasPorQuestao.get(q.id))
        .filter((r): r is RespostaItem => Boolean(r));

      const respondidas = respostasDaAula.length;
      const acertos = respostasDaAula.filter(
        (r: RespostaItem) => r.acertou,
      ).length;

      totalQuestoesRespondidas += respondidas;
      totalQuestoesAcertadas += acertos;

      const porcentagemAcertos =
        totalQuestoes > 0 && respondidas > 0
          ? Math.round((acertos / totalQuestoes) * 100)
          : null;

      return {
        id: aula.id,
        titulo: aula.titulo,
        videoUrl: aula.videoUrl,
        pdfNome: aula.pdfNome,
        assistida,
        totalQuestoes,
        respondidas,
        acertos,
        porcentagemAcertos,
      };
    });

    return {
      id: disc.id,
      nome: disc.nome,
      aulas: aulasComProgresso,
    };
  });

  const percentualGeralAcertos =
    totalQuestoesRespondidas > 0
      ? Math.round((totalQuestoesAcertadas / totalQuestoesRespondidas) * 100)
      : 0;

  const percentualGeralAulas =
    totalAulasPlataforma > 0
      ? Math.round((totalAulasAssistidas / totalAulasPlataforma) * 100)
      : 0;

  return {
    resumoGeral: {
      totalAulasPlataforma,
      totalAulasAssistidas,
      percentualGeralAulas,
      totalQuestoesRespondidas,
      totalQuestoesAcertadas,
      percentualGeralAcertos,
    },
    disciplinas: disciplinasDetalhadas,
  };
}

export async function getRelatorioAdmin() {
  const alunos = await repository.getRelatorioTodosAlunos();

  type AlunoRelatorio = (typeof alunos)[number];
  type RespostaRelatorio = AlunoRelatorio["respostas"][number];
  type AlternativaRelatorio =
    RespostaRelatorio["questao"]["alternativas"][number];

  return alunos.map((aluno: AlunoRelatorio) => {
    const totalRespondidas = aluno.respostas.length;
    const totalAcertos = aluno.respostas.filter(
      (r: RespostaRelatorio) => r.acertou,
    ).length;
    const totalErros = totalRespondidas - totalAcertos;
    const porcentagemAcertos =
      totalRespondidas > 0
        ? Math.round((totalAcertos / totalRespondidas) * 100)
        : 0;

    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone,
      totalAulasAssistidas: aluno.aulasVistas.length,
      totalRespondidas,
      totalAcertos,
      totalErros,
      porcentagemAcertos,
      respostas: aluno.respostas.map((r: RespostaRelatorio) => {
        const alternativaCorreta = r.questao.alternativas.find(
          (a: AlternativaRelatorio) => a.correta,
        );
        return {
          id: r.id,
          acertou: r.acertou,
          respondidoEm: r.respondidoEm,
          disciplinaNome: r.questao.aula.disciplina.nome,
          aulaTitulo: r.questao.aula.titulo,
          numeroQuestao: r.questao.numeroQuestao,
          textoQuestao: r.questao.textoQuestao,
          alternativaMarcada: {
            letra: r.alternativa.letra,
            texto: r.alternativa.texto,
          },
          alternativaCorreta: alternativaCorreta
            ? {
                letra: alternativaCorreta.letra,
                texto: alternativaCorreta.texto,
              }
            : null,
        };
      }),
    };
  });
}

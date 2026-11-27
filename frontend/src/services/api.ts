import axios from "axios";
import type { LoginDTO } from "@plataforma-estudos/shared/login";
import type {
  Aluno,
  CadastroAlunoDTO,
  AtualizarAlunoDTO,
} from "@plataforma-estudos/shared/aluno";
import type {
  Admin,
  CadastroAdminDTO,
  AtualizarAdminDTO,
} from "@plataforma-estudos/shared/admin";
export type { Admin };
import type { DisciplinaDTO as DisciplinaDados } from "@plataforma-estudos/shared/disciplina";
import type { AulaDTO } from "@plataforma-estudos/shared/aula";
import type { QuestaoDTO } from "@plataforma-estudos/shared/questao";
import type { AlternativaDTO } from "@plataforma-estudos/shared/alternativa";
import type {
  EnviarRespostasAulaDTO,
  MarcarAulaAssistidaDTO,
} from "@plataforma-estudos/shared/progresso";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export type DisciplinaItem = DisciplinaDados & { id: number };

export type AlternativaItem = AlternativaDTO & { id: number };

export type QuestaoItem = QuestaoDTO & {
  id: number;
  alternativas?: AlternativaItem[];
};

export type AulaItem = Omit<AulaDTO, "disciplinaId"> & {
  id: number;
  disciplinaId: number;
  pdfNome?: string | null;
  disciplina?: DisciplinaItem;
  questoes?: QuestaoItem[];
};

export type UsuarioLogado = (Aluno | Admin) & {
  tipo: "admin" | "aluno";
};

// Tipos do Dashboard do Aluno
export type AulaComProgresso = {
  id: number;
  titulo: string;
  videoUrl?: string | null;
  pdfNome?: string | null;
  assistida: boolean;
  totalQuestoes: number;
  respondidas: number;
  acertos: number;
  porcentagemAcertos: number | null;
};

export type DisciplinaComProgresso = {
  id: number;
  nome: string;
  aulas: AulaComProgresso[];
};

export type DashboardAlunoResponse = {
  resumoGeral: {
    totalAulasPlataforma: number;
    totalAulasAssistidas: number;
    percentualGeralAulas: number;
    totalQuestoesRespondidas: number;
    totalQuestoesAcertadas: number;
    percentualGeralAcertos: number;
  };
  disciplinas: DisciplinaComProgresso[];
};

// Tipos do Relatório do Admin
export type RespostaDetalheAdmin = {
  id: number;
  acertou: boolean;
  respondidoEm: string;
  disciplinaNome: string;
  aulaTitulo: string;
  numeroQuestao: number;
  textoQuestao: string;
  alternativaMarcada: { letra: string; texto: string };
  alternativaCorreta: { letra: string; texto: string } | null;
};

export type AlunoRelatorioAdmin = Aluno & {
  totalAulasAssistidas: number;
  totalRespondidas: number;
  totalAcertos: number;
  totalErros: number;
  porcentagemAcertos: number;
  respostas: RespostaDetalheAdmin[];
};

// --- Autenticação ---
export async function login(dados: LoginDTO): Promise<UsuarioLogado> {
  const resposta = await api.post<UsuarioLogado>("/login", dados);
  return resposta.data;
}

export async function cadastrarAluno(dados: CadastroAlunoDTO): Promise<Aluno> {
  const resposta = await api.post<Aluno>("/alunos", dados);
  return resposta.data;
}

export async function cadastrarAdmin(dados: CadastroAdminDTO): Promise<Admin> {
  const resposta = await api.post<Admin>("/admins", dados);
  return resposta.data;
}

// --- CRUD Alunos ---
export async function listarAlunos(): Promise<Aluno[]> {
  const resposta = await api.get<Aluno[]>("/alunos");
  return resposta.data;
}

export async function atualizarAluno(
  id: number,
  dados: AtualizarAlunoDTO,
): Promise<Aluno> {
  const resposta = await api.put<Aluno>(`/alunos/${id}`, dados);
  return resposta.data;
}

export async function removerAluno(id: number): Promise<void> {
  await api.delete(`/alunos/${id}`);
}

// --- CRUD Disciplinas ---
export async function listarDisciplinas(): Promise<DisciplinaItem[]> {
  const resposta = await api.get<DisciplinaItem[]>("/disciplinas");
  return resposta.data;
}

export async function criarDisciplina(
  dados: DisciplinaDados,
): Promise<DisciplinaItem> {
  const resposta = await api.post<DisciplinaItem>("/disciplinas", dados);
  return resposta.data;
}

export async function atualizarDisciplina(
  id: number,
  dados: DisciplinaDados,
): Promise<DisciplinaItem> {
  const resposta = await api.put<DisciplinaItem>(`/disciplinas/${id}`, dados);
  return resposta.data;
}

export async function removerDisciplina(id: number): Promise<void> {
  await api.delete(`/disciplinas/${id}`);
}

// --- CRUD Aulas ---
export async function listarAulas(): Promise<AulaItem[]> {
  const resposta = await api.get<AulaItem[]>("/aulas");
  return resposta.data;
}

export async function buscarAula(id: number): Promise<AulaItem> {
  const resposta = await api.get<AulaItem>(`/aulas/${id}`);
  return resposta.data;
}

export async function criarAula(formData: FormData): Promise<AulaItem> {
  const resposta = await api.post<AulaItem>("/aulas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resposta.data;
}

export async function atualizarAula(
  id: number,
  formData: FormData,
): Promise<AulaItem> {
  const resposta = await api.put<AulaItem>(`/aulas/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resposta.data;
}

export async function removerAula(id: number): Promise<void> {
  await api.delete(`/aulas/${id}`);
}

export function getUrlPdfAula(id: number): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/aulas/${id}/pdf`;
}

// --- CRUD Questões e Alternativas ---
export async function listarQuestoes(): Promise<QuestaoItem[]> {
  const resposta = await api.get<QuestaoItem[]>("/questoes");
  return resposta.data;
}

export async function criarQuestao(dados: QuestaoDTO): Promise<QuestaoItem> {
  const resposta = await api.post<QuestaoItem>("/questoes", dados);
  return resposta.data;
}

export async function atualizarQuestao(
  id: number,
  dados: QuestaoDTO,
): Promise<QuestaoItem> {
  const resposta = await api.put<QuestaoItem>(`/questoes/${id}`, dados);
  return resposta.data;
}

export async function removerQuestao(id: number): Promise<void> {
  await api.delete(`/questoes/${id}`);
}

export async function listarAlternativas(): Promise<AlternativaItem[]> {
  const resposta = await api.get<AlternativaItem[]>("/alternativas");
  return resposta.data;
}

export async function criarAlternativa(
  dados: AlternativaDTO,
): Promise<AlternativaItem> {
  const resposta = await api.post<AlternativaItem>("/alternativas", dados);
  return resposta.data;
}

export async function atualizarAlternativa(
  id: number,
  dados: AlternativaDTO,
): Promise<AlternativaItem> {
  const resposta = await api.put<AlternativaItem>(`/alternativas/${id}`, dados);
  return resposta.data;
}

export async function removerAlternativa(id: number): Promise<void> {
  await api.delete(`/alternativas/${id}`);
}

// --- Progresso do Aluno e Relatório Admin ---
export type RespostaAlunoAulaItem = {
  id: number;
  alunoId: number;
  questaoId: number;
  alternativaId: number;
  acertou: boolean;
  respondidoEm: string;
};

export async function buscarDashboardAluno(
  alunoId: number,
): Promise<DashboardAlunoResponse> {
  const resposta = await api.get<DashboardAlunoResponse>(
    `/progresso/aluno/${alunoId}`,
  );
  return resposta.data;
}

export async function buscarRespostasAlunoNaAula(
  alunoId: number,
  aulaId: number,
): Promise<RespostaAlunoAulaItem[]> {
  const resposta = await api.get<RespostaAlunoAulaItem[]>(
    `/progresso/aluno/${alunoId}/aula/${aulaId}`,
  );
  return resposta.data;
}

export async function enviarRespostasAula(dados: EnviarRespostasAulaDTO) {
  const resposta = await api.post("/progresso/responder-aula", dados);
  return resposta.data;
}

export async function marcarAulaAssistida(dados: MarcarAulaAssistidaDTO) {
  const resposta = await api.post("/progresso/assistir-aula", dados);
  return resposta.data;
}

export async function buscarRelatorioAdmin(): Promise<AlunoRelatorioAdmin[]> {
  const resposta = await api.get<AlunoRelatorioAdmin[]>(
    "/progresso/admin/relatorio",
  );
  return resposta.data;
}

// Admins

export async function listarAdmins(): Promise<Admin[]> {
  const resposta = await api.get<Admin[]>("/admins");
  return resposta.data;
}

export async function cadastrarAdminDireto(
  dados: CadastroAdminDTO,
): Promise<Admin> {
  const resposta = await api.post<Admin>("/admins/direto", dados);
  return resposta.data;
}

export async function atualizarAdmin(
  id: number,
  dados: AtualizarAdminDTO,
): Promise<Admin> {
  const resposta = await api.put<Admin>(`/admins/${id}`, dados);
  return resposta.data;
}

export async function alterarStatusAdmin(
  id: number,
  aprovado: boolean,
  adminLogadoId: number,
): Promise<Admin> {
  const resposta = await api.patch<Admin>(`/admins/${id}/aprovar`, {
    aprovado,
    adminLogadoId,
  });
  return resposta.data;
}

export async function removerAdmin(id: number): Promise<void> {
  await api.delete(`/admins/${id}`);
}

export type AulaResumoAluno = Awaited<
  ReturnType<typeof buscarDashboardAluno>
>["disciplinas"][number]["aulas"][number];

export type DisciplinaDashboard = Awaited<
  ReturnType<typeof buscarDashboardAluno>
>["disciplinas"][number];

export type DashboardAluno = Awaited<ReturnType<typeof buscarDashboardAluno>>;

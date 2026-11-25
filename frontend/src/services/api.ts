import axios from "axios";
import type { LoginDTO } from "@plataforma-estudos/shared/auth";
import type {
  Aluno,
  CadastroAlunoDTO,
} from "@plataforma-estudos/shared/aluno";
import type {
  DisciplinaDTO as DisciplinaDados,
} from "@plataforma-estudos/shared/disciplina";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export type DisciplinaItem = DisciplinaDados & { id: number };

export async function login(dados: LoginDTO): Promise<Aluno> {
  const resposta = await api.post<Aluno>("/auth/login", dados);
  return resposta.data;
}

export async function cadastrarAluno(
  dados: CadastroAlunoDTO,
): Promise<Aluno> {
  const resposta = await api.post<Aluno>("/alunos", dados);
  return resposta.data;
}

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
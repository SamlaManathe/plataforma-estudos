import type { LetraAlternativa, Prisma } from "../generated/prisma/client.js";

export interface AlunoDTO {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
}

export interface AdminDTO {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
}

export interface DisciplinaDTO {
  nome: string;
}

export interface AulaDTO {
  titulo: string;
  videoUrl?: string | null;
  pdfNome?: string | null;
  pdfArquivo?: Prisma.Bytes | null;
  disciplinaId: number;
}

export interface QuestaoDTO {
  numeroQuestao: number;
  textoQuestao: string;
  aulaId: number;
}

export interface AlternativaDTO {
  letra: LetraAlternativa;
  texto: string;
  correta: boolean;
  questaoId: number;
}

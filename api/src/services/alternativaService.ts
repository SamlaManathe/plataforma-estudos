import type {
  Alternativa,
  LetraAlternativa,
} from "../generated/prisma/client.js";
import type { AlternativaDTO } from "@plataforma-estudos/shared/alternativa";
import * as repository from "../repositories/alternativaRepository.js";
import * as questaoRepository from "../repositories/questaoRepository.js";

const LETRAS_VALIDAS: LetraAlternativa[] = ["A", "B", "C", "D", "E"];

export async function getAll(): Promise<Alternativa[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<Alternativa | null> {
  return await repository.getOne(id);
}

export async function create(dados: AlternativaDTO): Promise<Alternativa> {
  const questao = await questaoRepository.getOne(Number(dados.questaoId));
  if (!questao) {
    throw new Error("Questão não encontrada.");
  }

  const letraNormalizada = dados.letra.toUpperCase() as LetraAlternativa;
  if (!LETRAS_VALIDAS.includes(letraNormalizada)) {
    throw new Error("A letra da alternativa deve ser A, B, C, D ou E.");
  }

  const letraExistente = await repository.getByQuestionAndLetter(
    Number(dados.questaoId),
    letraNormalizada,
  );
  if (letraExistente) {
    throw new Error(
      `Já existe uma alternativa "${letraNormalizada}" nesta questão.`,
    );
  }

  return await repository.create({
    ...dados,
    letra: letraNormalizada,
    questaoId: Number(dados.questaoId),
  });
}

export async function update(
  id: number,
  dados: AlternativaDTO,
): Promise<Alternativa> {
  const alternativaExistente = await repository.getOne(id);
  if (!alternativaExistente) {
    throw new Error("Alternativa não encontrada.");
  }

  const letraNormalizada = dados.letra.toUpperCase() as LetraAlternativa;
  if (!LETRAS_VALIDAS.includes(letraNormalizada)) {
    throw new Error("A letra da alternativa deve ser A, B, C, D ou E.");
  }

  const letraExistente = await repository.getByQuestionAndLetter(
    Number(dados.questaoId),
    letraNormalizada,
  );
  if (letraExistente && letraExistente.id !== id) {
    throw new Error(
      `Já existe outra alternativa "${letraNormalizada}" nesta questão.`,
    );
  }

  return await repository.update(id, {
    ...dados,
    letra: letraNormalizada,
    questaoId: Number(dados.questaoId),
  });
}

export async function remove(id: number): Promise<void> {
  const alternativaExistente = await repository.getOne(id);
  if (!alternativaExistente) {
    throw new Error("Alternativa não encontrada.");
  }
  await repository.remove(id);
}

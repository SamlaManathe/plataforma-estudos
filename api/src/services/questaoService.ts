import type { Questao } from "../generated/prisma/client.js";
import type { QuestaoDTO } from "@plataforma-estudos/shared/questao";
import * as repository from "../repositories/questaoRepository.js";
import * as aulaRepository from "../repositories/aulaRepository.js";
import * as progressoRepository from "../repositories/progressoRepository.js";

export async function getAll(): Promise<Questao[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<Questao | null> {
  return await repository.getOne(id);
}

export async function create(dados: QuestaoDTO): Promise<Questao> {
  const aula = await aulaRepository.getOne(Number(dados.aulaId));
  if (!aula) {
    throw new Error("Aula não encontrada.");
  }

  const numeroExistente = await repository.getByAulaAndNumero(
    Number(dados.aulaId),
    Number(dados.numeroQuestao),
  );
  if (numeroExistente) {
    throw new Error(`Já existe a questão ${dados.numeroQuestao} nesta aula.`);
  }

  const questaoCriada = await repository.create({
    ...dados,
    aulaId: Number(dados.aulaId),
    numeroQuestao: Number(dados.numeroQuestao),
  });

  await progressoRepository.resetarProgressoAula(Number(dados.aulaId));

  return questaoCriada;
}

export async function update(id: number, dados: QuestaoDTO): Promise<Questao> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Questão não encontrada.");
  }

  const numeroExistente = await repository.getByAulaAndNumero(
    Number(dados.aulaId),
    Number(dados.numeroQuestao),
  );
  if (numeroExistente && numeroExistente.id !== id) {
    throw new Error(
      `Já existe outra questão com o número ${dados.numeroQuestao} nesta aula.`,
    );
  }

  return await repository.update(id, {
    ...dados,
    aulaId: Number(dados.aulaId),
    numeroQuestao: Number(dados.numeroQuestao),
  });
}

export async function remove(id: number): Promise<void> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Questão não encontrada.");
  }
  await repository.remove(id);
}

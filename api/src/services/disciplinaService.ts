import type { Disciplina } from "../generated/prisma/client.js";
import type { DisciplinaDTO } from "../types/dtos.js";
import * as repository from "../repositories/disciplinaRepository.js";

export async function getAll(): Promise<Disciplina[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<Disciplina | null> {
  return await repository.getOne(id);
}

export async function create(dados: DisciplinaDTO): Promise<Disciplina> {
  const nomeExistente = await repository.getByName(dados.nome);
  if (nomeExistente) {
    throw new Error("Já existe uma disciplina cadastrada com este nome.");
  }
  return await repository.create(dados);
}

export async function update(
  id: number,
  dados: DisciplinaDTO,
): Promise<Disciplina> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Disciplina não encontrada.");
  }

  const nomeExistente = await repository.getByName(dados.nome);
  if (nomeExistente && nomeExistente.id !== id) {
    throw new Error("Já existe uma disciplina cadastrada com este nome.");
  }

  return await repository.update(id, dados);
}

export async function remove(id: number): Promise<void> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Disciplina não encontrada.");
  }
  await repository.remove(id);
}

import type { Aula } from "../generated/prisma/client.js";
import type { AulaDTO } from "../types/dtos.js";
import * as repository from "../repositories/aulaRepository.js";
import * as disciplinaRepository from "../repositories/disciplinaRepository.js";

type AulaSemBinario = Omit<Aula, "pdfArquivo">;

export async function getAll(): Promise<AulaSemBinario[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<AulaSemBinario | null> {
  return await repository.getOne(id);
}

export async function getPdf(id: number) {
  return await repository.getPdfById(id);
}

export async function create(dados: AulaDTO): Promise<AulaSemBinario> {
  const disciplina = await disciplinaRepository.getOne(
    Number(dados.disciplinaId),
  );
  if (!disciplina) {
    throw new Error("Disciplina não encontrada.");
  }

  const tituloExistente = await repository.getByTituloAndDisciplina(
    dados.titulo,
    Number(dados.disciplinaId),
  );
  if (tituloExistente) {
    throw new Error("Já existe uma aula com este título nesta disciplina.");
  }

  return await repository.create({
    ...dados,
    disciplinaId: Number(dados.disciplinaId),
  });
}

export async function update(
  id: number,
  dados: AulaDTO,
): Promise<AulaSemBinario> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Aula não encontrada.");
  }

  const tituloExistente = await repository.getByTituloAndDisciplina(
    dados.titulo,
    Number(dados.disciplinaId),
  );
  if (tituloExistente && tituloExistente.id !== id) {
    throw new Error("Já existe outra aula com este título nesta disciplina.");
  }

  return await repository.update(id, {
    ...dados,
    disciplinaId: Number(dados.disciplinaId),
  });
}

export async function remove(id: number): Promise<void> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Aula não encontrada.");
  }
  await repository.remove(id);
}

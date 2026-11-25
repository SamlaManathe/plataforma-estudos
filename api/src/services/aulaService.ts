import type { Aula } from "../generated/prisma/client.js";
import type { AulaDTO } from "@plataforma-estudos/shared/aula";
import * as repository from "../repositories/aulaRepository.js";
import * as disciplinaRepository from "../repositories/disciplinaRepository.js";

type AulaSemPDF = Omit<Aula, "pdfArquivo">;

export async function getAll(): Promise<Aula[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<Aula | null> {
  return await repository.getOne(id);
}

export async function getPdf(id: number) {
  return await repository.getPdf(id);
}

type ArquivoPDF = {
  nome: string;
  arquivo: Buffer;
};  // transferir para outro lugar (no zod, talvez)

export async function create(
  dados: AulaDTO,
  pdf?: ArquivoPDF,
): Promise<AulaSemPDF> {
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

  return await repository.create(
    {
      ...dados,
      disciplinaId: Number(dados.disciplinaId),
    },
    pdf,
  );
}

export async function update(
  id: number,
  dados: AulaDTO,
  pdf?: ArquivoPDF,
): Promise<AulaSemPDF> {
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

  return await repository.update(
    id,
    {
      ...dados,
      disciplinaId: Number(dados.disciplinaId),
    },
    pdf,
  );
}

export async function remove(id: number): Promise<void> {
  const existente = await repository.getOne(id);
  if (!existente) {
    throw new Error("Aula não encontrada.");
  }
  await repository.remove(id);
}

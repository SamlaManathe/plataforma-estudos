import { prisma } from "../config/prisma.js";
import type { QuestaoDTO } from "../types/dtos.js";

export async function getAll() {
  return await prisma.questao.findMany({
    include: { alternativas: { orderBy: { letra: "asc" } } },
    orderBy: { numeroQuestao: "asc" },
  });
}

export async function getOne(id: number) {
  return await prisma.questao.findUnique({
    where: { id },
    include: { alternativas: { orderBy: { letra: "asc" } } },
  });
}

export async function getByAulaAndNumero(
  aulaId: number,
  numeroQuestao: number,
) {
  return await prisma.questao.findFirst({
    where: { aulaId, numeroQuestao },
  });
}

export async function create(data: QuestaoDTO) {
  return await prisma.questao.create({
    data,
    include: { alternativas: true },
  });
}

export async function update(id: number, data: QuestaoDTO) {
  return await prisma.questao.update({
    where: { id },
    data,
    include: { alternativas: true },
  });
}

export async function remove(id: number) {
  return await prisma.questao.delete({ where: { id } });
}

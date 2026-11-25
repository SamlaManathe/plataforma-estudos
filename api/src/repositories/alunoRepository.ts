import { prisma } from "../config/prisma.js";
import type { AlunoDTO, CadastroAlunoDTO } from "@plataforma-estudos/shared/aluno";

export async function getAll() {
  return await prisma.aluno.findMany();
}

export async function getOne(id: number) {
  return await prisma.aluno.findUnique({ where: { id } });
}

export async function getByEmail(email: string) {
  return await prisma.aluno.findUnique({ where: { email } });
}

export async function getByTelephone(telefone: string) {
  return await prisma.aluno.findUnique({ where: { telefone } });
}

export async function getByEmailAndPassword(email: string) {
  return await prisma.aluno.findUnique({
    where: { email },
    omit: { senha: false },
  });
}

export async function create(data: CadastroAlunoDTO) {
  return await prisma.aluno.create({ data });
}

export async function update(id: number, data: Partial<CadastroAlunoDTO>) {
  return await prisma.aluno.update({ where: { id }, data });
}

export async function remove(id: number) {
  return await prisma.aluno.delete({ where: { id } });
}

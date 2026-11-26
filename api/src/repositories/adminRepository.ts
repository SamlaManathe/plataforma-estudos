import { prisma } from "../config/prisma.js";
import type { AdminDTO, CadastroAdminDTO } from "@plataforma-estudos/shared/admin";

export async function getAll() {
  return await prisma.admin.findMany();
}

export async function getOne(id: number) {
  return await prisma.admin.findUnique({ where: { id } });
}

export async function getByEmail(email: string) {
  return await prisma.admin.findUnique({ where: { email } });
}

export async function getByTelephone(telefone: string) {
  return await prisma.admin.findUnique({ where: { telefone } });
}

export async function getByEmailAndPassword(email: string, senha: string) {
  return await prisma.admin.findUnique({
    where: { email },
    omit: { senha: false },
  });
}

export async function create(data: CadastroAdminDTO) {
  return await prisma.admin.create({ data });
}

export async function update(id: number, data: Partial<CadastroAdminDTO>) {
  return await prisma.admin.update({ where: { id }, data });
}

export async function remove(id: number) {
  return await prisma.admin.delete({ where: { id } });
}

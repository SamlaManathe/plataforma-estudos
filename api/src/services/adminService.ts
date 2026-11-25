import bcrypt from "bcryptjs";
import type { Admin as AdminPrisma } from "../generated/prisma/client.js";
import type { AdminDTO } from "../types/dtos.js";
import * as repository from "../repositories/adminRepository.js";

type Admin = Omit<AdminPrisma, "senha">;
const SALT_ROUNDS = 10;

export async function getAll(): Promise<Admin[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<Admin | null> {
  return await repository.getOne(id);
}

export async function create(dados: AdminDTO): Promise<Admin> {
  // Verificações de erro
  const emailExistente = await repository.getByEmail(dados.email);
  if (emailExistente) {
    throw new Error("Já existe um admin cadastrado com este email.");
  }

  const telefoneExistente = await repository.getByTelephone(dados.telefone);
  if (telefoneExistente) {
    throw new Error("Já existe um admin cadastrado com este telefone.");
  }

  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  return await repository.create({ ...dados, senha: senhaHash });
}

export async function update(id: number, dados: AdminDTO): Promise<Admin> {
  // Verificações de erro
  const adminExistente = await repository.getOne(id);
  if (!adminExistente) {
    throw new Error("Admin não encontrado.");
  }

  const emailExistente = await repository.getByEmail(dados.email);
  if (emailExistente && emailExistente.id !== id) {
    throw new Error("Já existe um admin cadastrado com este email.");
  }

  const telefoneExistente = await repository.getByTelephone(dados.telefone);
  if (telefoneExistente && telefoneExistente.id !== id) {
    throw new Error("Já existe um admin cadastrado com este telefone.");
  }

  const dadosAtualizados: Partial<AdminDTO> = { ...dados };
  if (dados.senha) {
    dadosAtualizados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  }

  return await repository.update(id, dadosAtualizados);
}

export async function remove(id: number): Promise<void> {
  // Verificações de erro
  const adminExistente = await repository.getOne(id);
  if (!adminExistente) {
    throw new Error("Admin não encontrado.");
  }
  await repository.remove(id);
}

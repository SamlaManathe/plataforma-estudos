import bcrypt from "bcryptjs";
import type { Aluno as AlunoPrisma } from "../generated/prisma/client.js";
import type { AlunoDTO, CadastroAlunoDTO } from "@plataforma-estudos/shared/aluno";
import * as repository from "../repositories/alunoRepository.js";

type Aluno = Omit<AlunoPrisma, "senha">;
const SALT_ROUNDS = 10;

export async function getAll(): Promise<Aluno[]> {
  return await repository.getAll();
}

export async function getOne(id: number): Promise<Aluno | null> {
  return await repository.getOne(id);
}

export async function create(dados: CadastroAlunoDTO): Promise<Aluno> {
  // Verificações de erro
  const emailExistente = await repository.getByEmail(dados.email);
  if (emailExistente) {
    throw new Error("Já existe um aluno cadastrado com este email.");
  }

  const telefoneExistente = await repository.getByTelephone(dados.telefone);
  if (telefoneExistente) {
    throw new Error("Já existe um aluno cadastrado com este telefone.");
  }

  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  return await repository.create({ ...dados, senha: senhaHash });
}

export async function update(id: number, dados: CadastroAlunoDTO): Promise<Aluno> {
  // Verificações de erro
  const alunoExistente = await repository.getOne(id);
  if (!alunoExistente) {
    throw new Error("Aluno não encontrado.");
  }

  const emailExistente = await repository.getByEmail(dados.email);
  if (emailExistente && emailExistente.id !== id) {
    throw new Error("Já existe um aluno cadastrado com este email.");
  }

  const telefoneExistente = await repository.getByTelephone(dados.telefone);
  if (telefoneExistente && telefoneExistente.id !== id) {
    throw new Error("Já existe um aluno cadastrado com este telefone.");
  }

  const dadosAtualizados: Partial<CadastroAlunoDTO> = { ...dados };
  if (dados.senha) {
    dadosAtualizados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  }

  return await repository.update(id, dadosAtualizados);
}

export async function remove(id: number): Promise<void> {
  // Verificações de erro
  const alunoExistente = await repository.getOne(id);
  if (!alunoExistente) {
    throw new Error("Aluno não encontrado.");
  }
  await repository.remove(id);
}

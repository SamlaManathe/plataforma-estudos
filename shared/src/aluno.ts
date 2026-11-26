import { z } from "zod";

export const alunoSchema = z.object({
  nome: z
    .string({ error: "O nome é obrigatório" })
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .meta({ example: "Maria Oliveira" }),

  telefone: z
    .string({ error: "O telefone é obrigatório" })
    .min(10, "O telefone deve ter pelo menos 10 dígitos")
    .max(15, "O telefone deve ter no máximo 15 dígitos")
    .meta({ example: "83999998888" }),

  email: z
    .string({ error: "O email é obrigatório" })
    .email("Digite um e-mail válido")
    .meta({ example: "aluno@example.com" }),
});

export const cadastroAlunoSchema = alunoSchema.extend({
  senha: z
    .string({ error: "A senha é obrigatória" })
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres")
    .meta({ example: "senhaForte123#" }),
});

export const atualizarAlunoSchema = alunoSchema.extend({
  senha: z
    .string({ error: "A senha deve ser um texto" })
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres")
    .optional()
    .or(z.literal(""))
    .meta({ example: "novaSenha123#" }),
});

export type AlunoDTO = z.infer<typeof alunoSchema>;
export type CadastroAlunoDTO = z.infer<typeof cadastroAlunoSchema>;
export type AtualizarAlunoDTO = z.infer<typeof atualizarAlunoSchema>;

// Formato que a API devolve (sem senha)
export type Aluno = AlunoDTO & { id: number };
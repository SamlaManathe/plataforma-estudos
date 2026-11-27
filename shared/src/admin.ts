import { z } from "zod";

export const adminSchema = z.object({
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
    .preprocess(
      (valor) => (typeof valor === "string" ? valor.trim() : valor),
      z
        .string({ error: "E-mail é obrigatório" })
        .min(1, "E-mail é obrigatório")
        .pipe(z.email("E-mail com formato inválido")),
    )
    .meta({ example: "admin@example.com" }),
});

export const cadastroAdminSchema = adminSchema.extend({
  senha: z
    .string({ error: "A senha é obrigatória" })
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres")
    .meta({ example: "senhaForte123#" }),
});

export const atualizarAdminSchema = adminSchema.extend({
  senha: z
    .string({ error: "A senha deve ser um texto" })
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres")
    .optional()
    .or(z.literal(""))
    .meta({ example: "novaSenha123#" }),
});

export type AdminDTO = z.infer<typeof adminSchema>;
export type CadastroAdminDTO = z.infer<typeof cadastroAdminSchema>;
export type AtualizarAdminDTO = z.infer<typeof atualizarAdminSchema>;

// Formato que a API devolve (sem senha)
export type Admin = AdminDTO & {
  id: number;
  aprovado: boolean;
}; 
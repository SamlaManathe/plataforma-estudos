import { z } from "zod";

export const disciplinaSchema = z.object({
  nome: z
    .string({ error: "O nome da disciplina é obrigatório" })
    .min(1, "O nome deve ter pelo menos 1 caractere")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .meta({ example: "Anatomia" }),
});

export type DisciplinaDTO = z.infer<typeof disciplinaSchema>;
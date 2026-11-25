import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "O email é obrigatório" })
    .meta({ example: "usuario@example.com" }),

  senha: z
    .string({ error: "A senha é obrigatória" })
    .min(8, "A senha tem que ter 8 dígitos no mínimo")
    .meta({ example: "senhaForte123#" }),
});

export type LoginDTO = z.infer<typeof loginSchema>;
import { z } from "zod";

export const aulaSchema = z.object({
  titulo: z
    .string({ error: "O título da aula é obrigatório" })
    .min(1, "O título deve ter pelo menos 1 caractere")
    .max(50, "O título deve ter no máximo 50 caracteres")
    .meta({ example: "Sistema cardiovascular" }),

  videoUrl: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? null : val),
      z
        .url({ error: "Informe uma URL válida para o vídeo" })
        .nullable()
        .optional(),
    )
    .meta({ example: "https://youtu.be/dQw4w9WgXcQ" }),

  disciplinaId: z.coerce
    .number({ error: "O ID da disciplina é obrigatório" })
    .int("O ID da disciplina deve ser um número inteiro")
    .positive("O ID da disciplina deve ser maior que zero")
    .meta({ example: 1 }),
})

export type AulaDTO = z.infer<typeof aulaSchema>;
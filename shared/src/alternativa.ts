import { z } from "zod";

export const alternativaSchema = z.object({
  letra: z
    .enum(["A", "B", "C", "D", "E"], {
      error: "A letra deve ser A, B, C, D ou E",
    })
    .meta({ example: "A" }),

  correta: z
    .boolean({ error: "Informe se a alternativa está correta" })
    .meta({ example: false }),

  texto: z
    .string({ error: "O texto da alternativa é obrigatório" })
    .min(1, "O texto deve ter pelo menos 1 caractere")
    .max(500, "O texto deve ter no máximo 500 caracteres")
    .meta({ example: "Fêmur, na coxa." }),

  questaoId: z
    .number({ error: "O ID da questão é obrigatório" })
    .int("O ID da questão deve ser um número inteiro")
    .positive("O ID da questão deve ser maior que zero")
    .meta({ example: 1 }),
});

export type AlternativaDTO = z.infer<typeof alternativaSchema>;
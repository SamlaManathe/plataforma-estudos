import { z } from "zod";

export const questaoSchema = z.object({
  numeroQuestao: z
    .number({ error: "O número da questão é obrigatório" })
    .int("O número da questão deve ser um número inteiro")
    .positive("O número da questão deve ser maior que zero")
    .meta({ example: 1 }),

  textoQuestao: z
    .string({ error: "O texto da questão é obrigatório" })
    .min(1, "O texto deve ter pelo menos 1 caractere")
    .max(1000, "O texto deve ter no máximo 1000 caracteres")
    .meta({ example: "Qual é o maior osso do corpo humano e onde ele se localiza?" }),

  aulaId: z
    .number({ error: "O ID da aula é obrigatório" })
    .int("O ID da aula deve ser um número inteiro")
    .positive("O ID do aula deve ser maior que zero")
    .meta({ example: 1 }),
});

export type QuestaoDTO = z.infer<typeof questaoSchema>;
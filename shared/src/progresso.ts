import { z } from "zod";

export const itemRespostaSchema = z.object({
  questaoId: z
    .number({ error: "O ID da questão é obrigatório" })
    .int("O ID da questão deve ser um número inteiro")
    .positive("O ID da questão deve ser positivo")
    .meta({ example: 1 }),

  alternativaId: z
    .number({ error: "Selecione uma alternativa" })
    .int("O ID da alternativa deve ser um número inteiro")
    .positive("Selecione uma alternativa válida")
    .meta({ example: 3 }),
});

export const enviarRespostasAulaSchema = z.object({
  alunoId: z
    .number({ error: "O ID do aluno é obrigatório" })
    .int("O ID do aluno deve ser um número inteiro")
    .positive("O ID do aluno deve ser positivo")
    .meta({ example: 1 }),

  aulaId: z
    .number({ error: "O ID da aula é obrigatório" })
    .int("O ID da aula deve ser um número inteiro")
    .positive("O ID da aula deve ser positivo")
    .meta({ example: 1 }),

  respostas: z
    .array(itemRespostaSchema, { error: "As respostas são obrigatórias" })
    .min(1, "Responda pelo menos uma questão antes de enviar"),
});

export const marcarAulaAssistidaSchema = z.object({
  alunoId: z
    .number({ error: "O ID do aluno é obrigatório" })
    .int("O ID do aluno deve ser um número inteiro")
    .positive("O ID do aluno deve ser positivo")
    .meta({ example: 1 }),

  aulaId: z
    .number({ error: "O ID da aula é obrigatório" })
    .int("O ID da aula deve ser um número inteiro")
    .positive("O ID da aula deve ser positivo")
    .meta({ example: 1 }),
});

export type ItemRespostaDTO = z.infer<typeof itemRespostaSchema>;
export type EnviarRespostasAulaDTO = z.infer<typeof enviarRespostasAulaSchema>;
export type MarcarAulaAssistidaDTO = z.infer<typeof marcarAulaAssistidaSchema>;
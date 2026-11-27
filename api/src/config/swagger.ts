import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  adminSchema,
  cadastroAdminSchema,
  atualizarAdminSchema,
} from "@plataforma-estudos/shared/admin";
import {
  alunoSchema,
  cadastroAlunoSchema,
  atualizarAlunoSchema,
} from "@plataforma-estudos/shared/aluno";
import { loginSchema } from "@plataforma-estudos/shared/login";
import { disciplinaSchema } from "@plataforma-estudos/shared/disciplina";
import { aulaSchema } from "@plataforma-estudos/shared/aula";
import { questaoSchema } from "@plataforma-estudos/shared/questao";
import { alternativaSchema } from "@plataforma-estudos/shared/alternativa";
import {
  enviarRespostasAulaSchema,
  marcarAulaAssistidaSchema,
} from "@plataforma-estudos/shared/progresso";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Schemas de resposta e erro padrão
const idParamSchema = z.object({
  id: z.coerce.number().openapi({ example: 1, description: "ID numérico do registro" }),
});

const alunoIdParamSchema = z.object({
  alunoId: z.coerce.number().openapi({ example: 1, description: "ID numérico do aluno" }),
});

const erroValidacaoSchema = z.object({
  status: z.string().openapi({ example: "erro_validacao" }),
  mensagem: z.string().openapi({ example: "Os dados enviados são inválidos" }),
  detalhes: z.array(
    z.object({
      campo: z.string().openapi({ example: "nome" }),
      mensagem: z.string().openapi({ example: "O nome é obrigatório" }),
    })
  ),
});

const erroSimplesSchema = z.object({
  mensagem: z.string().openapi({ example: "Registro não encontrado ou dado duplicado" }),
});

// Helper para registrar CRUD padrão das entidades
function registrarCrud(
  tag: string,
  rotaBase: string,
  createSchema: z.ZodTypeAny,
  updateSchema: z.ZodTypeAny,
  responseSchema: z.ZodTypeAny
) {
  registry.registerPath({
    method: "get",
    path: rotaBase,
    tags: [tag],
    summary: `Listar ${tag.toLowerCase()}`,
    responses: {
      200: {
        description: "Lista retornada com sucesso",
        content: { "application/json": { schema: z.array(responseSchema) } },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: `${rotaBase}/{id}`,
    tags: [tag],
    summary: `Buscar ${tag.toLowerCase()} por ID`,
    request: { params: idParamSchema },
    responses: {
      200: {
        description: "Registro encontrado",
        content: { "application/json": { schema: responseSchema } },
      },
      404: {
        description: "Registro não encontrado",
        content: { "application/json": { schema: erroSimplesSchema } },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: rotaBase,
    tags: [tag],
    summary: `Criar ${tag.toLowerCase()}`,
    request: {
      body: { content: { "application/json": { schema: createSchema } } },
    },
    responses: {
      201: {
        description: "Criado com sucesso",
        content: { "application/json": { schema: responseSchema } },
      },
      400: {
        description: "Erro de validação ou dado único duplicado",
        content: { "application/json": { schema: erroValidacaoSchema } },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: `${rotaBase}/{id}`,
    tags: [tag],
    summary: `Atualizar ${tag.toLowerCase()}`,
    request: {
      params: idParamSchema,
      body: { content: { "application/json": { schema: updateSchema } } },
    },
    responses: {
      200: {
        description: "Atualizado com sucesso",
        content: { "application/json": { schema: responseSchema } },
      },
      400: {
        description: "Erro de validação",
        content: { "application/json": { schema: erroValidacaoSchema } },
      },
      404: {
        description: "Registro não encontrado",
        content: { "application/json": { schema: erroSimplesSchema } },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: `${rotaBase}/{id}`,
    tags: [tag],
    summary: `Remover ${tag.toLowerCase()}`,
    request: { params: idParamSchema },
    responses: {
      204: { description: "Removido com sucesso (sem conteúdo)" },
      404: {
        description: "Registro não encontrado",
        content: { "application/json": { schema: erroSimplesSchema } },
      },
    },
  });
}

// 1. Autenticação
registry.registerPath({
  method: "post",
  path: "/login",
  tags: ["Autenticação"],
  summary: "Login de usuário (Admin ou Aluno)",
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: {
      description: "Login realizado com sucesso (retorna dados sem senha)",
      content: {
        "application/json": {
          schema: adminSchema.extend({ id: z.number(), tipo: z.enum(["ADMIN", "ALUNO"]) }),
        },
      },
    },
    400: {
      description: "Erro de validação nos campos",
      content: { "application/json": { schema: erroValidacaoSchema } },
    },
    401: {
      description: "E-mail ou senha inválidos",
      content: { "application/json": { schema: erroSimplesSchema } },
    },
    403: {
      description: "Cadastro de administrador aguardando aprovação",
      content: { "application/json": { schema: erroSimplesSchema } },
    },
  },
});

// 2. CRUDs das tabelas
const adminResponseSchema = adminSchema.extend({
  id: z.number(),
  aprovado: z.boolean(),
});

registrarCrud("Admins", "/admins", cadastroAdminSchema, atualizarAdminSchema, adminResponseSchema);

registry.registerPath({
  method: "patch",
  path: "/admins/{id}/aprovar",
  tags: ["Admins"],
  summary: "Aprovar cadastro de administrador pendente",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Administrador aprovado com sucesso",
      content: { "application/json": { schema: adminResponseSchema } },
    },
    404: {
      description: "Administrador não encontrado",
      content: { "application/json": { schema: erroSimplesSchema } },
    },
  },
});

registrarCrud(
  "Alunos",
  "/alunos",
  cadastroAlunoSchema,
  atualizarAlunoSchema,
  alunoSchema.extend({ id: z.number() })
);

registrarCrud(
  "Disciplinas",
  "/disciplinas",
  disciplinaSchema,
  disciplinaSchema,
  disciplinaSchema.extend({ id: z.number() })
);

registrarCrud(
  "Aulas",
  "/aulas",
  aulaSchema,
  aulaSchema,
  aulaSchema.extend({ id: z.number(), pdfNome: z.string().nullable().optional() })
);

registry.registerPath({
  method: "get",
  path: "/aulas/{id}/pdf",
  tags: ["Aulas"],
  summary: "Baixar/visualizar PDF anexado na aula",
  request: { params: idParamSchema },
  responses: {
    200: { description: "Arquivo PDF da aula" },
    404: { description: "Aula ou PDF não encontrado", content: { "application/json": { schema: erroSimplesSchema } } },
  },
});

registrarCrud(
  "Questões",
  "/questoes",
  questaoSchema,
  questaoSchema,
  questaoSchema.extend({ id: z.number() })
);

registrarCrud(
  "Alternativas",
  "/alternativas",
  alternativaSchema,
  alternativaSchema,
  alternativaSchema.extend({ id: z.number() })
);

// 3. Rotas de Progresso e Relatório
registry.registerPath({
  method: "post",
  path: "/progresso/responder-aula",
  tags: ["Progresso"],
  summary: "Enviar respostas das questões de uma aula (trava definitiva)",
  request: {
    body: { content: { "application/json": { schema: enviarRespostasAulaSchema } } },
  },
  responses: {
    201: { description: "Respostas salvas com sucesso" },
    400: { description: "Erro de validação ou questionário já respondido", content: { "application/json": { schema: erroSimplesSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/progresso/assistir-aula",
  tags: ["Progresso"],
  summary: "Marcar aula como assistida pelo aluno",
  request: {
    body: { content: { "application/json": { schema: marcarAulaAssistidaSchema } } },
  },
  responses: {
    201: { description: "Aula marcada como assistida" },
    400: { description: "Erro de validação ou questionário pendente", content: { "application/json": { schema: erroSimplesSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/progresso/aluno/{alunoId}",
  tags: ["Progresso"],
  summary: "Obter resumo geral e porcentagens de acertos/aulas do aluno",
  request: { params: alunoIdParamSchema },
  responses: {
    200: { description: "Dashboard de progresso do aluno" },
    404: { description: "Aluno não encontrado", content: { "application/json": { schema: erroSimplesSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/progresso/admin/relatorio",
  tags: ["Progresso"],
  summary: "Relatório de acertos e erros por aluno para o professor (Admin)",
  responses: {
    200: { description: "Relatório detalhado dos alunos" },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "API Plataforma de Estudos",
    version: "1.0.0",
    description:
      "Documentação completa da API de Disciplinas, Aulas, Questões, Alternativas, Alunos, Admins e Progresso",
  },
});
# Plataforma de Estudos

**Vídeo de apresentação:** [COLE AQUI O LINK DO YOUTUBE NÃO LISTADO OU GOOGLE DRIVE]

## Integrantes do Grupo

- **Daniel Tavares dos Santos** — RGM: `44009348`
- **Davi Guedes Fragoso Vieira** — RGM: `44055340`
- **Samla Manathe de Souza Domingos** — RGM: `43663257`
- **Samuel Victor Gomes de Melo** — RGM: `[00000000]`

## Sobre o Projeto e Estrutura do Banco

Sistema web de ambiente virtual de aprendizagem desenvolvido em monorepo TypeScript (`shared`, `api` e `frontend`), permitindo que administradores gerenciem disciplinas, aulas (vídeo e PDF), questionários e acompanhem o desempenho dos alunos, enquanto estudantes assistem às aulas, respondem às questões e visualizam seus indicadores de progresso.

### Tabelas e Relacionamentos (Prisma / PostgreSQL)

- **`admins` (`Admin`):** Professores/administradores com aprovação de acesso (`email` e `telefone` `@unique`).
- **`alunos` (`Aluno`):** Estudantes cadastrados (`email` e `telefone` `@unique`).
- **`disciplinas` (`Disciplina`):** Matérias da plataforma (`nome` `@unique`), possui várias aulas (`1:N`).
- **`aulas` (`Aula`):** Pertence a uma `Disciplina` (`N:1`), armazena link de vídeo, PDF opcional, questões (`1:N`) e registros de conclusão (`1:N`).
- **`questoes` (`Questao`):** Pertence a uma `Aula` (`N:1`) e possui várias alternativas (`1:N`).
- **`alternativas` (`Alternativa`):** Pertence a uma `Questao` (`N:1`), indicando letra, texto e se é a correta.
- **`respostas_alunos` (`RespostaAluno`):** Tabela associativa entre `Aluno`, `Questao` e `Alternativa` (`@@unique([alunoId, questaoId])`).
- **`progresso_aulas` (`ProgressoAula`):** Tabela associativa entre `Aluno` e `Aula` (`@@unique([alunoId, aulaId])`).

## Como Rodar o Projeto do Zero

### Na `raiz`:

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir o banco de dados (PostgreSQL via Docker)

```bash
docker compose up -d
```

### 3. Configurar variáveis de ambiente da API

Copie o arquivo de exemplo para `.env` dentro da pasta `api`:

```bash
cp api/.env.example api/.env
```

### No diretório `api`:

### 4. Rodar as migrations e popular o banco (`seed`)

```bash
//para ir ao diretório api
cd api
```

```bash
npx prisma migrate deploy
[npx prisma generate e npx prisma db push]
npx prisma db seed
```

### 5. Iniciar a API e o Frontend

Em um terminal, na raiz, suba a API (porta `3000` — Swagger em `http://localhost:3000/docs`):

```bash
npm run dev -w api
```

Em outro terminal, suba o Frontend (porta `5173` — acesse `http://localhost:5173`):

```bash
npm run dev -w frontend
```

## Credenciais de Acesso (Seed)

- **Administrador Ativo:** `admin@plataforma.com` | Senha: `Admin@123`
- **Administrador Pendente:** `mariana.admin@plataforma.com` | Senha: `Admin@123`
- **Aluno (com progresso inicial):** `joao.aluno@plataforma.com` | Senha: `Aluno@123`
- **Aluno (sem progresso):** `ana.aluno@plataforma.com` | Senha: `Aluno@123`

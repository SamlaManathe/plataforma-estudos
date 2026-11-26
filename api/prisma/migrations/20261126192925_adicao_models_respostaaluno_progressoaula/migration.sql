-- CreateTable
CREATE TABLE "respostas_alunos" (
    "id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "questao_id" INTEGER NOT NULL,
    "alternativa_id" INTEGER NOT NULL,
    "acertou" BOOLEAN NOT NULL,
    "respondido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso_aulas" (
    "id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "assistida" BOOLEAN NOT NULL DEFAULT true,
    "concluida_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progresso_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "respostas_alunos_aluno_id_questao_id_key" ON "respostas_alunos"("aluno_id", "questao_id");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_aulas_aluno_id_aula_id_key" ON "progresso_aulas"("aluno_id", "aula_id");

-- AddForeignKey
ALTER TABLE "respostas_alunos" ADD CONSTRAINT "respostas_alunos_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_alunos" ADD CONSTRAINT "respostas_alunos_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "questoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_alunos" ADD CONSTRAINT "respostas_alunos_alternativa_id_fkey" FOREIGN KEY ("alternativa_id") REFERENCES "alternativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aulas" ADD CONSTRAINT "progresso_aulas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aulas" ADD CONSTRAINT "progresso_aulas_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

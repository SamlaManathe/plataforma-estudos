/*
  Warnings:

  - Added the required column `atualizado_em` to the `aulas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "aulas" ADD COLUMN     "atualizado_em" TIMESTAMP(3) NOT NULL;

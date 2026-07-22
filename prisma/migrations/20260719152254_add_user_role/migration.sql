/*
  Warnings:

  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('buyer', 'seller');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "role" NOT NULL;

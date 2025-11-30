/*
  Warnings:

  - You are about to drop the column `name` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "category";

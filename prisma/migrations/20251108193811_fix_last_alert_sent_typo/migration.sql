/*
  Warnings:

  - You are about to drop the column `lasrAlertSent` on the `budgets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - Made the column `category` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "lasrAlertSent",
ADD COLUMN     "lastAlertSent" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "receiptUrl" TEXT,
ALTER COLUMN "category" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_key" ON "budgets"("userId");

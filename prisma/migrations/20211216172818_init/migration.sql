/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dislikes` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `likes` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "dislikes" INTEGER NOT NULL,
ADD COLUMN     "likes" INTEGER NOT NULL;

-- DropTable
DROP TABLE "User";

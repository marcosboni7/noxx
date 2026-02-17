-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

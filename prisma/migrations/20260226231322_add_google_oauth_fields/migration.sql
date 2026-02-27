-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_provider" TEXT,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;

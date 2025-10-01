-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('Nuovo', 'Confermato', 'Fatto');

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "createdAt",
DROP COLUMN "date",
DROP COLUMN "userId",
ADD COLUMN     "artistId" INTEGER NOT NULL,
ADD COLUMN     "datetime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" "public"."BookingStatus" NOT NULL DEFAULT 'Nuovo';

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Artist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Work" (
    "id" SERIAL NOT NULL,
    "artistId" INTEGER NOT NULL,
    "title" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Work_artistId_idx" ON "public"."Work"("artistId");

-- CreateIndex
CREATE INDEX "Booking_datetime_idx" ON "public"."Booking"("datetime");

-- CreateIndex
CREATE INDEX "Booking_artistId_datetime_idx" ON "public"."Booking"("artistId", "datetime");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Work" ADD CONSTRAINT "Work_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;


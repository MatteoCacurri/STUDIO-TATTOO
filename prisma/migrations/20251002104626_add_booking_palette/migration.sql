-- CreateEnum
CREATE TYPE "public"."TattooPalette" AS ENUM ('BIANCO_NERO', 'COLORI');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "palette" "public"."TattooPalette" NOT NULL DEFAULT 'COLORI';

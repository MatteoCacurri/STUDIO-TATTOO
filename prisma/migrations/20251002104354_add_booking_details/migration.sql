-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "bodyImage" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skinTone" TEXT;

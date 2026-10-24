-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('BILLBOARD', 'LED_SCREEN', 'WALL_MURAL', 'CITY_FORMAT');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('ACTIVE', 'PENDING_REVIEW', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PlacementType" NOT NULL DEFAULT 'BILLBOARD',
    "status" "PlacementStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "lighting" BOOLEAN NOT NULL DEFAULT false,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Placement_vendorId_idx" ON "Placement"("vendorId");

-- CreateIndex
CREATE INDEX "Placement_status_idx" ON "Placement"("status");

-- CreateIndex
CREATE INDEX "Placement_city_idx" ON "Placement"("city");

-- CreateIndex
CREATE INDEX "Placement_latitude_longitude_idx" ON "Placement"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

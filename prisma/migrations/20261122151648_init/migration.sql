-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_INVESTIGATION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ConstructionSite" (
    "site_id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "site_name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstructionSite_pkey" PRIMARY KEY ("site_id")
);

-- CreateTable
CREATE TABLE "DroneSurvey" (
    "survey_id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "survey_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "survey_status" "SurveyStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,

    CONSTRAINT "DroneSurvey_pkey" PRIMARY KEY ("survey_id")
);

-- CreateTable
CREATE TABLE "Report" (
    "report_id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "survey_id" INTEGER,
    "description" TEXT NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Report_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "investigation_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "investigation_date" TIMESTAMP(3),
    "investigation_notes" TEXT,
    "investigation_status" "InvestigationStatus" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("investigation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investigation_report_id_key" ON "Investigation"("report_id");

-- AddForeignKey
ALTER TABLE "DroneSurvey" ADD CONSTRAINT "DroneSurvey_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "ConstructionSite"("site_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "ConstructionSite"("site_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "DroneSurvey"("survey_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("report_id") ON DELETE RESTRICT ON UPDATE CASCADE;

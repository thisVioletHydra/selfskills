-- Drop goals from Profile; add ProfileLocale and Resume.

ALTER TABLE "Profile" DROP COLUMN "goals";

CREATE TABLE "ProfileLocale" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "about" JSONB NOT NULL,

    CONSTRAINT "ProfileLocale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileLocale_locale_key" ON "ProfileLocale"("locale");

CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "experienceYears" TEXT NOT NULL,
    "education" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "jobs" JSONB NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Resume_locale_key" ON "Resume"("locale");

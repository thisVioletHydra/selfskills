-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'main',
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "portrait" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "goals" JSONB NOT NULL,
    "about" JSONB NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");

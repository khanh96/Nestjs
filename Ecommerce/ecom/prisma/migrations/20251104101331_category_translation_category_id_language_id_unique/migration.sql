-- This is an empty migration.-- Create index on CategoryTranslation(categoryId, languageId)
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_languageId_unique"
ON "CategoryTranslation" ("categoryId", "languageId") WHERE "deletedAt" IS NULL;

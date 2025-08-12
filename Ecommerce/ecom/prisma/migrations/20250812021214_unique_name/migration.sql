-- DropIndex
DROP INDEX "Role_name_key";

-- This is an empty migration.
CREATE UNIQUE INDEX role_name_unique ON "Role" (name)
WHERE
    "name" IS NOT NULL;
    
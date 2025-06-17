-- This is an empty migration.
CREATE UNIQUE INDEX permission_path_method_unique ON "Permission" (path, method)
WHERE
    "path" IS NOT NULL
    AND "method" IS NOT NULL;
    
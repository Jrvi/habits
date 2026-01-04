-- Best-effort rollback for the fix migration.

ALTER TABLE users ALTER COLUMN public_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN public_id DROP DEFAULT;
DROP INDEX IF EXISTS users_public_id_key;

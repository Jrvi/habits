-- Ensures users.public_id exists and is populated for legacy rows.
-- Safe to run even if previous migration partially ran.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS public_id uuid;

UPDATE users
SET public_id = gen_random_uuid()
WHERE public_id IS NULL;

ALTER TABLE users
  ALTER COLUMN public_id SET DEFAULT gen_random_uuid();

ALTER TABLE users
  ALTER COLUMN public_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_public_id_key ON users(public_id);

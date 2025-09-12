CREATE TABLE IF NOT EXISTS habits (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  user_id bigint NOT NULL,
  impact text NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

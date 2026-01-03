CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token varchar(64) PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expiry timestamp(0) with time zone NOT NULL,
  used_at timestamp(0) with time zone,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expiry_idx ON password_reset_tokens(expiry);

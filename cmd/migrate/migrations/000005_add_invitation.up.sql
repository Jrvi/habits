CREATE TABLE IF NOT EXISTS user_invitations (
    token bytea PRIMARY KEY,
    user_id bigint NOT NULL,
    expiry timestamp(0) WITH TIME ZONE NOT NULL
);

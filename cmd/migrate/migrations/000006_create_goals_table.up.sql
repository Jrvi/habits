CREATE TABLE IF NOT EXISTS goals (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year int NOT NULL,
    category varchar(50) NOT NULL,
    description text NOT NULL,
    completed boolean DEFAULT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, year, category)
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_year ON goals(year);
CREATE INDEX IF NOT EXISTS idx_goals_user_year ON goals(user_id, year);

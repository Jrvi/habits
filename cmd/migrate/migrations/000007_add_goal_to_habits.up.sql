ALTER TABLE habits ADD COLUMN goal_id bigint REFERENCES goals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_habits_goal_id ON habits(goal_id);

package store

import (
	"context"
	"database/sql"
  "errors"
)

type habitKey string

const postCtxKey habitKey = "habit"

type Habit struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Impact string `json:"impact"`
  Created_at string `json:"created_at"`
  Updated_at string `json:"updated_at"`
}

type HabitStore struct {
  db *sql.DB
}

func (s *HabitStore) Create(ctx context.Context, habit *Habit) error {
  query := `
    INSERT INTO habits (name, impact)
    VALUES  ($1, $2) RETURNING id, created_at, updated_at
  `

  ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
  defer cancel()

  err := s.db.QueryRowContext(ctx, query, habit.Name, habit.Impact).Scan(
    &habit.ID,
    &habit.Created_at,
    &habit.Updated_at,
  )
  
  if err != nil {
    return  err
  }

  return nil
}

func (s *HabitStore) GetByID(ctx context.Context, id int64) (*Habit, error) {
  query := `
    SELECT id, name, impact, created_at, updated_at
    FROM habits
    WHERE id = $1
  `

  ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
  defer cancel()

  var habit Habit

  err := s.db.QueryRowContext(ctx, query, id).Scan(
    &habit.ID,
    &habit.Name,
    &habit.Impact,
    &habit.Created_at,
    &habit.Updated_at,
  )

  if err != nil {
    switch {
      case errors.Is(err, sql.ErrNoRows):
        return nil, ErrNotFound
      default:
        return nil, err
    }
  }

  return &habit, nil
}

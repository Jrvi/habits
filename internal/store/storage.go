package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrNotFound          = errors.New("resource not found")
	ErrConflict          = errors.New("resource conflict")
	QueryTimeoutDuration = time.Second * 5
)

type Storage struct {
	Habits interface {
		Create(ctx context.Context, habit *Habit) error
		GetByID(ctx context.Context, id int64) (*Habit, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
    Habits: &HabitStore{db},
  }
}

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
		Delete(ctx context.Context, id int64) error
		Update(ctx context.Context, habit *Habit) error
		GetUserFeed(ctx context.Context, userID int64, fg PaginatedFeedQuery) ([]Habit, error)
	}
	Users interface {
		Create(ctx context.Context, tx *sql.Tx, user *User) error
		GetByID(ctx context.Context, userID int64) (*User, error)
		CreateAndInvite(ctx context.Context, user *User, token string, invitationExp time.Duration) error
		Activate(ctx context.Context, token string) error
		Delete(ctx context.Context, userID int64) error
		GetByEmail(ctx context.Context, email string) (*User, error)
	}
	Goals interface {
		Create(ctx context.Context, goal *Goal) error
		GetByID(ctx context.Context, id int64) (*Goal, error)
		GetByUserAndYear(ctx context.Context, userID int64, year int) ([]Goal, error)
		Update(ctx context.Context, goal *Goal) error
		Delete(ctx context.Context, id int64, userID int64) error
	}
	HabitCompletions interface {
		MarkComplete(ctx context.Context, habitID, userID int64, date time.Time) (*HabitCompletion, error)
		UnmarkComplete(ctx context.Context, habitID int64, date time.Time) error
		GetByHabitAndDate(ctx context.Context, habitID int64, date time.Time) (*HabitCompletion, error)
		GetCompletionsByHabit(ctx context.Context, habitID int64, startDate, endDate time.Time) ([]HabitCompletion, error)
		GetCompletionsByUser(ctx context.Context, userID int64, startDate, endDate time.Time) ([]HabitCompletion, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Habits:           &HabitStore{db},
		Users:            &UserStore{db},
		Goals:            &GoalStore{db},
		HabitCompletions: &HabitCompletionStore{db},
	}
}

func withTx(db *sql.DB, ctx context.Context, fn func(*sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}

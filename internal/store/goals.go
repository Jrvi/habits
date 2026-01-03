package store

import (
	"context"
	"database/sql"
	"time"
)

type Goal struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	Year        int       `json:"year"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Completed   *bool     `json:"completed"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type GoalStore struct {
	db *sql.DB
}

func (s *GoalStore) Create(ctx context.Context, goal *Goal) error {
	query := `
		INSERT INTO goals (user_id, year, category, description, completed)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	return s.db.QueryRowContext(
		ctx,
		query,
		goal.UserID,
		goal.Year,
		goal.Category,
		goal.Description,
		goal.Completed,
	).Scan(&goal.ID, &goal.CreatedAt, &goal.UpdatedAt)
}

func (s *GoalStore) GetByID(ctx context.Context, id int64) (*Goal, error) {
	query := `
		SELECT id, user_id, year, category, description, completed, created_at, updated_at
		FROM goals
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	goal := &Goal{}
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&goal.ID,
		&goal.UserID,
		&goal.Year,
		&goal.Category,
		&goal.Description,
		&goal.Completed,
		&goal.CreatedAt,
		&goal.UpdatedAt,
	)

	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return goal, nil
}

func (s *GoalStore) GetByUserAndYear(ctx context.Context, userID int64, year int) ([]Goal, error) {
	query := `
		SELECT id, user_id, year, category, description, completed, created_at, updated_at
		FROM goals
		WHERE user_id = $1 AND year = $2
		ORDER BY category
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	goals := []Goal{}
	for rows.Next() {
		var goal Goal
		err := rows.Scan(
			&goal.ID,
			&goal.UserID,
			&goal.Year,
			&goal.Category,
			&goal.Description,
			&goal.Completed,
			&goal.CreatedAt,
			&goal.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		goals = append(goals, goal)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return goals, nil
}

func (s *GoalStore) Update(ctx context.Context, goal *Goal) error {
	query := `
		UPDATE goals
		SET description = $1, completed = $2, updated_at = NOW()
		WHERE id = $3 AND user_id = $4
		RETURNING updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		goal.Description,
		goal.Completed,
		goal.ID,
		goal.UserID,
	).Scan(&goal.UpdatedAt)

	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return ErrNotFound
		default:
			return err
		}
	}

	return nil
}

func (s *GoalStore) Delete(ctx context.Context, id int64, userID int64) error {
	query := `DELETE FROM goals WHERE id = $1 AND user_id = $2`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	result, err := s.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrNotFound
	}

	return nil
}

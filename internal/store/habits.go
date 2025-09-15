package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type habitKey string

const postCtxKey habitKey = "habit"

type Habit struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	UserID     int64  `json:"user_id"`
	Impact     string `json:"impact"`
	Created_at string `json:"created_at"`
	Updated_at string `json:"updated_at"`
	Version    int    `json:"version"`
	User       User   `json:"user"`
}

type HabitStore struct {
	db *sql.DB
}

func (s *HabitStore) Create(ctx context.Context, habit *Habit) error {
	query := `
    INSERT INTO habits (name, impact, user_id)
    VALUES  ($1, $2, $3) RETURNING id, created_at, updated_at
  `

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(ctx, query, habit.Name, habit.Impact, habit.UserID).Scan(
		&habit.ID,
		&habit.Created_at,
		&habit.Updated_at,
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *HabitStore) GetByID(ctx context.Context, id int64) (*Habit, error) {
	query := `
    SELECT id, name, impact, created_at, updated_at, version
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
		&habit.Version,
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

func (s *HabitStore) GetUserFeed(ctx context.Context, userID int64, fq PaginatedFeedQuery) ([]Habit, error) {
	query := `
		SELECT h.id,
  		h.name,
      h.user_id,
     	h.impact,
		  h.created_at,
      h.version
		FROM habits h
		WHERE h.user_id = $1
		LIMIT $2 OFFSET $3;
	`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID, fq.Limit, fq.Offset)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var feed []Habit
	for rows.Next() {
		var h Habit
		if err := rows.Scan(
			&h.ID,
			&h.Name,
			&h.UserID,
			&h.Impact,
			&h.Created_at,
			&h.Version,
		); err != nil {
			return nil, err
		}

		feed = append(feed, h)
	}

	return feed, nil
}

func (s *HabitStore) Delete(ctx context.Context, postID int64) error {
	query := `DELETE FROM habits WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	res, err := s.db.ExecContext(ctx, query, postID)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *HabitStore) Update(ctx context.Context, habit *Habit) error {
	query := `
		UPDATE habits
		SET name = $1, impact = $2, version = version + 1
		WHERE id = $3 AND version = $4
		RETURNING version
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(ctx, query, habit.Name, habit.Impact, habit.ID, habit.Version).Scan(&habit.Version)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrNotFound
		default:
			return err
		}
	}

	return nil
}

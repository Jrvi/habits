package store

import (
	"context"
	"database/sql"
	"time"
)

type HabitCompletion struct {
	ID            int64     `json:"id"`
	HabitID       int64     `json:"habit_id"`
	UserID        int64     `json:"user_id"`
	CompletedDate time.Time `json:"completed_date"`
	CreatedAt     time.Time `json:"created_at"`
}

type HabitCompletionStore struct {
	db *sql.DB
}

// MarkComplete merkitsee habitin tehdyksi tietylle päivälle
func (s *HabitCompletionStore) MarkComplete(ctx context.Context, habitID, userID int64, date time.Time) (*HabitCompletion, error) {
	query := `
		INSERT INTO habit_completions (habit_id, user_id, completed_date)
		VALUES ($1, $2, $3)
		ON CONFLICT (habit_id, completed_date) DO NOTHING
		RETURNING id, habit_id, user_id, completed_date, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	completion := &HabitCompletion{}
	err := s.db.QueryRowContext(ctx, query, habitID, userID, date.Format("2006-01-02")).Scan(
		&completion.ID,
		&completion.HabitID,
		&completion.UserID,
		&completion.CompletedDate,
		&completion.CreatedAt,
	)

	if err == sql.ErrNoRows {
		// Already exists, fetch it
		return s.GetByHabitAndDate(ctx, habitID, date)
	}

	if err != nil {
		return nil, err
	}

	return completion, nil
}

// UnmarkComplete poistaa habitin merkinnän tietyltä päivältä
func (s *HabitCompletionStore) UnmarkComplete(ctx context.Context, habitID int64, date time.Time) error {
	query := `
		DELETE FROM habit_completions 
		WHERE habit_id = $1 AND completed_date = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	result, err := s.db.ExecContext(ctx, query, habitID, date.Format("2006-01-02"))
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

// GetByHabitAndDate hakee yksittäisen merkinnän
func (s *HabitCompletionStore) GetByHabitAndDate(ctx context.Context, habitID int64, date time.Time) (*HabitCompletion, error) {
	query := `
		SELECT id, habit_id, user_id, completed_date, created_at
		FROM habit_completions
		WHERE habit_id = $1 AND completed_date = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	completion := &HabitCompletion{}
	err := s.db.QueryRowContext(ctx, query, habitID, date.Format("2006-01-02")).Scan(
		&completion.ID,
		&completion.HabitID,
		&completion.UserID,
		&completion.CompletedDate,
		&completion.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return completion, nil
}

// GetCompletionsByHabit hakee habitin kaikki merkinnät aikaväliltä
func (s *HabitCompletionStore) GetCompletionsByHabit(ctx context.Context, habitID int64, startDate, endDate time.Time) ([]HabitCompletion, error) {
	query := `
		SELECT id, habit_id, user_id, completed_date, created_at
		FROM habit_completions
		WHERE habit_id = $1 
		  AND completed_date >= $2 
		  AND completed_date <= $3
		ORDER BY completed_date DESC
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, habitID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	completions := []HabitCompletion{}
	for rows.Next() {
		var completion HabitCompletion
		err := rows.Scan(
			&completion.ID,
			&completion.HabitID,
			&completion.UserID,
			&completion.CompletedDate,
			&completion.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		completions = append(completions, completion)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return completions, nil
}

// GetCompletionsByUser hakee käyttäjän kaikki merkinnät aikaväliltä
func (s *HabitCompletionStore) GetCompletionsByUser(ctx context.Context, userID int64, startDate, endDate time.Time) ([]HabitCompletion, error) {
	query := `
		SELECT id, habit_id, user_id, completed_date, created_at
		FROM habit_completions
		WHERE user_id = $1 
		  AND completed_date >= $2 
		  AND completed_date <= $3
		ORDER BY completed_date DESC
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	completions := []HabitCompletion{}
	for rows.Next() {
		var completion HabitCompletion
		err := rows.Scan(
			&completion.ID,
			&completion.HabitID,
			&completion.UserID,
			&completion.CompletedDate,
			&completion.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		completions = append(completions, completion)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return completions, nil
}

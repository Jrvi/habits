package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type PasswordResetTokenStore struct {
	db *sql.DB
}

func (s *PasswordResetTokenStore) Create(ctx context.Context, userID int64, tokenHash string, expiry time.Time) error {
	query := `
		INSERT INTO password_reset_tokens (token, user_id, expiry)
		VALUES ($1, $2, $3)
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, tokenHash, userID, expiry)
	return err
}

func (s *PasswordResetTokenStore) Consume(ctx context.Context, tokenHash string, now time.Time, passwordHash []byte) error {
	return withTx(s.db, ctx, func(tx *sql.Tx) error {
		selectQ := `
			SELECT user_id
			FROM password_reset_tokens
			WHERE token = $1 AND expiry > $2 AND used_at IS NULL
			FOR UPDATE
		`

		ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
		defer cancel()

		var userID int64
		err := tx.QueryRowContext(ctx, selectQ, tokenHash, now).Scan(&userID)
		if err != nil {
			switch {
			case errors.Is(err, sql.ErrNoRows):
				return ErrNotFound
			default:
				return err
			}
		}

		if _, err := tx.ExecContext(ctx, `UPDATE users SET password = $1 WHERE id = $2`, passwordHash, userID); err != nil {
			return err
		}

		res, err := tx.ExecContext(ctx, `UPDATE password_reset_tokens SET used_at = $1 WHERE token = $2`, now, tokenHash)
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
	})
}

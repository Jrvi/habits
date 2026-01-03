package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"juhojarvi/habits/internal/mailer"
	"juhojarvi/habits/internal/store"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type ForgotPasswordPayload struct {
	Email string `json:"email" validate:"required,email,max=255"`
}

type ResetPasswordPayload struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required,min=3,max=72"`
}

func (api *api) forgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var payload ForgotPasswordPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()
	user, err := api.store.Users.GetByEmail(ctx, payload.Email)
	if err != nil {
		// Avoid account enumeration: always return Accepted.
		w.WriteHeader(http.StatusAccepted)
		return
	}

	plainToken := uuid.New().String()
	hash := sha256.Sum256([]byte(plainToken))
	hashToken := hex.EncodeToString(hash[:])

	expiry := time.Now().Add(1 * time.Hour)
	if err := api.store.PasswordResetTokens.Create(ctx, user.ID, hashToken, expiry); err != nil {
		api.internalServerError(w, r, err)
		return
	}

	resetURL := fmt.Sprintf("%s/reset-password/%s", api.config.frontendURL, plainToken)

	isProdEnv := api.config.env == "production"
	vars := struct {
		Username string
		ResetURL string
		Expiry   string
	}{
		Username: user.Username,
		ResetURL: resetURL,
		Expiry:   "1 hour",
	}

	_, sendErr := api.mailer.Send(mailer.PasswordResetTemplate, user.Username, user.Email, vars, !isProdEnv)
	if sendErr != nil {
		api.logger.Errorw("error sending password reset email", "error", sendErr)
		// Still return Accepted; no enumeration.
	}

	w.WriteHeader(http.StatusAccepted)
}

func (api *api) resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var payload ResetPasswordPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	hash := sha256.Sum256([]byte(payload.Token))
	hashToken := hex.EncodeToString(hash[:])

	u := &store.User{}
	if err := u.Password.Set(payload.Password); err != nil {
		api.internalServerError(w, r, err)
		return
	}

	err := api.store.PasswordResetTokens.Consume(r.Context(), hashToken, time.Now(), u.Password.Hash())
	if err != nil {
		switch err {
		case store.ErrNotFound:
			api.badRequestResponse(w, r, fmt.Errorf("invalid or expired token"))
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

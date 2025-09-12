package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"juhojarvi/habits/internal/mailer"
	"juhojarvi/habits/internal/store"
	"net/http"

	"github.com/google/uuid"
)

type RegisterUserPayload struct {
	Username string `json:"username" validate:"required,max=100"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=3,max=72"`
}

type UserWithToken struct {
	*store.User
	Token string `json:"token"`
}

func (api *api) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload RegisterUserPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	user := &store.User{
		Username: payload.Username,
		Email:    payload.Email,
	}

	// hash the user password
	if err := user.Password.Set(payload.Password); err != nil {
		api.internalServerError(w, r, err)
		return
	}

	ctx := r.Context()

	plainToken := uuid.New().String()

	// store
	hash := sha256.Sum256([]byte(plainToken))
	hashToken := hex.EncodeToString(hash[:])

	// store the user
	err := api.store.Users.CreateAndInvite(ctx, user, hashToken, api.config.mail.exp)
	if err != nil {
		switch err {
		case store.ErrDuplicateEmail:
			api.badRequestError(w, r, err)
		case store.ErrDuplicateUsername:
			api.badRequestError(w, r, err)
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	userWithToken := &UserWithToken{
		User:  user,
		Token: plainToken,
	}

	activationURL := fmt.Sprintf("%s/confirm/%s", api.config.frontendURL, plainToken)

	isProdEnv := api.config.env == "production"
	vars := struct {
		Username      string
		ActivationURL string
	}{
		Username:      user.Username,
		ActivationURL: activationURL,
	}

	// send mail
	_, err = api.mailer.Send(mailer.UserWelcomeTemplate, user.Username, user.Email, vars, !isProdEnv)
	if err != nil {
		api.logger.Errorw("error sending welcome email", "error", err)

		// rollback user if email fails (SAGA pattern)
		if err := api.store.Users.Delete(ctx, user.ID); err != nil {
			api.logger.Errorw("error deleting user", "error", err)
		}

		api.internalServerError(w, r, err)
	}

	if err := api.jsonResponse(w, http.StatusCreated, userWithToken); err != nil {
		api.internalServerError(w, r, err)
	}

}

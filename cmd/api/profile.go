package main

import (
	"errors"
	"juhojarvi/habits/internal/store"
	"net/http"
)

var errUnauthorized = errors.New("unauthorized")

type UpdateEmailPayload struct {
	Email           string `json:"email" validate:"required,email,max=255"`
	CurrentPassword string `json:"currentPassword" validate:"required,min=3,max=72"`
}

type UpdatePasswordPayload struct {
	CurrentPassword string `json:"currentPassword" validate:"required,min=3,max=72"`
	NewPassword     string `json:"newPassword" validate:"required,min=3,max=72"`
}

func (api *api) getMeHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromContext(r)
	if user == nil {
		api.unauthorizedErrorResponse(w, r, errUnauthorized)
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, user); err != nil {
		api.internalServerError(w, r, err)
	}
}

func (api *api) updateMyEmailHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromContext(r)
	if user == nil {
		api.unauthorizedErrorResponse(w, r, errUnauthorized)
		return
	}

	var payload UpdateEmailPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	if !user.Password.Matches(payload.CurrentPassword) {
		api.unauthorizedErrorResponse(w, r, errUnauthorized)
		return
	}

	updated, err := api.store.Users.UpdateEmail(r.Context(), user.ID, payload.Email)
	if err != nil {
		switch err {
		case store.ErrDuplicateEmail:
			api.conflictError(w, r, err)
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, updated); err != nil {
		api.internalServerError(w, r, err)
	}
}

func (api *api) updateMyPasswordHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromContext(r)
	if user == nil {
		api.unauthorizedErrorResponse(w, r, errUnauthorized)
		return
	}

	var payload UpdatePasswordPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	if !user.Password.Matches(payload.CurrentPassword) {
		api.unauthorizedErrorResponse(w, r, errUnauthorized)
		return
	}

	newUser := &store.User{}
	if err := newUser.Password.Set(payload.NewPassword); err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.store.Users.UpdatePassword(r.Context(), user.ID, newUser.Password.Hash()); err != nil {
		api.internalServerError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

package main

import (
	"context"
	"errors"
	"juhojarvi/habits/internal/store"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type habitKey string

const habitCtxKey habitKey = "habit"

type CreateHabitPayload struct {
	Name   string `json:"name" validate:"required,max=50`
	Impact string `json:"impact" validate:"required,max=25`
}

func (api *api) createHabitHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateHabitPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	user := getUserFromContext(r)

	habit := &store.Habit{
		Name:   payload.Name,
		Impact: payload.Impact,
		UserID: user.ID,
	}

	ctx := r.Context()

	if err := api.store.Habits.Create(ctx, habit); err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusCreated, habit); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

func (api *api) getHabitHandler(w http.ResponseWriter, r *http.Request) {
	habit := getHabitFromCtx(r)

	if err := api.jsonResponse(w, http.StatusOK, habit); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

func (api *api) habitContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idParam := chi.URLParam(r, "habitID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			api.internalServerError(w, r, err)
			return
		}

		ctx := r.Context()

		habit, err := api.store.Habits.GetByID(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				api.notFoundResponseError(w, r, err)
			default:
				api.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, habitCtxKey, habit)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (api *api) deleteHabitHandler(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "habitID")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		api.internalServerError(w, r, err)
		return
	}

	ctx := r.Context()

	err = api.store.Habits.Delete(ctx, id)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			api.notFoundResponseError(w, r, err)
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type UpdateHabitPayload struct {
	Name   *string `json:"name" validate:"omitempty,max=50`
	Impact *string `json:"impact" validate:"omitempty,max=25`
}

func (api *api) updateHabitHandler(w http.ResponseWriter, r *http.Request) {
	habit := getHabitFromCtx(r)

	var payload UpdateHabitPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if payload.Name != nil {
		habit.Name = *payload.Name
	}

	if payload.Impact != nil {
		habit.Impact = *payload.Impact
	}

  if err := Validate.Struct(payload); err != nil {
    api.badRequestError(w, r, err)
    return
  }

  if err := api.jsonResponse(w, http.StatusOK, habit); err != nil {
    api.internalServerError(w, r, err)
    return
  }
}

func getHabitFromCtx(r *http.Request) *store.Habit {
	habit, _ := r.Context().Value(habitCtxKey).(*store.Habit)
	return habit
}

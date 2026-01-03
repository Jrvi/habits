package main

import (
	"context"
	"errors"
	"juhojarvi/habits/internal/store"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

type goalKey string

const goalCtxKey goalKey = "goal"

type CreateGoalPayload struct {
	Year        int    `json:"year" validate:"required,min=2020,max=2100"`
	Category    string `json:"category" validate:"required,oneof=career financial health learning"`
	Description string `json:"description" validate:"required,max=500"`
}

type UpdateGoalPayload struct {
	Description string `json:"description" validate:"required,max=500"`
	Completed   *bool  `json:"completed"`
}

func (api *api) createGoalHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateGoalPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	user := getUserFromContext(r)

	goal := &store.Goal{
		UserID:      user.ID,
		Year:        payload.Year,
		Category:    payload.Category,
		Description: payload.Description,
	}

	ctx := r.Context()

	if err := api.store.Goals.Create(ctx, goal); err != nil {
		// Check for duplicate key constraint violation
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") ||
			strings.Contains(err.Error(), "goals_user_id_year_category_key") {
			api.conflictError(w, r, errors.New("you already have a goal for this category in this year"))
			return
		}
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusCreated, goal); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

func (api *api) getGoalHandler(w http.ResponseWriter, r *http.Request) {
	goal := getGoalFromContext(r)

	if err := api.jsonResponse(w, http.StatusOK, goal); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

func (api *api) getGoalsByYearHandler(w http.ResponseWriter, r *http.Request) {
	yearStr := chi.URLParam(r, "year")
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		api.badRequestError(w, r, err)
		return
	}

	user := getUserFromContext(r)
	ctx := r.Context()

	goals, err := api.store.Goals.GetByUserAndYear(ctx, user.ID, year)
	if err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, goals); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

func (api *api) updateGoalHandler(w http.ResponseWriter, r *http.Request) {
	goal := getGoalFromContext(r)

	var payload UpdateGoalPayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	goal.Description = payload.Description
	goal.Completed = payload.Completed

	ctx := r.Context()

	if err := api.store.Goals.Update(ctx, goal); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			api.notFoundError(w, r, err)
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, goal); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

func (api *api) deleteGoalHandler(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "goalID")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		api.badRequestError(w, r, err)
		return
	}

	user := getUserFromContext(r)
	ctx := r.Context()

	if err := api.store.Goals.Delete(ctx, id, user.ID); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			api.notFoundError(w, r, err)
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (api *api) goalContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idParam := chi.URLParam(r, "goalID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			api.badRequestError(w, r, err)
			return
		}

		ctx := r.Context()

		goal, err := api.store.Goals.GetByID(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				api.notFoundError(w, r, err)
			default:
				api.internalServerError(w, r, err)
			}
			return
		}

		user := getUserFromContext(r)
		if goal.UserID != user.ID {
			api.forbiddenError(w, r)
			return
		}

		ctx = r.Context()
		ctx = contextSetGoal(ctx, goal)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func contextSetGoal(ctx context.Context, goal *store.Goal) context.Context {
	return context.WithValue(ctx, goalCtxKey, goal)
}

func getGoalFromContext(r *http.Request) *store.Goal {
	goal, _ := r.Context().Value(goalCtxKey).(*store.Goal)
	return goal
}

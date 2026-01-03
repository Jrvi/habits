package main

import (
	"errors"
	"juhojarvi/habits/internal/store"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type MarkCompletePayload struct {
	Date string `json:"date" validate:"required"` // Format: 2006-01-02
}

// Mark habit complete for a specific date
func (api *api) markHabitCompleteHandler(w http.ResponseWriter, r *http.Request) {
	habit := getHabitFromCtx(r)
	user := getUserFromContext(r)

	var payload MarkCompletePayload
	if err := readJSON(w, r, &payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	// Parse date
	date, err := time.Parse("2006-01-02", payload.Date)
	if err != nil {
		api.badRequestError(w, r, err)
		return
	}

	ctx := r.Context()

	completion, err := api.store.HabitCompletions.MarkComplete(ctx, habit.ID, user.ID, date)
	if err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusCreated, completion); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

// Unmark habit complete for a specific date
func (api *api) unmarkHabitCompleteHandler(w http.ResponseWriter, r *http.Request) {
	habit := getHabitFromCtx(r)

	dateStr := chi.URLParam(r, "date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		api.badRequestError(w, r, err)
		return
	}

	ctx := r.Context()

	if err := api.store.HabitCompletions.UnmarkComplete(ctx, habit.ID, date); err != nil {
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

// Get habit completions for a date range
func (api *api) getHabitCompletionsHandler(w http.ResponseWriter, r *http.Request) {
	habit := getHabitFromCtx(r)

	// Parse query parameters
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")

	var startDate, endDate time.Time
	var err error

	if startStr != "" {
		startDate, err = time.Parse("2006-01-02", startStr)
		if err != nil {
			api.badRequestError(w, r, err)
			return
		}
	} else {
		// Default to 30 days ago
		startDate = time.Now().AddDate(0, 0, -30)
	}

	if endStr != "" {
		endDate, err = time.Parse("2006-01-02", endStr)
		if err != nil {
			api.badRequestError(w, r, err)
			return
		}
	} else {
		// Default to today
		endDate = time.Now()
	}

	ctx := r.Context()

	completions, err := api.store.HabitCompletions.GetCompletionsByHabit(ctx, habit.ID, startDate, endDate)
	if err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, completions); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

// Get user's all completions for a date range
func (api *api) getUserCompletionsHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromContext(r)

	// Parse query parameters
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")

	var startDate, endDate time.Time
	var err error

	if startStr != "" {
		startDate, err = time.Parse("2006-01-02", startStr)
		if err != nil {
			api.badRequestError(w, r, err)
			return
		}
	} else {
		// Default to 7 days ago
		startDate = time.Now().AddDate(0, 0, -7)
	}

	if endStr != "" {
		endDate, err = time.Parse("2006-01-02", endStr)
		if err != nil {
			api.badRequestError(w, r, err)
			return
		}
	} else {
		// Default to today
		endDate = time.Now()
	}

	ctx := r.Context()

	completions, err := api.store.HabitCompletions.GetCompletionsByUser(ctx, user.ID, startDate, endDate)
	if err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, completions); err != nil {
		api.internalServerError(w, r, err)
		return
	}
}

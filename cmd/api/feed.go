package main

import (
	"juhojarvi/habits/internal/store"
	"net/http"
)

func (api *api) getUserFeedHandler(w http.ResponseWriter, r *http.Request) {
	fq := store.PaginatedFeedQuery{
		Limit:  20,
		Offset: 0,
		Sort:   "desc",
	}

	fq, err := fq.Parse(r)
	if err != nil {
		api.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(fq); err != nil {
		api.badRequestError(w, r, err)
		return
	}

	ctx := r.Context()
	user := getUserFromContext(r)

	feed, err := api.store.Habits.GetUserFeed(ctx, user.ID, fq)
	if err != nil {
		api.internalServerError(w, r, err)
		return
	}

	if err := api.jsonResponse(w, http.StatusOK, feed); err != nil {
		api.internalServerError(w, r, err)
	}
}

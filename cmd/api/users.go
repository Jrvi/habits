package main

import (
	"context"
	"juhojarvi/habits/internal/store"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type userKey string

const userCtx userKey = "user"

func (api *api) getUserHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromContext(r)

	if err := api.jsonResponse(w, http.StatusOK, user); err != nil {
		api.internalServerError(w, r, err)
  return
	}
}

func (api *api) activateUserHandler(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")

	err := api.store.Users.Activate(r.Context(), token)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			api.badRequestError(w, r, err)
		default:
			api.internalServerError(w, r, err)
		}
		return
	}

	if err := api.jsonResponse(w, http.StatusNoContent, nil); err != nil {
		api.internalServerError(w, r, err)
	}
}

func (api *api) userContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idParam := chi.URLParam(r, "userID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			api.badRequestError(w, r, err)
			return
		}

		ctx := r.Context()

		user, err := api.store.Users.GetByID(ctx, id)
		if err != nil {
			switch err {
			case store.ErrNotFound:
				api.notFoundResponseError(w, r, err)
				return
			default:
				api.internalServerError(w, r, err)
				return
			}
		}

		ctx = context.WithValue(ctx, userCtx, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getUserFromContext(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}

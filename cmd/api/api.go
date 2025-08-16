package main

import (
	"juhojarvi/habits/internal/store"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

type api struct {
	config config
	store  store.Storage
	logger *zap.SugaredLogger
}

type config struct {
	addr        string
	db          dbConfig
	env         string
	frontendURL string
	apiURL      string
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

func (api *api) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/v1", func(r chi.Router) {

		r.Route("/habits", func(r chi.Router) {
			r.Post("/", api.createHabitHandler)

			r.Route("/{habitID}", func(r chi.Router) {
				r.Use(api.habitContextMiddleware)
				r.Get("/", api.getHabitHandler)
			})
		})

	})

	return r
}

func (api *api) run(mux http.Handler) error {

	server := &http.Server{
		Addr:         api.config.addr,
		Handler:      mux,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	api.logger.Infow("server has started ", "addr", api.config.addr, "env", api.config.env)

	return server.ListenAndServe()
}

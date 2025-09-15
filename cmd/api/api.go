package main

import (
	"juhojarvi/habits/internal/auth"
	"juhojarvi/habits/internal/env"
	"juhojarvi/habits/internal/mailer"
	"juhojarvi/habits/internal/store"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"go.uber.org/zap"
)

type api struct {
	config        config
	store         store.Storage
	logger        *zap.SugaredLogger
	mailer        mailer.Client
	authenticator auth.Authenticator
}

type config struct {
	addr        string
	db          dbConfig
	env         string
	frontendURL string
	apiURL      string
	mail        mailConfig
	auth        authConfig
}

type authConfig struct {
	token tokenConfig
}

type tokenConfig struct {
	secret string
	exp    time.Duration
	iss    string
}

type mailConfig struct {
	sendGrid  sendGridConfig
	mailTrap  mailTrapConfig
	fromEmail string
	exp       time.Duration
}

type sendGridConfig struct {
	apiKey string
}

type mailTrapConfig struct {
	apiKey string
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
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{env.GetString("CORS_ALLOWED_ORIGIN", "http://localhost:5173")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/v1", func(r chi.Router) {

		r.Route("/habits", func(r chi.Router) {
			r.Use(api.AuthTokenMiddleware)
			r.Post("/", api.createHabitHandler)

			r.Route("/{habitID}", func(r chi.Router) {
				r.Use(api.habitContextMiddleware)
				r.Get("/", api.getHabitHandler)
        r.Delete("/", api.deleteHabitHandler)
        r.Patch("/", api.updateHabitHandler)
			})
		})

		r.Route("/users", func(r chi.Router) {
			r.Put("/activate/{token}", api.activateUserHandler)

			r.Route("/{userID}", func(r chi.Router) {
				r.Use(api.userContextMiddleware)
				r.Get("/", api.getUserHandler)
			})

			r.Group(func(r chi.Router) {
				r.Use(api.AuthTokenMiddleware)
				r.Get("/feed", api.getUserFeedHandler)
			})
		})

		// Public routes
		r.Route("/authentication", func(r chi.Router) {
			r.Post("/user", api.registerUserHandler)
			r.Post("/token", api.createTokenHandler)
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

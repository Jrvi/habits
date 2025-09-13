package main

import (
	"juhojarvi/habits/internal/auth"
	"juhojarvi/habits/internal/db"
	"juhojarvi/habits/internal/env"
	"juhojarvi/habits/internal/mailer"
	"juhojarvi/habits/internal/store"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

func main() {
	_ = godotenv.Load(".env")

	cfg := config{
		addr:        env.GetString("ADDR", ":8080"),
		frontendURL: env.GetString("FRONTEND_URL", "localhost:4000"),
		apiURL:      env.GetString("API_URL", "localhost:8080"),
		db: dbConfig{
			addr:         env.GetString("DB_ADDR", "postgres://admin:adminpassword@localhost/habits?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},
		env: env.GetString("ENV", "development"),
		mail: mailConfig{
			exp:       time.Hour * 24 * 3,
			fromEmail: env.GetString("FROM_EMAIL", ""),
			sendGrid: sendGridConfig{
				apiKey: env.GetString("SENDGRID_API_KEY", ""),
			},
			mailTrap: mailTrapConfig{
				apiKey: env.GetString("MAILTRAP_API_KEY", ""),
			},
		},
		auth: authConfig{
			token: tokenConfig{
				secret: env.GetString("AUTH_TOKEN_SECRET", ""),
				exp:    time.Hour * 24 * 3,
				iss:    "habits",
			},
		},
	}

	// Logger
	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	// Database
	db, err := db.New(cfg.db.addr, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)
	if err != nil {
		logger.Fatal(err)
	}

	// Authenticator
	jwtAuthenticator := auth.NewJWTAuthenticator(
		cfg.auth.token.secret,
		cfg.auth.token.iss,
		cfg.auth.token.iss,
	)

	defer db.Close()
	logger.Info("Connected to database")

	//mailer := mailer.NewSendgrid(cfg.mail.sendGrid.apiKey, cfg.mail.fromEmail)
	mailtrap, err := mailer.NewMailTrapClient(cfg.mail.mailTrap.apiKey, cfg.mail.fromEmail)
	if err != nil {
		logger.Fatal(err)
	}

	store := store.NewStorage(db)

	api := &api{
		config:        cfg,
		store:         store,
		logger:        logger,
		mailer:        mailtrap,
		authenticator: jwtAuthenticator,
	}

	mux := api.mount()
	logger.Fatal(api.run(mux))
}

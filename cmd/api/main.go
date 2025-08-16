package main

import (
	"juhojarvi/habits/internal/db"
	"juhojarvi/habits/internal/env"
	"juhojarvi/habits/internal/store"
	"log"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
  _ "github.com/lib/pq"
)

func main() {
  err := godotenv.Load(".env")
  if err != nil {
    log.Fatal("Error loading .env file")
  }

  cfg := config{
    addr: env.GetString("ADDR", ":8080"),
    frontendURL: env.GetString("FRONTEND_URL", "localhost:4000"),
    apiURL: env.GetString("API_URL", "localhost:8080"),
    db: dbConfig{
      addr: env.GetString("DB_ADDR", "postgres://admin:adminpassword@localhost/habits?sslmode=disable"),
      maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
      maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
      maxIdleTime: env.GetString("DB_MAX_IDLE_TIME", "15m"),
    },
    env: env.GetString("ENV", "development"),
  }

  // Logger
  logger := zap.Must(zap.NewProduction()).Sugar()
  defer logger.Sync()

  // Database
  db, err := db.New(cfg.db.addr, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)
  if err != nil {
    logger.Fatal(err)
  }

  store := store.NewStorage(db)

  api := &api{
    config: cfg,
    store: store,
    logger: logger,
  }

  mux := api.mount()
  logger.Fatal(api.run(mux))
}

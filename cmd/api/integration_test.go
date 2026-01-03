package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"juhojarvi/habits/internal/auth"
	"juhojarvi/habits/internal/db"
	"juhojarvi/habits/internal/store"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type stubMailer struct{}

func (m stubMailer) Send(templateFile, username, email string, data any, isSandbox bool) (int, error) {
	return http.StatusOK, nil
}

func newTestHandler(t *testing.T) (http.Handler, func()) {
	t.Helper()

	dbAddr := os.Getenv("TEST_DB_ADDR")
	if dbAddr == "" {
		dbAddr = os.Getenv("DB_ADDR")
	}
	if dbAddr == "" {
		t.Skip("DB_ADDR/TEST_DB_ADDR is not set")
	}

	sqlDB, err := db.New(dbAddr, 5, 5, "1m")
	if err != nil {
		t.Fatalf("connect db: %v", err)
	}

	if err := resetDB(sqlDB); err != nil {
		sqlDB.Close()
		t.Fatalf("reset db: %v", err)
	}

	jwtAuthenticator := auth.NewJWTAuthenticator("test-secret", "habits", "habits")

	api := &api{
		config: config{
			env:         "test",
			frontendURL: "http://example.test",
			apiURL:      "http://example.test",
			mail: mailConfig{
				fromEmail: "no-reply@example.test",
				exp:       time.Hour,
			},
			auth: authConfig{token: tokenConfig{secret: "test-secret", exp: time.Hour, iss: "habits"}},
		},
		store:         store.NewStorage(sqlDB),
		logger:        zap.NewNop().Sugar(),
		mailer:        stubMailer{},
		authenticator: jwtAuthenticator,
	}

	return api.mount(), func() {
		_ = sqlDB.Close()
	}
}

func resetDB(db *sql.DB) error {
	// Keep this list aligned with migrations in cmd/migrate/migrations.
	_, err := db.Exec(`
		TRUNCATE TABLE
			habit_completions,
			habits,
			goals,
			password_reset_tokens,
			user_invitations,
			users
		RESTART IDENTITY CASCADE;
	`)
	return err
}

func doJSON(t *testing.T, handler http.Handler, method, path string, body any, bearerToken string) (int, []byte) {
	t.Helper()

	var buf *bytes.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("json marshal: %v", err)
		}
		buf = bytes.NewReader(b)
	} else {
		buf = bytes.NewReader(nil)
	}

	req := httptest.NewRequest(method, "http://example.test"+path, buf)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if bearerToken != "" {
		req.Header.Set("Authorization", "Bearer "+bearerToken)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	return rr.Code, rr.Body.Bytes()
}

func decodeData[T any](t *testing.T, body []byte, out *T) {
	t.Helper()

	var env struct {
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(body, &env); err != nil {
		t.Fatalf("decode envelope: %v; body=%s", err, string(body))
	}
	if err := json.Unmarshal(env.Data, out); err != nil {
		t.Fatalf("decode data: %v; data=%s", err, string(env.Data))
	}
}

func createActivatedUserAndToken(t *testing.T, handler http.Handler) (publicID string, authToken string) {
	t.Helper()

	password := "pass123"
	email := fmt.Sprintf("u_%s@example.test", uuid.NewString())
	username := fmt.Sprintf("u_%s", uuid.NewString())

	// Register
	status, body := doJSON(t, handler, http.MethodPost, "/v1/authentication/user", map[string]any{
		"username": username,
		"email":    email,
		"password": password,
	}, "")
	if status != http.StatusCreated {
		t.Fatalf("register: want %d got %d body=%s", http.StatusCreated, status, string(body))
	}

	var reg struct {
		ID    string `json:"id"`
		Token string `json:"token"`
	}
	decodeData(t, body, &reg)

	// Activate
	status, body = doJSON(t, handler, http.MethodPut, "/v1/users/activate/"+reg.Token, nil, "")
	if status != http.StatusNoContent {
		t.Fatalf("activate: want %d got %d body=%s", http.StatusNoContent, status, string(body))
	}

	// Login
	status, body = doJSON(t, handler, http.MethodPost, "/v1/authentication/token", map[string]any{
		"email":    email,
		"password": password,
	}, "")
	if status != http.StatusCreated {
		t.Fatalf("login: want %d got %d body=%s", http.StatusCreated, status, string(body))
	}

	var tok struct {
		ID    string `json:"id"`
		Token string `json:"token"`
	}
	decodeData(t, body, &tok)

	return tok.ID, tok.Token
}

func TestAuth_RegisterActivateLoginAndMe(t *testing.T) {
	handler, cleanup := newTestHandler(t)
	defer cleanup()

	publicID, token := createActivatedUserAndToken(t, handler)

	status, body := doJSON(t, handler, http.MethodGet, "/v1/users/me", nil, token)
	if status != http.StatusOK {
		t.Fatalf("me: want %d got %d body=%s", http.StatusOK, status, string(body))
	}

	var me struct {
		ID string `json:"id"`
	}
	decodeData(t, body, &me)
	if me.ID != publicID {
		t.Fatalf("me id mismatch: want %q got %q", publicID, me.ID)
	}
	if _, err := uuid.Parse(me.ID); err != nil {
		t.Fatalf("me id not uuid: %v", err)
	}
}

func TestHabits_AreScopedToAuthenticatedUser(t *testing.T) {
	handler, cleanup := newTestHandler(t)
	defer cleanup()

	_, token1 := createActivatedUserAndToken(t, handler)
	_, token2 := createActivatedUserAndToken(t, handler)

	status, body := doJSON(t, handler, http.MethodPost, "/v1/habits", map[string]any{
		"name":   "Drink water",
		"impact": "good",
	}, token1)
	if status != http.StatusCreated {
		t.Fatalf("create habit: want %d got %d body=%s", http.StatusCreated, status, string(body))
	}

	var created struct {
		ID int64 `json:"id"`
	}
	decodeData(t, body, &created)
	if created.ID == 0 {
		t.Fatalf("expected non-zero habit id")
	}

	status, _ = doJSON(t, handler, http.MethodGet, fmt.Sprintf("/v1/habits/%d", created.ID), nil, token2)
	if status != http.StatusNotFound {
		t.Fatalf("cross-user get habit: want %d got %d", http.StatusNotFound, status)
	}
}

func TestHabits_CannotLinkGoalOwnedByAnotherUser(t *testing.T) {
	handler, cleanup := newTestHandler(t)
	defer cleanup()

	_, token1 := createActivatedUserAndToken(t, handler)
	_, token2 := createActivatedUserAndToken(t, handler)

	status, body := doJSON(t, handler, http.MethodPost, "/v1/goals", map[string]any{
		"year":        time.Now().Year(),
		"category":    "health",
		"description": "Test goal",
	}, token1)
	if status != http.StatusCreated {
		t.Fatalf("create goal: want %d got %d body=%s", http.StatusCreated, status, string(body))
	}

	var goal struct {
		ID int64 `json:"id"`
	}
	decodeData(t, body, &goal)
	if goal.ID == 0 {
		t.Fatalf("expected non-zero goal id")
	}

	status, _ = doJSON(t, handler, http.MethodPost, "/v1/habits", map[string]any{
		"name":    "Linked habit",
		"impact":  "good",
		"goal_id": goal.ID,
	}, token2)
	if status != http.StatusForbidden {
		t.Fatalf("link other user's goal: want %d got %d", http.StatusForbidden, status)
	}
}

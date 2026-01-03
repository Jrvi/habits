# Habits (Habitisti)

Habits on habit tracking -sovellus: Go + PostgreSQL backend ja React (Vite) web-frontend.
Sovellus tukee käyttäjätilejä, vuosittaisia tavoitteita ja tapojen päivittäistä seurantaa.

## Ominaisuudet

- Käyttäjän rekisteröinti, aktivointi ja kirjautuminen (JWT)
- Käyttäjän julkinen tunniste UUID:na (API palauttaa `id` = public UUID, sisäinen numero-ID on piilossa)
- Tietoturva: käyttäjä näkee/muokkaa vain omia tapojaan/tavoitteitaan (DB-tason suodatus + middleware)
- Tavat (CRUD) ja vaikutusluokka: positive / neutral / negative
- Päivittäiset merkinnät (completions) + viikonäkymä (Monday-first)
- Vuosittaiset tavoitteet (goals) ja tapojen linkitys tavoitteisiin
- Profiili: sähköpostin ja salasanan vaihto
- Unohtuiko salasana / reset password -flow
- Kaksikielisyys (FI/EN) webissä

## Teknologiat

- Backend: Go, chi, JWT, PostgreSQL, SQL migrations
- Frontend: React + Vite, react-router, axios
- Dev: docker compose (Postgres), make (migrations)

## Paikallinen kehitys

### 1) Ympäristömuuttujat

Tarkista `.env` (esim. `DB_ADDR`, `AUTH_TOKEN_SECRET`, `FRONTEND_URL`).

Huom: backend muodostaa aktivointi- ja reset-linkit `FRONTEND_URL`:n perusteella.
Jos käytät Viten dev-serveriä, aseta `FRONTEND_URL=http://localhost:5173`.

### 2) Käynnistä tietokanta

```bash
docker compose up -d db
```

### 3) Aja migraatiot

```bash
make migrate-up
```

### 4) Käynnistä backend

```bash
go run ./cmd/api
```

API oletuksena: `http://localhost:8080`

### 5) Käynnistä web-frontend

```bash
npm --prefix web install
npm --prefix web run dev
```

Frontend oletuksena: `http://localhost:5173`

## Testit ja deploy

- Go integraatiotestit (Postgres vaaditaan): `go test ./...`
- CI (GitHub Actions) ajaa migraatiot + backend testit + web buildin ennen Fly-deployta.

## Projektirakenne

- `cmd/api`: HTTP API ja middlewaret
- `cmd/migrate/migrations`: SQL-migraatiot
- `internal/store`: SQL-kyselyt ja domain-mallit
- `web`: React/Vite frontend

## Lisenssi

MIT

# Habit Tracker

Habit Tracker on moderni web-sovellus, jonka avulla käyttäjä voi hallita
ja seurata tapojaan.\
Sovellus on rakennettu **Reactilla** ja hyödyntää **REST APIa**
käyttäjien hallintaan ja tietojen tallennukseen.

## ✨ Ominaisuudet

-   🔑 **Käyttäjän rekisteröinti ja kirjautuminen** (JWT-tokenit,
    salasanan hash)
-   ✅ **Tapojen lisääminen, muokkaaminen ja poistaminen**
-   🎯 **Impact-luokittelu**: positive, neutral, negative
-   📱 **Responsiivinen käyttöliittymä** (toimii hyvin mobiilissa ja
    desktopilla)
-   🔔 **Notifikaatiot** onnistuneista ja epäonnistuneista toimista
-   👤 **Käyttäjäprofiili** ja logout
-   🌓 **Dark mode** (valmiina CSS-tyyleissä)

> 🚧 Tulossa: tapojen **päivittäinen seuranta** ja **tilastot**
> (kalenteri, progress bar)

------------------------------------------------------------------------

## 🛠️ Teknologiat

-   **Frontend**: React (Vite), react-router-dom, axios
-   **Backend**: Go (REST API)
-   **Tyylit**: Custom CSS variables, responsiivinen design
-   **Build/Dev**: Vite

------------------------------------------------------------------------

## 📦 Asennus ja käyttö

### 1. Kloonaa repo

``` bash
git clone https://github.com/kayttaja/habit-tracker.git
cd habit-tracker
```

### 2. Asenna riippuvuudet

``` bash
npm install
```

### 3. Käynnistä kehityspalvelin

``` bash
npm run dev
```

Frontend käynnistyy oletuksena osoitteessa:\
👉 http://localhost:5173

### 4. Backend

Käynnistä myös Go-API (oletuksena `http://localhost:8080`).\
Esim:

``` bash
go run cmd/api/main.go
```

------------------------------------------------------------------------

## 🔑 Käyttäjänhallinta

-   Rekisteröitymisen jälkeen saat aktivointilinkin sähköpostiin.\

-   Aktivointi tapahtuu osoitteessa:

        http://localhost:5173/activate/:token

-   Kirjautumisen jälkeen JWT tallennetaan selaimen localStorageen.

------------------------------------------------------------------------

## 📂 Projektirakenne

    src/
     ├─ components/      # React-komponentit (Habit, HabitList, Forms, ...)
     ├─ services/        # API-kutsut (axios)
     ├─ App.jsx          # Reititys, layout
     ├─ main.jsx         # Sovelluksen entrypoint
     └─ styles/          # CSS (App.css)

------------------------------------------------------------------------

## 🖼️ Kuvakaappauksia

*(Lisää screenshotit myöhemmin)*

------------------------------------------------------------------------

## 🚀 Tulevat kehitysideat

-   [ ] Päivittäinen **habit-seuranta** (checkmarkit, historia)
-   [ ] Viikkotilastot & progress bar
-   [ ] Käyttäjän avatar ja profiilin muokkaus
-   [ ] Light/Dark mode toggle
-   [ ] Push-notifikaatiot ja muistutukset

------------------------------------------------------------------------

## 📜 Lisenssi

MIT

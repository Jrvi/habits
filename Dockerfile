# Builder stage
FROM golang:1.24.5 AS builder

WORKDIR /app

# Kopioidaan mod-tiedostot
COPY go.mod go.sum ./

RUN go mod download

# Kopioidaan kaikki lähdekoodit
COPY . .

# Rakennetaan binary ./cmd/api:sta
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api

# Runtime stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/server .

CMD ["./server"]

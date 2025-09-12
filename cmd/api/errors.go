package main

import (
	"log"
	"net/http"
)

func (api *api) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	api.logger.Errorw("internal server error", "method", r.Method, "path", r.URL.Path, "error", err)

	writeJSONError(w, http.StatusInternalServerError, "server error")
}

func (api *api) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	api.logger.Warnf("bad request", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (api *api) badRequestError(w http.ResponseWriter, r *http.Request, err error) {
	api.logger.Warnf("bad request", "method", r.Method, "path", r.URL.Path, "error", err)

	writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (api *api) notFoundResponseError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("not found error: %s path:  %s error: %s", r.Method, r.URL.Path, err.Error())

	api.logger.Warnf("not found error", "method", r.Method, "path", r.URL.Path, "error", err)

	writeJSONError(w, http.StatusNotFound, "not found")
}

func (api *api) unauthorizedErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	api.logger.Warnf("unauthorized error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusUnauthorized, "unauthorized")
}

func (api *api) unauthorizedBasicErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	api.logger.Warnf("unauthorized basic error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	w.Header().Set("WWW-Authenticate", `Basic realm="restricted", charset="UTF-8"`)

	writeJSONError(w, http.StatusUnauthorized, "unauthorized")
}

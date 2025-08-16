package main

import (
	"log"
	"net/http"
)

func (api *api) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	api.logger.Errorw("internal server error", "method", r.Method, "path", r.URL.Path, "error", err)

	writeJSONError(w, http.StatusInternalServerError, "server error")
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

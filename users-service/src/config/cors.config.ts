import { CorsOptions } from "cors";
import { log } from "../utils/logger";
import { getEnvVar } from "./config.service";

const allowedOrigin = getEnvVar("GLOBAL_CORS_ALLOW_ANY_ORIGIN") ? "*" : "https://marketplace.hotdeals.dev";
log.info(`CORS allowed origin: ${allowedOrigin}`);
const allowedHeaders = ["Content-Type", "Authorization"];

export const corsGetConfig: CorsOptions = {
  methods: "GET",
  origin: allowedOrigin,
  allowedHeaders,
};

export const corsPostConfig: CorsOptions = {
  methods: "POST",
  origin: allowedOrigin,
  allowedHeaders,
};

export const corsPatchConfig: CorsOptions = {
  methods: "PATCH",
  origin: allowedOrigin,
  allowedHeaders,
};

export const corsPutConfig: CorsOptions = {
  methods: "PUT",
  origin: allowedOrigin,
  allowedHeaders,
};

export const corsDeleteConfig: CorsOptions = {
  methods: "DELETE",
  origin: allowedOrigin,
  allowedHeaders,
};

export const corsOptionsConfig: CorsOptions = {
  methods: ["OPTIONS", "PUT"],
  origin: allowedOrigin,
  allowedHeaders,
};

/**
 * Only to be used by the catch-all endpoint and not any actual logic endpoint
 */
export const corsAcceptAll: CorsOptions = {
  origin: "*",
};

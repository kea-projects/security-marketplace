import { CorsOptions } from "cors";
import { log } from "../utils/logger";
import { getEnvVar } from "./config.service";

const allowedOrigins = ["https://marketplace.hotdeals.dev"];
if (getEnvVar("GLOBAL_CORS_ALLOW_LOCALHOST_ORIGIN")) {
  allowedOrigins.push(`http://localhost:3000`);
}
log.info(`CORS allowed origins: ${allowedOrigins}`);
const allowedHeaders = ["Content-Type", "Authorization"];

export const corsGetConfig: CorsOptions = {
  methods: "GET",
  origin: allowedOrigins,
  allowedHeaders,
};

export const corsPostConfig: CorsOptions = {
  methods: "POST",
  origin: allowedOrigins,
  allowedHeaders,
};

export const corsPatchConfig: CorsOptions = {
  methods: "PATCH",
  origin: allowedOrigins,
  allowedHeaders,
};

export const corsPutConfig: CorsOptions = {
  methods: "PUT",
  origin: allowedOrigins,
  allowedHeaders,
};

export const corsDeleteConfig: CorsOptions = {
  methods: "DELETE",
  origin: allowedOrigins,
  allowedHeaders,
};

/**
 * Only to be used by the catch-all endpoint and not any actual logic endpoint
 */
export const corsAcceptAll: CorsOptions = {
  origin: "*",
};

import "dotenv/config";
import http from "http";
import https from 'https';
import app from "@/app.js";
import { errorLogger } from "./utils/error.logger.js";
import { shutdown } from "./utils/shutdown.server.js";
const SERVER_PORT = Number(process.env.SERVER_PORT);
const isDev = process.env.NODE_ENV === 'development';
const server = isDev? http.createServer(app) : https.createServer(app);

process.on("SIGTERM", () => shutdown("SIGTERM", server));
process.on("SIGINT", () => shutdown("SIGINT", server));
server.listen(SERVER_PORT, () => {
  errorLogger.info(`🚀 Server is running on http://localhost:${SERVER_PORT}`);
});

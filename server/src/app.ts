import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { globalErrorHandler } from "@/middlewares/global.error.middleware.js";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["POST", "PATCH", "DELETE", "PUT", "GET"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Workstackhub"],
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (_: Req, res: Res) => {
  res.send("Hello, there");
});






// Global Error Handler
app.use(globalErrorHandler);
export default app;

import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import "./config/passport.js";
import { AppDataSource } from "./db/data-source.js";
import { handleServerErrors } from "./middleware/errorHandler.js";
import { logRequest } from "./middleware/requestLogger.js";

const app = express();
const port = process.env.PORT || 3000;

try {
    await AppDataSource.initialize();
    console.log("✅ Data Source has been initialized");

    app.use(cors({
        origin: process.env.CLIENT_URL!,
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(passport.initialize());

    app.use(logRequest);

    app.use(handleServerErrors);

    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
} catch (err) {
    console.log(err);
}

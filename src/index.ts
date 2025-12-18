import express from "express";
import "dotenv/config";
import { AppDataSource } from "./db/data-source.js";
import cookieParser from "cookie-parser";
import { handleServerErrors } from "./middleware/errorHandler.js";
import { logRequest } from "./middleware/requestLogger.js";

const app = express();
const port = process.env.PORT || 3000;

try {
    await AppDataSource.initialize();
    console.log("✅ Data Source has been initialized!");

    app.use(cookieParser());
    app.use(express.json());
    app.use(logRequest);

    app.use(handleServerErrors);

    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
} catch (err) {
    console.log(err);
}

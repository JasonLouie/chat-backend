import express from "express";
import "dotenv/config";
import { AppDataSource } from "./db/data-source.js";

const app = express();
const port = process.env.PORT || 3000;

try {
    await AppDataSource.initialize();
    console.log("✅ Data Source has been initialized!");

    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
} catch (err) {
    console.log(err);
}

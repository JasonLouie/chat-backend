import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";

export function createAuthRoutes (authController: AuthController) {
    const router = Router();
    return router;
}
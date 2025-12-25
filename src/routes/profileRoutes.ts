import { Router } from "express";
import type { ProfileController } from "../controllers/ProfileController.js";
import { validateModifyProfile } from "../middleware/validators.js";

export function createProfileRoutes(profileController: ProfileController) {
    const router = Router();

    router.patch("/", validateModifyProfile, profileController.modifyProfile);

    router.get("/me", profileController.getMyProfile);

    router.get("/:userId", profileController.getUserProfile);

    return router;
}

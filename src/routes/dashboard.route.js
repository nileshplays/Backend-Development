import { Router } from "express";
import { getChannelVideos, getChannelStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all videos uploaded by a channel
router.route("/:channelId/videos").get(verifyJWT, getChannelVideos);

// Get channel stats (views, subscribers, likes, etc.)
router.route("/:channelId/stats").get(verifyJWT, getChannelStats);

export default router;

import {Router} from "express";
import { toggleSubscription } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// Toggle subscription to a channel
router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);


export default router;
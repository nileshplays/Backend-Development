import {Router} from "express";
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// Toggle subscription to a channel
router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);

router.route("/:channelId/subscribers").get(verifyJWT, getUserChannelSubscribers);


export default router;
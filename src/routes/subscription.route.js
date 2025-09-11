import {Router} from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// Toggle subscription to a channel
router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);

router.route("/:channelId/subscribers").get(verifyJWT, getUserChannelSubscribers);

router.route("/:subscriberId/channels").get(verifyJWT, getSubscribedChannels);


export default router;
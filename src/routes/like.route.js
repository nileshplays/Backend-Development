import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike, getLikedVideos, toggleTweetLike, toggleCommentLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle/video/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/videos").get(verifyJWT, getLikedVideos);

router.route("/toggle/tweet/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/comments").get(verifyJWT, toggleCommentLike);

export default router;

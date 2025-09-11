import {Router} from "express";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/publish").post(
    verifyJWT,
    upload.fields([
        {
            name : "video",
            maxCount : 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]),
    publishAVideo
);

router.route("/:videoId").get( verifyJWT, getVideoById );
router.route("/update-video/:videoId").patch( verifyJWT, updateVideo );
router.route("/delete-video/:videoId").delete( verifyJWT, deleteVideo );
router.route("/toggle-publish/:videoId").patch( verifyJWT, togglePublishStatus );



export default router;

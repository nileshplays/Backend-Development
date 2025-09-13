import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addComment, 
    getVideoComments, 
    updateComment, 
    deleteComment 
} from "../controllers/comment.controller.js";

const router = Router();

// Add a new comment to a video
router.route("/add-comment/:videoId").post(verifyJWT, addComment);

// Get all comments for a video (with pagination)
router.route("/comments/:videoId").get(verifyJWT, getVideoComments);

// Update a comment
router.route("/:commentId").put(verifyJWT, updateComment);

// Delete a comment
router.route("/:commentId").delete(verifyJWT, deleteComment);

export default router;
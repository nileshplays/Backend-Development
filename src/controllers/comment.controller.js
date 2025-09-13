import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    // 1. Check if Video exists or not
    if( !videoId ){
        throw new ApiError(401, "Video is required !!")
    }

    const video = await Video.findById( videoId )
    if( !video ){
        throw new ApiError(404, "Video not found !!")
    }

    // 2. Pagination setup
    const skip = ( page-1 )* limit

    // 3. Fetch comments with pagination and populate owner
    const comment = await Comment.find({ video : videoId })
        .populate("owner", "username email")
        .sort( {createdAt : -1} )
        .skip(skip)
        .limit(Number(limit))

    const totalComments = await Comment.countDocuments({video: videoId})

    // 4. Send Response
    return res
        .status(200)
        .json( new ApiResponse(200,
            {
                totalComments,
                currentPage : Number(page),
                totalPages : Math.ceil(totalComments/limit),
                comment
                
            },
            "Video Comments fetched successfully"
        ) 
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content  } = req.body
    const { videoId } = req.params
    // 1. Validation
    if( !content || content.trim() ==="" ){
        throw new ApiError(401, "Comment Content is required !!")
    }
    if( !videoId ){
        throw new ApiError(401, "Video ID is required !!")
    }

    // 2. Fetch VIdeo
    const video = await Video.findById( videoId )
    if( !video ){
        throw new ApiError(404,  "Video not found !!")
    }

    // 3. Create comment document 
    const comment = await Comment.create({
        video : videoId,
        content,
        owner : req.user?._id || "",
    })

    // 4. Save comment in DB
    //await comment.save()     // This is required if new Comment  is used but in creat comment it is saved in that step only

    // 5. Return response
    return res
        .status(200)
        .json( new ApiResponse(200, comment, "Comment Added successfully" ) )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body
    // 1. Validate
    if( !commentId ){
        throw new ApiError(400, "Comment ID is required !!")
    }
    if( !content || content.trim() ==="" ){
        throw new ApiError(400, "Updated Comment content is required !!")
    }

    // 2. Fetch Comment
    const comment = await Comment.findById( commentId )
    if( !comment ){
        throw new ApiError(404, "Comment not found !!")
    }

    const user = req.user?._id
    // 3. Authorization
    if( comment.owner.toString() !== user.toString() ){
        throw new ApiError(403, "You are not authorized to Update this comment !!")
    }

    // 4. Update the comment
    comment.content = content.trim()
    comment.save()

    // 5. Return response
    return res
     .status(200)
     .json( new ApiResponse(200, comment, "Comment Updated Successfully") )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    // 1. Validate
    if( !commentId ){
        throw new ApiError(400, "Comment ID is required !!")
    }

    // 2. Find Comment
    const comment = await Comment.findById( commentId )
    if( !comment ){
        throw new ApiError(404, "Comment not found !!")
    }

    const user = req.user?._id
    // 3. Authorization
    if( comment.owner.toString() !== user.toString() ){
        throw new ApiError(403, "You are not authorized to Update this comment !!")
    }

    // 4. Delete Comment
    await comment.deleteOne()
    
    // 5. Return response
    return res
     .status(200)
     .json( new ApiResponse(200, {}, "Comment Deleted Successfully") )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
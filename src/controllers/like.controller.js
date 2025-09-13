import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    // 1. Validate
    if( !videoId ){
        throw new ApiError(401, "Video ID is required !!")
    }

    // 2. Check is video exists
    const video = await Video.findById( videoId )
    if( !video ){
        throw new ApiError(404, "Video not found !!")
    }

    const userId = req.user?._id
    // 3. Check if like already exists
    const existingLike = await Like.findOne({
        video : videoId,
        likedBy : userId
    })

    let message = ""
    if( existingLike ){
        await existingLike.deleteOne()
        message = "Like Removed"
    }
    else{
        await Like.create({
            video : videoId,
            likedBy : userId
        })
        message = "Liked Video"
    }

    // 4. Return response
    return res
     .status(200)
     .json( new ApiResponse(200,{}, message ) )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    // 1. Validation
    if( !commentId ){
        throw new ApiError(400, "Comment ID is required !!")
    }

    const userId = req.user?._id

    // 2. Check comment
    const comment = await Comment.findById(commentId)
    if( !comment ){
        throw new ApiError(404, "Comment NOT found !!")
    }
    
    // 3. Check if already like exits
    const existingLike = await Like.findOne({
        comment : commentId,
        likedBy : userId
    })

    let message = ""
    if( existingLike ){
        await existingLike.deleteOne()
        message = "Like Removed"
    }
    else{
        await Like.create({
            comment : commentId,
            likedBy : userId
        })
        message = "Liked comment"
    } 

    // 4. Return
    return res
        .status(200)
        .json( new ApiResponse(200, {}, message))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if( !tweetId ){
        throw new ApiError(401, "Tweet ID is required !!")
    }

    // 2. Check is video exists
    const tweet = await Tweet.findById( tweetId )
    if( !tweet ){
        throw new ApiError(404, "Tweet not found !!")
    }

    const userId = req.user?._id
    // 3. Check if like already exists
    const existingLike = await Like.findOne({
        tweet : tweetId,
        likedBy : userId
    })

    let message = ""
    if( existingLike ){
        await existingLike.deleteOne()
        message = "Like Removed"
    }
    else{
        await Like.create({
            tweet : tweetId,
            likedBy : userId
        })
        message = "Liked Tweet"
    }

    // 4. Return response
    return res
     .status(200)
     .json( new ApiResponse(200,{}, message ) )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // 1. Validation
    const userId = req.user?._id
    if( !userId ){
        throw new ApiError(401, "Unauthorized, User not found !!")
    }

    // 2. Fetch likes with populated video details
    const likes = await Like.find({ likedBy: userId, video: { $ne: null } })
        .populate("video");

    // 3. Extract videos
    const videos = likes.map(like => like.video);

    // 4. Send Response
    return res
        .status(200)
        .json( new ApiResponse(200, { total: videos.length, videos } , "Liked Videos Fetched successfully") )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
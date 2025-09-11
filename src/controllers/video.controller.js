import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    // 1. Validate required feilds
    if(!title || !description){
        throw new ApiError(401, "Title and description required!");
    }

    // 2. Check if Video files exists
    const videoLocalPath = req.files?.video?.[0]?.path
    if( !videoLocalPath ){
        throw new ApiError(400, "Video file is required !!")
    }
    
    // 3.Check if thumbnail exists
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if( !thumbnailLocalPath ){
        throw new ApiError(400, "Thumbnail file is required !!")
    }

    // 4. Uplaod on CLoudinary
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    if( !uploadedVideo ){
        throw new ApiError(400, "Video upload Failed !!");
    }
    
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if( !uploadedThumbnail ){
        throw new ApiError(400 , "Thumbnail upload Failed !!")
    }

    // 5.Create Video document in MongoDb
    const newVideo = await Video.create({
        videoFile :  uploadedVideo.url,
        thumbnail : uploadedThumbnail.url,
        title,
        description,
        duration : uploadedVideo.duration || 0,
        views : 0,
        isPublished : true,
        owner: req.user._id
    })

    // 6. Send response
    return res
    .status(201)
    .json( new ApiResponse(201 , newVideo , "Video Published Successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
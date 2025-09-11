import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary , deleteFromCloudinary} from "../utils/cloudinary.js"


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
        videoFileId: uploadedVideo.public_id,     // <-- store public_id used later for deletion from cloudinary server
        thumbnail : uploadedThumbnail.url,
        thumbnailId: uploadedThumbnail.public_id, // <-- store public_id
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

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    // 1. Validate Video
    if( !isValidObjectId(videoId) ){
        throw new ApiError(400 , "Invalid Video ID !!")
    }

    // 2.Find video by Id and populate over the details
    const video = await Video.findById(videoId)
        .populate("owner", "username email")            // join these fields to the owner object || we can Also use Aggregate Pipeline

    // 3. Check if Video exists
    if( !video ){
        throw new ApiError(400 , "Video Does not exists !!")
    }

    // 4. Return Response
    return res
     .status(200)
     .json(new ApiResponse (200 , video , "Video fetched Successfully"))
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // 1. Validate Video ID
    if( !isValidObjectId(videoId) ){
        throw new ApiError(400 , "Invalid Video ID !!")
    }

    // 2.Fetch existing video from DB
    const video = await Video.findById(videoId)
    if( !video ){
        throw new ApiError(400, "Video not found !!")
    } 

    // 3.Check Ownership
    if( video.owner.toString() !== req.user?._id?.toString() ){
        throw new ApiError(400, "You are not authorized to update this file !!")
    }

    // 4.Prepare update data
    const { title, description} = await req.body
    const updateData = {}
    if(title) updateData.title = title
    if(description) updateData.description = description

    // 5. Handle Thumbnail Update
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if( thumbnailLocalPath ){
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        updateData.thumbnail = thumbnail?.url
    }

    // 6. Update data in MongoDB
    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        updateData,
        {
            new : true
        }
    )

    // 7.Return response
    return res
        .status(200)
        .json( new ApiResponse(200, updateVideo ,"Video updated Successfully") )
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    // 1. Validate Video ID
    if( !isValidObjectId(videoId) ){
        throw new ApiError(400 , "Invalid Video ID !!")
    }

    // 2.Fetch existing video from DB
    const video = await Video.findById(videoId)
    if( !video ){
        throw new ApiError(400, "Video not found !!")
    } 

    // 3.Check Ownership
    if( video.owner.toString() !== req.user?._id?.toString() ){
        throw new ApiError(400, "You are not authorized to update this file !!")
    }

    // 4.Delete files from cloudinary
    if(video.videoFileId){
        await deleteFromCloudinary(video.videoFileId)
    }
    if(video.thumbnailIdFileId){
        await deleteFromCloudinary(video.thumbnailId)
    }

    // 5. Delete Video document from MongoDB
    await Video.findByIdAndDelete(videoId)

    return res
     .status(200)
     .json( new ApiError(200, null , "Video Deleted Successfully "))
});

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
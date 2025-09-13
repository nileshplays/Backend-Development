import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params 
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required!");
    }

    // 1. Total videos
    const totalVideos = await Video.countDocuments({ owner : channelId })
    
    // TODO : HOW TO CALCULATE TOTAL VIEWS  //

    // 2. Total views (sum of all video views)
    const viewsAgg = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    // 3. Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // 4. Total likes on all videos
    const videoIds = await Video.find({ owner: channelId }).distinct("_id");
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            }, "Channel stats fetched successfully")
        );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { channelId } = req.params 
    if( !channelId ){
        throw new ApiError(400, "Channel ID is required !!")
    }

    // 1. Fetch Videos
    const videos = await Video.find({owner: channelId})
        .populate( "owner" , "username fullName avatar" )
        .sort( {createdAt : -1} )
    if( !videos || videos.lenght === 0 ){
        throw new ApiError(404, "Video not found !!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));


})

export {
    getChannelStats, 
    getChannelVideos
    }
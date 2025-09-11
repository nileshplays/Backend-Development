import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?._id
    // TODO: toggle subscription

    // 1. Channel Validation
    if( !channelId ){
        throw new ApiError(400 , "Channel ID is required !!")
    }
    if( channelId.toString() === userId.toString() ){
        throw new ApiError(400 , "You can't subscribe your channel !!")
    }

    // 2. Check if Subscription already exists
    const existingSubscriber = await Subscription.findOne({
        subscriber : userId,
        channel : channelId
    })

    let isSubscribed

    // 3. Subscribe || Unsubscribe
    if( existingSubscriber ){
        // a) UNSUBSCRIBE
        await Subscription.findByIdAndDelete(existingSubscriber._id)
        isSubscribed = false
    } 
    else{
        // b) SUBSCRIBE 
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        isSubscribed = true
    }

    // 4. Send Response
    return res  
        .status(200)
        .json( new ApiResponse(200 ,{ subscribed: isSubscribed }, 
        `Successfully ${isSubscribed ? "subscribed" : "unsubscribed"} to channel`))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
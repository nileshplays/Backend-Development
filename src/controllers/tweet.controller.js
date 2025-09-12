import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const userId = req.user?._id
    
    // 1. Validation
    if( !content || content.trim()===""){
        throw new ApiError(400, "Tweet Content is required !!")
    }

    // 2. Create Tweet
    const tweet = await Tweet.create({
        content,
        owner : userId
    })

    // 3. Send Response
    return res  
        .status(200)
        .json( new ApiResponse(200, tweet , "Tweet created successfully") )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // 1. Fetch Userid and validate
    const {userId} = req.params
    if( !userId ){
        throw new ApiError(401, "User Id is required")
    }

    // 2. Check if User exists or not
    const user = await User.findById(userId)
    if( !user ){
        throw new ApiError(404, "User not found !!")
    }

    // 3. Fetch tweets
    const tweets = await Tweet.find({ owner : userId })
        .sort({ createdAt : -1 })          // Latest tweets first
    
    // 4. Prepare Response
    const totalTweets = tweets.length

    // 5.  Send response
    return res
        .status(200)
        .json( new ApiResponse(200,{totalTweets , tweets}, "User Tweets fetched successfully" ))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // 1. Get tweet Id and new tweet content
    const { tweetId } = req.params
    const { content } = req.body
    if( !tweetId){
        throw new ApiError(400 , "Tweet id is required !!")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated content is required");
    }

    const userId = req.user?._id
    if( !userId ){
        throw new ApiError( 400, "User ID not found !!")
    }

    // 2. Find tweet
    const tweet = await Tweet.findById(tweetId)
    if( !tweet ){
        throw new ApiError(404, "Tweet NOT found !!")
    }

    // 3. Authorization Check
    if( tweet.owner.toString() !== userId.toString() ){
        throw new ApiError(403, "You are not authorizeed to update this tweet !!")
    }

    // 4. Update tweet
    tweet.content = content
    await tweet.save()

    // 5. Send Response
    return res
        .status(200)
        .json(new ApiResponse(200, tweet , "Tweet updated Successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // 1. Find tweet ID and validate
    const { tweetId } = req.params
    if( !tweetId ){
        throw new ApiError(400, "Tweet ID is required  !!")
    }
    const userId = req.user?._id

    // 2. Fetch Tweet
    const tweet = await Tweet.findById(tweetId)
    if( !tweet ){
        throw new ApiError(404, "Tweet not found !!")
    }
    // 3.Authentication CHECK
    if( tweet.owner.toString() !== userId.toString() ){
        throw new ApiError(403,"You are not authorized to delete this tweet !!")
    }

    // 4. Delete tweet from DB
    await tweet.deleteOne()

    // 5. Send Response
    return res
        .status(200)
        .json(new ApiResponse(200, {} , "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
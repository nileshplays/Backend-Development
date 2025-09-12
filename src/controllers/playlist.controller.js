import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user?._id
    // 1. Validation
    if( !name || name.trim() === ""){
        throw new ApiError(400, "Playlist name is required !!")
    }

    // 2. Check for duplicate playlist if Exists
    const existing = await Playlist.findOne({ name, owner : userId })
    if( existing ){
        throw new ApiError(401, "You already have a playlist with the same name !!")
    }

    // 3. Create Playlist
    const playlist = await Playlist.create({
        name,
        description : description || "",
        owner : userId,
        videos : []       // initially empty playlist
    })

    // 4. Send Response
    return res
        .status(200)
        .json( new ApiResponse(200, playlist , "Playlist created successfully") )

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const  userId  = req.user?._id
    //TODO: get user playlists
    // 1. validation
    if( !userId ){
        throw new ApiError(400, "User ID is required !!")
    }

    // 2. Fetch playlist
    const playlist = await Playlist.find( { owner : userId} )
        .populate("videos", "title thumbnail url")

    // 3. send Response
    return res
        .status(200)
        .json( new ApiResponse(200, playlist ,"Playlist Fetched Successfully") )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    // 1. Validate playlistId
    if ( !playlistId ) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // 2. Fetch playlist by ID
    const playlist = await Playlist.findById( playlistId )
        .populate("owner", "username email")               //  show owner details
        .populate("videos", "title thumbnail url")         //  show video details
        .exec();

    if ( !playlist ) {
        throw new ApiError(404, "Playlist not found");
    }

    // 3. Send response
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // 1. Validation
    if( !playlistId || !videoId ){
        throw new ApiError(401, "Playlist ID & Video ID both required !!")
    }

    const userId = req.user?._id
    // 2. Check playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 3. Authorization only owner can Add
    if( playlist.owner.toString() !== userId.toString() ){
        throw new ApiError(403, "You are not authorized to modify this playlsit !!")
    }

    // 4. Check if video exists
    const video = await Video.findById(videoId)
    if( !video ){
        throw new ApiError(404, "Video not found !!")
    }

    // 5. Avoid DUplicate entry
    if( playlist.videos.includes(videoId) ){
        throw new ApiError(400, "Video already exists in this playlist !!")
    }

    // 6. Add Video
    playlist.videos.push( videoId )
    await playlist.save()

    // 7. Send Response
    return res
        .status(200)
        .json( new ApiResponse(200, playlist, "Video added to the playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // 1. Validation
    if( !playlistId || !videoId ){
        throw new ApiError(401, "Playlist ID & Video ID both required !!")
    }

    const userId = req.user?._id
    // 2. Check playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 3. Authorization only owner can Add
    if( playlist.owner.toString() !== userId.toString() ){
        throw new ApiError(403, "You are not authorized to modify this playlsit !!")
    }

    // 4. Check if video exists in playlist
    if( !playlist.videos.includes(videoId) ){
        throw new ApiError(404, "Video not found in this playlist!!")
    }

    // 5. Remove Video from the playlist
    playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId.toString()
    );
    await playlist.save(); 

    return res
     .status(200)
     .json( new ApiResponse(200, playlist, "Video removed from playlist successfully") )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    // 1. Validation
    if ( !playlistId ) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const userId = req.user?._id
    // 2. Fetch playlist
    const playlist = await Playlist.findById( playlistId )
    if( !playlist ){
        throw new ApiError(404, "Playlist Not found !!")
    }
    // 3. Authorization
    if( playlist.owner.toString() !== userId.toString() ){
        throw new ApiError(403, "You are not authorized to delete this palylist !!")
    }

    // 4. Delete playlist
    await playlist.deleteOne()

    // 5. Return response
    return res
        .status(200)
        .json( new ApiResponse(200, {} , "Playlist deleted successfully" ))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    const userId = req.user?._id
    //TODO: update playlist
    // 1. Validate
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }
    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update");
    }

    // 2. Fetch Playlist
    const playlist = await Playlist.findById(playlistId )
    if( !playlist ){
        throw new ApiError(404 , "Playlist Not found !!")
    }

    // 3. Authorization check (only owner can update)
    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    // 4. Update the fields
    if( name ){
        playlist.name = name.trim()
    }
    if( description ){
        playlist.description = description.trim()
    }

    await playlist.save()

    // 5. Send Response
    return res
        .status(200)
        .json( new ApiResponse(200, playlist , "Playlist Updated successfully" ))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
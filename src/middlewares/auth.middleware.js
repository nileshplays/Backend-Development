import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

// as below there is no use of res (response) so instead of writing "res" we can replace it with "_" underscore
export const verifyJWT = asyncHandler( async (req , res , next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replce("Bearer ", "");
        if( !token ){
            throw new ApiError(404, "Unauthorized request !!");   
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    
        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken");
        if( !user ){
            throw new ApiError(401, "Invalid Access Token !!")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token!");
    }

});
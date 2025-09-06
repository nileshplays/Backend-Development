import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user  = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false });

        return { accessToken , refreshToken };

    }catch(error){
        throw new ApiError(500, "Something went wrong while generating Access & Refresh Token !!");
    }
};

const registerUser = asyncHandler( async (req , res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    // Get User details from frontend
    // Validation not empty
    // Check if user already exits  :: username or  email
    // Check for images , Check for avatar
    // Upload them to Cloudinary, avatar Check
    // Create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response

    //1.  Get User details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email: ", email);

    //2. Validation not empty
    if([fullName , email , username, password].some((field) =>         // We can write different for loops for this
        field?.trim() === ""
    )){
        throw new ApiError(400 , "All fields are required")
    }

    //3. Check if user already exits  :: username or  email
    const existedUser = await User.findOne({
        $or: [ { username } , { email }]
    })

    if(existedUser){
        throw new ApiError(409 , "User with this email or username already exists !")
    }

    //4. Check for images , Check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar field is required !");
    }

    //5. Upload them to Cloudinary, avatar Check
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400 , "Avatar field is required !");
    }

    //6.Create user object - create entry in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //7. remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //8. check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user!")
    }

    //9. Return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User Registered Successfully !")
    )
});

const loginUser = asyncHandler( async (req, res) => {
  //STEPS:  req.body -> data
  // username or email
  // find the user
  // check password
  // access token and refresh token
  // send cookies

  const {username, email , password} = req.body

  if(!username && !email){
    throw new ApiError(404,"Either of username or email is required !!");
  }

  const user = await User.findOne({
    $or: [{username} , {email}]
  })

  if(!user){
    throw new ApiError(404, "User does not exists !!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
    throw new ApiError(401, "Password Incorrect !!");
  }

  const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password  -refreshToken" )

  // for cookie
  const options = {
    httpOnly : true,
    // secure : true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
        user : loggedInUser, accessToken , refreshToken
    },
    "User loggen in successfully!"
    )
  )

})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true,
        // secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {} , "User Logged Out Successfully !"))
})

export {registerUser , loginUser, logoutUser};
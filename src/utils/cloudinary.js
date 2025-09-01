import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath)=> {
    try{
        if(!localFilePath)  return null;
        // else upload the file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: 'auto'
        })
        // FIle has been uploaded successfully
        console.log("File is uploaded successfully on Cloudinary", response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath);  // to remove the locally saved temporary file as the upload opertion got failed
        return null;
    }
}

export {uploadOnCloudinary};
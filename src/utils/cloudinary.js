/*
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

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
        //fs.unlinkSync(localFilePath);  // to remove the locally saved temporary file as the upload opertion got failed
        return null;
    }
}

export {uploadOnCloudinary};

*/


// utils/cloudinary.js


import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
//Configure Cloudinary from environment variables
import fs from "fs";


// console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API key:", process.env.CLOUDINARY_API_KEY);
// console.log("API secret:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary
 * @param {string} localFilePath - Path of the file stored locally
 * @returns {object|null} - Cloudinary response object or null if failed
 */



const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("❌ No file path provided to uploadOnCloudinary.");
      return null;
    }

    // console.log("📤 Uploading to Cloudinary:", localFilePath);

    // Upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto-detect (image, video, etc.)
    });

    console.log("✅ File uploaded successfully to Cloudinary:", response.secure_url);

    // Clean up local temp file after upload
    fs.unlink(localFilePath, (err) => {
      if (err) console.warn("⚠️ Failed to delete local file:", err.message);
      else console.log("🗑️ Temp file deleted:", localFilePath);
    });

    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message);

    // Attempt cleanup even if upload fails
    if (localFilePath) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("🗑️ Temp file deleted after failure:", localFilePath);
      } catch (unlinkError) {
        console.warn("⚠️ Could not delete temp file after failure:", unlinkError.message);
      }
    }

    return null;
  }
};

// ✅ delete helper
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary delete error:", err);
    }
};

export { uploadOnCloudinary };

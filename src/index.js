// import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
// import express from "express"

import dotenv from "dotenv";
import connectDB from "./db/dbConnect.js"

dotenv.config({
    path: "./.env"
});

connectDB()


/*
// APPROACH 1
const app = express();

(async()=> {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ",error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on Port: ${process.env.PORT}`)
        });
    }
    catch(error){
        console.error("ERROR: ", error);
        throw error;
    }
}) ();
*/
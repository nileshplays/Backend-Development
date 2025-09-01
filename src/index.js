// import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import { app } from "./app.js";

import dotenv from "dotenv";
import connectDB from "./db/dbConnect.js"

dotenv.config({
    path: "./.env"
});

// const app = express();     as we have already imported app

connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at Port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongo DB connection failed !!!", error);
})


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
import mongoose from "mongoose";

export async function connectDB(){
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/xypher");
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err)
        process.exit(1);
    }
}
import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const mongoURI = process.env.MONGO_URI;
        if(!mongoURI){
            throw new Error("MONGO_URI is not defined in the environment variables");
        }
        const conn = await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully: ", conn.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
        // 1 means exit the process with a failure code, indicating that the application cannot continue without a database connection.
        // 0 means exit the process with a success code, indicating that the application has completed its execution successfully.
    }
}

export default connectDB;
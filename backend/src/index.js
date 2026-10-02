import express from "express";
import "dotenv/config"
import connectDB from "./lib/db.js"; // Import the connectDB function from the db.js file
import cors from "cors";
import { clerkMiddleware} from "@clerk/express"

const app = express();


const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, // Allow credentials (cookies, authorization headers, etc.) to be sent in cross-origin requests
}));
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  connectDB(); // Call the connectDB function to establish a connection to the database
  console.log(`Server is running on port ${PORT}`);
});
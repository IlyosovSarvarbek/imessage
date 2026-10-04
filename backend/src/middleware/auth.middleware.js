import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try{
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
            return;
        }
        
        const user = await User.findById({clerkId: userId});

        if (!user) {
            return res.status(404).json({ message: "User isn't synced yet" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
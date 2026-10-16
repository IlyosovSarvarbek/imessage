import Message from "../models/message.model.js";
import { hasImagekitConfig,uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId } from "../lib/socket.js";
export async function getUsersForSidebar(req, res) {
    try{
        const currentUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: currentUserId } }).select("-clerkId");
        res.status(200).json(filteredUsers);
    } catch(error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export async function getConversationsForSidebar(req, res) {
    try{
        const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      // 1. Keep only the messages I sent or received.
      { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
      // 2. Collapse them into one row per chat partner, noting our latest message time.
      {
        $group: {
          // The partner is the other person on the message (not me).
          _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. Put the most recent conversation at the top.
      { $sort: { lastMessageAt: -1 } },
      // 4. Look up each partner's user profile (comes back as an array).
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      // 5. Pull that profile out of the array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. Hide the private clerkId field from the result.
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
    } catch(error) {
        console.error("Error fetching conversations for sidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export async function getMessages(req, res) {
    try{
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);

    }catch(error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export async function sendMessage(req, res) {
    try{
        const { id: receiverId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        let videoUrl;
        let imageUrl;

        if(req.file){
            if(!hasImagekitConfig()){
                return res.status(500).json({ error: "ImageKit is not configured" });
            }

            const url = await uploadChatMedia(req.file);
        }

        if(req.file && req.file.mimetype.startsWith("video/")){
            videoUrl = url;
        }else if(req.file && req.file.mimetype.startsWith("image/")){
            imageUrl = url;
        } else {
            // If the file is neither an image nor a video, return an error
            return res.status(400).json({ error: "Invalid file type. Only images and videos are allowed." });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            video: videoUrl
        })
        
        await newMessage.save();
        res.status(201).json(newMessage);


        const receiverSocketId = getReceiverSocketId(receiverId);
        // If the receiver is online (i.e., we have their socket ID), emit the new message to them
        if(receiverSocketId) {
            // Emit the new message to the receiver's socket
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

    }catch(error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
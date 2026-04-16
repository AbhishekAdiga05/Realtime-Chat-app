import User from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Group } from "../models/group.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, getIO } from "../lib/socket.js";

export const searchMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { q } = req.query;
    const myId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId, messageType: "direct", text: { $regex: q, $options: "i" } },
        { senderId: userToChatId, receiverId: myId, messageType: "direct", text: { $regex: q, $options: "i" } },
      ],
    })
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in searchMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const currentUser = await User.findById(loggedInUserId);
    const blockedUsers = currentUser.blockedUsers || [];
    
    const filteredUsers = await User.find({ 
      _id: { 
        $ne: loggedInUserId,
        $nin: blockedUsers
      }
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId, messageType: "direct" },
        { senderId: userToChatId, receiverId: myId, messageType: "direct" },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl || "",
      messageType: "direct",
      status: "sent",
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      populatedMessage.status = "delivered";
      populatedMessage.deliveredAt = new Date();
      await populatedMessage.save();

      io.to(receiverSocketId).emit("newMessage", populatedMessage);

      io.to(senderId.toString()).emit("messageStatusUpdate", {
        messageId: populatedMessage._id,
        status: "delivered",
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === senderId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      groupId,
      text: text || "",
      image: imageUrl || "",
      messageType: "group",
      deliveredTo: [senderId],
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic");

    group.lastMessage = {
      senderId,
      text: text || "Shared an image",
      image: imageUrl || "",
      createdAt: new Date(),
    };
    await group.save();

    const io = getIO();
    io.to(`group:${groupId}`).emit("newGroupMessage", {
      groupId,
      message: populatedMessage,
    });

    io.to(`group:${groupId}`).emit("groupUpdated", {
      group: await Group.findById(groupId)
        .populate("members.user", "fullName profilePic")
        .populate("createdBy", "fullName profilePic"),
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

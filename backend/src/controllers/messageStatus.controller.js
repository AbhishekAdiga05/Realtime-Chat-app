import { Message } from "../models/message.model.js";
import { getIO } from "../lib/socket.js";

export const markAsDelivered = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return null;

    if (message.messageType === "direct") {
      if (message.receiverId.toString() === userId.toString()) {
        message.status = "delivered";
        message.deliveredAt = new Date();
        await message.save();
      }
    } else if (message.messageType === "group") {
      if (!message.deliveredTo.includes(userId)) {
        message.deliveredTo.push(userId);
        await message.save();
      }
    }

    return message;
  } catch (error) {
    console.error("Mark delivered error:", error);
    return null;
  }
};

export const markAsSeen = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return null;

    const isSender = message.senderId.toString() === userId.toString();
    if (isSender) return message;

    if (message.messageType === "direct") {
      if (message.receiverId.toString() === userId.toString()) {
        message.status = "seen";
        message.seenAt = new Date();
        await message.save();

        const io = getIO();
        io.to(message.senderId.toString()).emit("messageSeen", {
          messageId: message._id,
          seenBy: userId,
          seenAt: message.seenAt,
        });
      }
    } else if (message.messageType === "group") {
      const alreadySeen = message.seenBy.some(
        (s) => s.user.toString() === userId
      );

      if (!alreadySeen) {
        message.seenBy.push({ user: userId, seenAt: new Date() });
        await message.save();

        const io = getIO();
        io.to(`group:${message.groupId}`).emit("groupMessageSeen", {
          groupId: message.groupId,
          messageId: message._id,
          seenBy: { user: userId, seenAt: new Date() },
        });
      }
    }

    return message;
  } catch (error) {
    console.error("Mark seen error:", error);
    return null;
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    for (const messageId of messageIds) {
      await markAsSeen(messageId, userId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark messages seen error:", error);
    res.status(500).json({ error: "Failed to mark messages as seen" });
  }
};

export const getMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId)
      .populate("senderId", "fullName profilePic")
      .populate("seenBy.user", "fullName profilePic");

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({
      messageId: message._id,
      status: message.status,
      deliveredTo: message.deliveredTo,
      seenBy: message.seenBy,
    });
  } catch (error) {
    console.error("Get message status error:", error);
    res.status(500).json({ error: "Failed to get status" });
  }
};

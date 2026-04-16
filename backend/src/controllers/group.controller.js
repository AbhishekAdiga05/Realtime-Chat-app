import { Group } from "../models/group.model.js";
import User from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Group name is required" });
    }

    if (!members || members.length < 2) {
      return res.status(400).json({ error: "Group must have at least 3 members" });
    }

    const uniqueMembers = [...new Set([userId.toString(), ...members])];

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userId,
      members: uniqueMembers.map((id, index) => ({
        user: id,
        role: index === 0 ? "admin" : "member",
      })),
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("members.user", "fullName email profilePic")
      .populate("createdBy", "fullName email profilePic");

    const { getIO } = await import("../lib/socket.js");
    const io = getIO();
    uniqueMembers.forEach((memberId) => {
      io.emit("groupCreated", { group: populatedGroup });
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      "members.user": userId,
    })
      .populate("members.user", "fullName email profilePic")
      .populate("createdBy", "fullName email profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id)
      .populate("members.user", "fullName email profilePic")
      .populate("createdBy", "fullName email profilePic");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user._id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: targetUserId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isAdmin = group.members.some(
      (m) => m.user.toString() === adminId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    const isAlreadyMember = group.members.some(
      (m) => m.user.toString() === targetUserId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: "User is already a member" });
    }

    group.members.push({
      user: targetUserId,
      role: "member",
    });

    await group.save();

    const updatedGroup = await Group.findById(id)
      .populate("members.user", "fullName email profilePic");

    const { getIO } = await import("../lib/socket.js");
    const io = getIO();
    io.to(`group:${id}`).emit("groupUpdated", { group: updatedGroup });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ error: "Failed to add member" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const adminId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isAdmin = group.members.some(
      (m) => m.user.toString() === adminId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    if (userId === group.createdBy.toString()) {
      return res.status(400).json({ error: "Cannot remove the group creator" });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== userId
    );

    await group.save();

    const updatedGroup = await Group.findById(id)
      .populate("members.user", "fullName email profilePic");

    const { getIO } = await import("../lib/socket.js");
    const io = getIO();
    io.to(`group:${id}`).emit("groupUpdated", { group: updatedGroup });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (userId.toString() === group.createdBy.toString()) {
      return res.status(400).json({
        error: "Creator cannot leave. Transfer ownership or delete the group.",
      });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== userId.toString()
    );

    await group.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only creator can delete group" });
    }

    await Message.deleteMany({ groupId: id });
    await Group.findByIdAndDelete(id);

    const { getIO } = await import("../lib/socket.js");
    const io = getIO();
    io.to(`group:${id}`).emit("groupDeleted", { groupId: id });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isAdmin = group.members.some(
      (m) => m.user.toString() === userId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can update group" });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();

    await group.save();

    const updatedGroup = await Group.findById(id)
      .populate("members.user", "fullName email profilePic");

    const { getIO } = await import("../lib/socket.js");
    const io = getIO();
    io.to(`group:${id}`).emit("groupUpdated", { group: updatedGroup });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const messages = await Message.find({ groupId: id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ groupId: id });

    res.status(200).json({
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get group messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

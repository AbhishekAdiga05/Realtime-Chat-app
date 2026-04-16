import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 200,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      image: String,
      createdAt: Date,
    },
  },
  { timestamps: true }
);

groupSchema.index({ "members.user": 1 });
groupSchema.index({ createdBy: 1 });

export const Group = mongoose.model("Group", groupSchema);

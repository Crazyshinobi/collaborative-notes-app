import mongoose from "mongoose";

const sharedNoteSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: { type: String, enum: ["view", "edit"], default: "edit" },
  },
  { timestamps: true } 
);

const SharedNote =
  mongoose.models.SharedNote || mongoose.model("SharedNote", sharedNoteSchema);

export default SharedNote;

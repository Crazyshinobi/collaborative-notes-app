import connectDb from "@/utils/dbConnect";
import SharedNote from "@/models/SharedNote";
import Note from "@/models/Note";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/authMiddleware";
import { initSocket } from "@/server"; // Importing socket initialization

export async function DELETE(req, { params }) {
  await connectDb();

  const { id: noteId, userId } = params;
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.owner.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this note" },
        { status: 403 }
      );
    }

    const sharedNote = await SharedNote.findOne({
      note: noteId,
      sharedWith: userId,
    });

    if (!sharedNote) {
      return NextResponse.json(
        { error: "User is not a collaborator on this note" },
        { status: 404 }
      );
    }

    await SharedNote.deleteOne({ _id: sharedNote._id });

    note.sharedWith = note.sharedWith.filter(
      (sharedUserId) => sharedUserId.toString() !== userId
    );
    await note.save();

    const io = initSocket();
    io.emit("collaboratorRemoved", { noteId, userId });

    return NextResponse.json(
      { message: "Collaborator removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

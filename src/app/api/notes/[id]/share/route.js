import connectDb from "@/utils/dbConnect";
import SharedNote from "@/models/SharedNote";
import Note from "@/models/Note";
import User from "@/models/User";
import { authenticate } from "@/utils/authMiddleware";
import { NextResponse } from "next/server";
import { initSocket } from "@/server";

export async function POST(req, { params }) {
  await connectDb();
  const noteId = params.id;
  const { sharedWithEmail, permissions } = await req.json();

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

    const sharedWith = await User.findOne({ email: sharedWithEmail });
    if (!sharedWith) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingShare = await SharedNote.findOne({
      note: noteId,
      sharedWith: sharedWith._id,
    });
    if (existingShare) {
      return NextResponse.json(
        { error: "Note already shared with this user" },
        { status: 400 }
      );
    }

    const sharedNote = new SharedNote({
      note: noteId,
      sharedBy: auth.userId,
      sharedWith: sharedWith._id,
      permissions: permissions || "edit", 
    });

    await sharedNote.save();
    note.sharedWith.push(sharedWith._id);
    await note.save();
    const io = initSocket();
    io.emit("collaboratorAdded", { noteId, userId: sharedWithEmail });
    return NextResponse.json(sharedNote, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

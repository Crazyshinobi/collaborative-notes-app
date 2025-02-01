import connectDb from "@/utils/dbConnect";
import SharedNote from "@/models/SharedNote";
import Note from "@/models/Note";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/authMiddleware";

export async function DELETE(req, { params }) {
  await connectDb();

  const { id: noteId, userId: collaboratorId } = await params;
  const auth = await authenticate(req);

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check if the authenticated user is the owner of the note
    if (note.owner.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this note" },
        { status: 403 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email: collaboratorId });
    if (!user) {
      return NextResponse.json(
        { error: "User with the provided email not found" },
        { status: 404 }
      );
    }

    const sharedNote = await SharedNote.findOne({
      note: noteId,
      sharedWith: user._id,
    });

    if (!sharedNote) {
      return NextResponse.json(
        { error: "User is not a collaborator on this note" },
        { status: 404 }
      );
    }

    // Delete the shared note entry
    await SharedNote.deleteOne({ _id: sharedNote._id });

    // Remove the user from the note's sharedWith array
    note.sharedWith = note.sharedWith.filter(
      (sharedUserId) => sharedUserId.toString() !== user._id.toString()
    );
    await note.save();

    return NextResponse.json(
      { success: true, message: "Collaborator removed successfully" },
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

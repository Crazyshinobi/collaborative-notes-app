import connectDb from "@/utils/dbConnect";
import SharedNote from "@/models/SharedNote";
import Note from "@/models/Note";
import User from "@/models/User";
import { authenticate } from "@/utils/authMiddleware";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  await connectDb();
  const noteId = await params.id;
  const { sharedWithEmail, permissions } = await req.json();

  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Fetch the note
    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check if the authenticated user is the owner
    if (note.owner.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this note" },
        { status: 403 }
      );
    }

    // Find the user to share with
    const sharedWith = await User.findOne({ email: sharedWithEmail });
    if (!sharedWith) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is already in the sharedWith array
    if (note.sharedWith.includes(sharedWith._id)) {
      return NextResponse.json(
        { error: "Note already shared with this user" },
        { status: 400 }
      );
    }

    // Create a new SharedNote document
    const sharedNote = new SharedNote({
      note: noteId,
      sharedBy: auth.userId,
      sharedWith: sharedWith._id,
      permissions: permissions || "edit",
    });

    // Save the new SharedNote
    await sharedNote.save();

    // Add the user to the note's sharedWith array
    note.sharedWith.push(sharedWith._id);
    await note.save();

    // Respond with the sharedNote details
    return NextResponse.json({success:true, sharedNote}, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

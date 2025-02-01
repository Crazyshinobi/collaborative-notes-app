import connectDb from "@/utils/dbConnect";
import User from "@/models/User";
import Note from "@/models/Note";
import SharedNote from "@/models/SharedNote";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/authMiddleware";

export async function GET(req, { params }) {
  await connectDb();

  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const noteId = await params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const isShared = await SharedNote.findOne({
      note: noteId,
      sharedWith: auth.userId,
    });

    if (note.owner.toString() !== auth.userId && !isShared) {
      return NextResponse.json(
        { error: "Unauthorized - You do not have access" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Note fetched successfully", note },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while fetching the note" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDb();
    // Authenticate the user
    const auth = await authenticate(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params; // Get the note ID from params

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    // Check if the authenticated user is the owner of the note
    if (note.owner.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Not your note" },
        { status: 403 }
      );
    }

    // Find all users who have this note in their `sharedWith` array
    const usersWithSharedNote = await User.find({ sharedWith: id });

    // Remove the note from their `sharedWith` arrays
    await Promise.all(
      usersWithSharedNote.map(async (user) => {
        user.sharedWith = user.sharedWith.filter(
          (noteId) => noteId.toString() !== id
        );
        await user.save();
      })
    );

    // Delete all shared note entries related to this note
    await SharedNote.deleteMany({ note: id });

    // Delete the note
    await Note.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectDb();

  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const noteId = params.id;
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const isShared = await SharedNote.findOne({
      note: noteId,
      sharedWith: auth.userId,
      permissions: "edit",
    });

    if (note.owner.toString() !== auth.userId && !isShared) {
      return NextResponse.json(
        { error: "Unauthorized - You cannot edit this note" },
        { status: 403 }
      );
    }
    note.title = title;
    note.content = content;
    await note.save();
    return NextResponse.json(
      { success: true, message: "Note updated successfully", note },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while updating the note" },
      { status: 500 }
    );
  }
}

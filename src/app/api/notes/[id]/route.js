import connectDb from "@/utils/dbConnect";
import Note from "@/models/Note";
import SharedNote from "@/models/SharedNote";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/authMiddleware";
import { initSocket } from "@/server";

export async function GET(req, { params }) {
  await connectDb();

  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const noteId = params.id;
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
    const auth = await authenticate(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { id } = await params;
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not Found",
        },
        { status: 404 }
      );
    }
    if (note.owner.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not your note" },
        { status: 403 }
      );
    }

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
        error,
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
    const io = initSocket();
    io.emit("noteUpdated", { noteId });
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

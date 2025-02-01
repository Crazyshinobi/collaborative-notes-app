import connectDb from "@/utils/dbConnect";
import Note from "@/models/Note";
import SharedNote from "@/models/SharedNote";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/authMiddleware";

export async function POST(req, res) {
  try {
    await connectDb();
    const auth = await authenticate(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    // Create new note
    const newNote = new Note({
      title,
      content,
      owner: auth.userId,
    });

    await newNote.save();
    return NextResponse.json({ success: true, note: newNote }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while creating the notes" },
      { status: 500 }
    );
  }
}

export async function GET(req, res) {
  try {
    await connectDb();
    const auth = await authenticate(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Fetch owned notes and populate the owner's username
    const ownedNotes = await Note.find({ owner: auth.userId })
      .populate("owner", "username")
      .populate("sharedWith", "username") // Populate the owner's username
      .exec();

    // Fetch shared notes and populate the note's owner's username and the sharedWith username
    const sharedNotes = await SharedNote.find({ sharedWith: auth.userId })
      .populate({
        path: "note",
        populate: { path: "owner", select: "username" }, // Populate the owner's username in the note
      })
      .populate({
        path: "note",
        populate: { path: "sharedWith", select: "username" },
      })
      .exec();

    // Extract the note data from shared notes
    const sharedNoteData = sharedNotes.map((sharedNote) => sharedNote.note);

    // Combine owned and shared notes
    const allNotes = [...ownedNotes, ...sharedNoteData];

    return NextResponse.json(
      {
        success: true,
        message: "Data fetched successfully",
        notes: allNotes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while fetching the notes" },
      { status: 500 }
    );
  }
}

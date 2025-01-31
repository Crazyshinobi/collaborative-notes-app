import connectDb from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/authMiddleware";
import SharedNote from "@/models/SharedNote";

export async function GET(req, res) {
  await connectDb();
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const sharedNotes = await SharedNote.find({
      sharedWith: auth.userId,
    }).populate({
      path: "note",
      select: "title content owner",
    });

    console.log(sharedNotes)
    // Extract only relevant note data
    const notes = sharedNotes.map((sharedNote) => ({
      _id: sharedNote.note._id,
      title: sharedNote.note.title,
      content: sharedNote.note.content,
      owner: sharedNote.note.owner,
      sharedBy: sharedNote.sharedBy,
      permissions: sharedNote.permissions,
    }));

    return NextResponse.json({notes}, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

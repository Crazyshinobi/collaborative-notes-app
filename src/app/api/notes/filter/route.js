import connectDb from "@/utils/dbConnect";
import { authenticate } from "@/utils/authMiddleware";
import { NextResponse } from "next/server";
import Note from "@/models/Note";
import SharedNote from "@/models/SharedNote";

export async function GET(req) {
  await connectDb();

  // Authenticate the request
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Correctly create the URL object and extract searchParams
    const url = new URL(req.url);
    const filterType = url.searchParams.get("type");

    let notes = [];

    if (filterType === "owned") {
      notes = await Note.find({ owner: auth.userId })
        .populate("owner", "username")
        .populate("sharedWith", "username") // Populate the owner's username
        .exec();
    } else if (filterType === "shared") {
      const sharedNotes = await SharedNote.find({
        sharedWith: auth.userId,
      })
        .populate({
          path: "note", 
          populate: {
            path: "owner", 
            select: "username",
          },
        })
        .populate({
          path: "note",
          populate: {
            path:"sharedWith", 
            select: "username",
          }
        })
        .exec();

      notes = sharedNotes.map((shared) => shared.note);
    } else {
      return NextResponse.json(
        { error: "Invalid filter type" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, notes }, { status: 200 });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

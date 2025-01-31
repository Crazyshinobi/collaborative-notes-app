import connectDb from "@/lib/dbConnect";
import Notes from "@/models/Note";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req, res) {
  try {
    await connectDb();
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
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
      owner: decoded.userId, // Extracted from JWT token
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
    const notes = await Notes.find();
    if (notes) {
      return NextResponse.json(
        {
          success: true,
          message: "Data fetched succcessfully",
          notes,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while fetching the notes" },
      { status: 500 }
    );
  }
}

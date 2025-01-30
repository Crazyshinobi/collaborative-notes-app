import connectDb from "@/lib/dbConnect";
import Notes from "@/models/Note";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    await connectDb();
    const { title, content, owner, sharedWith } = await req.json();
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

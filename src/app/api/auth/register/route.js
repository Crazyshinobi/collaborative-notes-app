import connectDb from "@/utils/dbConnect";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    await connectDb();
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Please fill all the fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating User:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while creating the User" },
      { status: 500 }
    );
  }
}

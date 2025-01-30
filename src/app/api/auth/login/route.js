import connectDb from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req, res) {
  try {
    await connectDb();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please fill all the fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate a token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h", // token expiry
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        name: existingUser.name,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating User:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the User" },
      { status: 500 }
    );
  }
}

// import connectDb from "@/utils/dbConnect";
// import { authenticate } from "@/utils/authMiddleware";
// import { NextResponse } from "next/server";
// import Note from "@/models/Note";
// import SharedNote from "@/models/SharedNote";

// export async function GET(req) {
//   await connectDb();

//   // Authenticate the request
//   const auth = await authenticate(req);
//   if (auth.error) {
//     return NextResponse.json({ error: auth.error }, { status: auth.status });
//   }

//   try {
//     // Correctly create the URL object and extract searchParams
//     const url = new URL(req.url);
//     const filterType = url.searchParams.get("type");

//     let notes = [];

//     if (filterType === "owned") {
//       // Fetch notes owned by the user
//       notes = await Note.find({ owner: auth.userId });
//     } else if (filterType === "shared") {
//       // Fetch notes shared with the user
//       const sharedNotes = await SharedNote.find({
//         sharedWith: auth.userId,
//       }).populate("note");

//       notes = sharedNotes.map((shared) => shared.note);
//     } else {
//       return NextResponse.json(
//         { error: "Invalid filter type" },
//         { status: 400 }
//       );
//     }

//     // Return the notes as a JSON response
//     return NextResponse.json(notes, { status: 200 });
//   } catch (error) {
//     // Handle unexpected errors
//     console.error(error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

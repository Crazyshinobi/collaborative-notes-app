// import connectDb from "@/utils/dbConnect";
// import Note from "@/models/Note";
// import SharedNote from "@/models/SharedNote";
// import { authenticate } from "@/utils/authMiddleware";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   await connectDb();

//   const auth = await authenticate(req);
//   if (auth.error) {
//     return NextResponse.json({ error: auth.error }, { status: auth.status });
//   }

//   // Await the URL and access searchParams properly
//   const url = new URL(req.url);
//   const query = url.searchParams.get("q");

//   if (!query) {
//     return NextResponse.json(
//       { error: "Search query is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const ownedNotes = await Note.find({
//       owner: auth.userId,
//       $or: [
//         { title: { $regex: query, $options: "i" } },
//         { content: { $regex: query, $options: "i" } },
//       ],
//     });

//     const sharedNotes = await SharedNote.find({
//       sharedWith: auth.userId,
//     }).populate({
//       path: "note",
//       match: {
//         $or: [
//           { title: { $regex: query, $options: "i" } },
//           { content: { $regex: query, $options: "i" } },
//         ],
//       },
//     });

//     const filteredSharedNotes = sharedNotes
//       .map((shared) => shared.note)
//       .filter(Boolean);

//     // Return the notes as a response
//     return NextResponse.json(
//       { notes: [...ownedNotes, ...filteredSharedNotes] },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/users/[id]/posts/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const client = await clientPromise;
    const db = client.db("blogapp");

    const posts = await db
      .collection("posts")
      .find({ author: new ObjectId(params.id), isDraft: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Fetched posts:", posts); // Add this line for debugging

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch user posts error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

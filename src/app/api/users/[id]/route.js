// src/app/api/users/[id]/route.js

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("blogapp");

    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(params.id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const posts = await db
      .collection("posts")
      .find({ author: new ObjectId(params.id) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({ user, posts });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

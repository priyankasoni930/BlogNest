// src/app/api/users/[id]/route.js
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    const client = await clientPromise;
    const db = client.db("blogapp");

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(currentUserId) });

    const isFollowing =
      currentUser.following &&
      currentUser.following.some((id) => id.toString() === params.id);

    // Remove sensitive information
    delete user.password;

    return NextResponse.json({ user, isFollowing });
  } catch (error) {
    console.error("Fetch user profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/app/api/users/[id]/follow/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function POST(request, { params }) {
  return handleFollowToggle(request, params, true);
}

export async function DELETE(request, { params }) {
  return handleFollowToggle(request, params, false);
}

async function handleFollowToggle(request, params, isFollow) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    const client = await clientPromise;
    const db = client.db("blogapp");

    const targetUserId = params.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { message: "You cannot follow/unfollow yourself" },
        { status: 400 }
      );
    }

    const updateOperation = isFollow
      ? { $addToSet: { following: new ObjectId(targetUserId) } }
      : { $pull: { following: new ObjectId(targetUserId) } };

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(currentUserId) }, updateOperation);

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Follow status not changed", isFollowing: isFollow },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: isFollow
        ? "User followed successfully"
        : "User unfollowed successfully",
      isFollowing: isFollow,
    });
  } catch (error) {
    console.error("Follow/unfollow error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

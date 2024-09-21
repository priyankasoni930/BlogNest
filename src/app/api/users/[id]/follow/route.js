// src/app/api/users/[id]/follow/route.js

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function POST(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await clientPromise;
    const db = client.db("blogapp");

    const userToFollow = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) });
    if (!userToFollow) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    const isFollowing =
      currentUser.following &&
      currentUser.following.includes(new ObjectId(params.id));

    let updateOperation;
    if (isFollowing) {
      updateOperation = {
        $pull: { following: new ObjectId(params.id) },
      };
    } else {
      updateOperation = {
        $addToSet: { following: new ObjectId(params.id) },
      };
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, updateOperation);

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(params.id) },
        isFollowing
          ? { $pull: { followers: new ObjectId(userId) } }
          : { $addToSet: { followers: new ObjectId(userId) } }
      );

    return NextResponse.json({
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
    });
  } catch (error) {
    console.error("Follow/Unfollow error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

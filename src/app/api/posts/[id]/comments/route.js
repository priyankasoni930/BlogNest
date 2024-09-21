// src/app/api/posts/[id]/comments/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const client = await clientPromise;
    const db = client.db("blogapp");

    const comments = await db
      .collection("comments")
      .aggregate([
        { $match: { postId: new ObjectId(params.id) } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        { $unwind: "$authorInfo" },
        {
          $project: {
            _id: 1,
            content: 1,
            createdAt: 1,
            author: {
              _id: "$authorInfo._id",
              name: "$authorInfo.name",
              email: "$authorInfo.email",
              avatar: "$authorInfo.avatar",
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { content } = await request.json();
    const postId = params.id;

    const client = await clientPromise;
    const db = client.db("blogapp");

    const comment = await db.collection("comments").insertOne({
      content,
      author: new ObjectId(userId),
      post: new ObjectId(postId),
      createdAt: new Date(),
    });

    // Add activity for the new comment
    await db.collection("activities").insertOne({
      type: "comment",
      user: new ObjectId(userId),
      comment: comment.insertedId,
      post: new ObjectId(postId),
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Comment added successfully",
      commentId: comment.insertedId,
    });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

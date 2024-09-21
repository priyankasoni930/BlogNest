// src/app/api/posts/[id]/route.js

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

    const post = await db
      .collection("posts")
      .aggregate([
        { $match: { _id: new ObjectId(params.id) } },
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
            title: 1,
            content: 1,
            username: 1,
            createdAt: 1,
            updatedAt: 1,
            category: 1,
            tags: 1,
            author: {
              _id: "$authorInfo._id",
              name: "$authorInfo.name",
              avatar: "$authorInfo.avatar",
            },
          },
        },
      ])
      .next();

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Fetch post error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { title, content, username, category, tags } = await request.json();

    const client = await clientPromise;
    const db = client.db("blogapp");

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(params.id), author: new ObjectId(userId) },
      {
        $set: {
          title,
          content,
          username,
          category,
          tags,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          message: "Post not found or you are not authorized to edit this post",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await clientPromise;
    const db = client.db("blogapp");

    const postId = params.id;

    // Check if the post exists and belongs to the user
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(postId),
      author: new ObjectId(userId),
    });

    if (!post) {
      return NextResponse.json(
        {
          message: "Post not found or you do not have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Delete the post
    await db.collection("posts").deleteOne({ _id: new ObjectId(postId) });

    // Delete associated comments
    await db.collection("comments").deleteMany({ post: new ObjectId(postId) });

    // Delete associated activities
    await db
      .collection("activities")
      .deleteMany({ post: new ObjectId(postId) });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

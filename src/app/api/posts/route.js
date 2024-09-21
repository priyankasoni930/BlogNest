import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await clientPromise;
    const db = client.db("blogapp");

    const posts = await db
      .collection("posts")
      .find({ author: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const post = await db.collection("posts").insertOne({
      title,
      content,
      username,
      category,
      tags,
      author: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add activity for the new post
    await db.collection("activities").insertOne({
      type: "post",
      user: new ObjectId(userId),
      post: post.insertedId,
      createdAt: new Date(),
      username: username,
    });

    return NextResponse.json({
      message: "Post created successfully",
      postId: post.insertedId,
    });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

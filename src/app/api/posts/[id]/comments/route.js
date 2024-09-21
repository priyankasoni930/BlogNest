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
      .find({ postId: new ObjectId(params.id) })
      .sort({ createdAt: -1 })
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

    const client = await clientPromise;
    const db = client.db("blogapp");

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(params.id) });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const newComment = {
      postId: new ObjectId(params.id),
      postAuthor: post.author,
      author: new ObjectId(userId),
      content,
      createdAt: new Date(),
    };

    const result = await db.collection("comments").insertOne(newComment);

    const insertedComment = await db
      .collection("comments")
      .findOne({ _id: result.insertedId });

    return NextResponse.json(insertedComment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
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

    const totalPosts = await db
      .collection("posts")
      .countDocuments({ author: new ObjectId(userId) });
    const totalViews = await db
      .collection("posts")
      .aggregate([
        { $match: { author: new ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ])
      .toArray();
    const totalComments = await db
      .collection("comments")
      .countDocuments({ postAuthor: new ObjectId(userId) });

    return NextResponse.json({
      totalPosts,
      totalViews: totalViews[0]?.totalViews || 0,
      totalComments,
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

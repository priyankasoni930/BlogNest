// src/app/api/search/route.js

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("blogapp");

    const posts = await db
      .collection("posts")
      .aggregate([
        {
          $match: {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
              { category: { $regex: query, $options: "i" } },
              { tags: { $in: [new RegExp(query, "i")] } },
            ],
          },
        },
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
            category: 1,
            tags: 1,
            createdAt: 1,
            excerpt: { $substr: ["$content", 0, 150] },
            author: {
              _id: "$authorInfo._id",
              name: "$authorInfo.name",
              avatar: "$authorInfo.avatar",
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
      ])
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

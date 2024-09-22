// src/app/api/activity/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const following = user.following || [];

    const activities = await db
      .collection("activities")
      .aggregate([
        {
          $match: {
            user: { $in: following.map((id) => new ObjectId(id)) },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 50,
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "posts",
            localField: "post",
            foreignField: "_id",
            as: "post",
          },
        },
        {
          $unwind: {
            path: "$post",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 1,
            type: 1,
            createdAt: 1,
            user: {
              _id: 1,
              name: 1,
              username: 1, // Include the username field
            },
            post: {
              _id: 1,
              title: 1,
            },
            comment: {
              _id: 1,
              content: 1,
              post: 1,
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

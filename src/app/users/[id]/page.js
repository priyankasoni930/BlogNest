// src/app/users/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile({ params }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`/api/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await res.json();
        setUser(data.user);
        setPosts(data.posts);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [params.id, router]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/users/${params.id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to follow/unfollow user");
      }

      setUser((prevUser) => ({
        ...prevUser,
        isFollowed: !prevUser.isFollowed,
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.username}</CardTitle>
              </div>
            </div>
            <Button onClick={handleFollow}>
              {user.isFollowed ? "Unfollow" : "Follow"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{user.bio}</p>
          <h3 className="text-xl font-semibold mb-2">Recent Posts</h3>
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post._id} className="py-4">
                <Link
                  href={`/posts/${post._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {post.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{post.excerpt}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <p>
                        Posted on{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// src/app/users/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile({ params }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsFollowing(data.isFollowing);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to fetch user profile");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const fetchUserPosts = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/users/${params.id}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Fetched posts:", data); // Add this line for debugging
        setPosts(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to fetch user posts");
      console.error("Posts fetch error:", error);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [params.id, fetchUserProfile, fetchUserPosts]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/users/${params.id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to update follow status");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg">{user.email}</p>
              <p className="text-sm text-gray-500">
                Joined on {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button className="mt-4" onClick={handleFollowToggle}>
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">User Posts</h2>
      {posts.length === 0 ? (
        <p>This user hasn&apos;t posted anything yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/posts/${post._id}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

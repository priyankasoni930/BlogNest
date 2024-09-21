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
import { Textarea } from "@/components/ui/textarea";

export default function PostView({ params }) {
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/posts/${params.id}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!postRes.ok || !commentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [postData, commentsData] = await Promise.all([
          postRes.json(),
          commentsRes.json(),
        ]);

        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [params.id, router]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/posts/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit comment");
      }

      const newCommentData = await res.json();
      setComments([newCommentData, ...comments]);
      setNewComment("");
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  if (!post) return <div className="text-center mt-8">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center mt-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src={post.author?.avatar}
                  alt={post.username || "Author"}
                />
                <AvatarFallback>
                  {post.author?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span>
                Posted by: {post.username || "Unknown"}
                <br />
                Posted on: {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          {post.author?._id === localStorage.getItem("userId") && (
            <Link href={`/posts/${params.id}/edit`}>
              <Button variant="outline">Edit Post</Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.map((comment) => (
            <div key={comment._id} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="font-semibold">
                  {/* {user.username || "Anonymous User"} */}
                  User
                </span>
              </div>
              <p>{comment.content}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmitComment} className="w-full">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full mb-2"
            />
            <Button type="submit">Submit Comment</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

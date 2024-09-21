"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";

export default function SearchClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    const searchPosts = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await res.json();
        setPosts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    searchPosts();
  }, [query, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("query");
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Search Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              name="query"
              placeholder="Search posts..."
              defaultValue={query}
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {loading && <div className="text-center mt-8">Loading...</div>}
      {error && (
        <div className="text-center mt-8 text-red-500">Error: {error}</div>
      )}

      {posts.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>{posts.length} posts found</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => (
                <li key={post._id} className="py-4">
                  <Link
                    href={`/posts/${post._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {post.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {post.category}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Posted on{" "}
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!loading && posts.length === 0 && query && (
        <Card className="mt-8">
          <CardContent>
            <p className="text-center">
              No posts found for &apos;{query}&apos;
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

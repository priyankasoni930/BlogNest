// src/app/find-bloggers/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FindBloggers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bloggers, setBloggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch bloggers");
      }

      const data = await res.json();
      setBloggers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Find Bloggers</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search bloggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </form>

          {loading && <div className="text-center">Loading...</div>}
          {error && (
            <div className="text-center text-red-500">Error: {error}</div>
          )}

          <ul className="divide-y divide-gray-200">
            {bloggers.map((blogger) => (
              <li
                key={blogger._id}
                className="py-4 flex items-center justify-between"
              >
                <Link
                  href={`/users/${blogger._id}`}
                  className="flex items-center"
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>
                      {blogger.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {blogger.username}
                    </p>
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

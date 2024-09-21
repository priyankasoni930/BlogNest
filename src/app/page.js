"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PenIcon, BookOpenIcon, UsersIcon } from "lucide-react";

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-primary/5 to-primary/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-700 sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Ideas Deserve a Beautiful Home
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Welcome to our blogging platform where your thoughts come to
                  life. Share your stories, connect with readers, and build your
                  online presence.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/register">Get started</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-gray-500 tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Why Choose Us?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <PenIcon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Easy to Use</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Our intuitive interface makes it simple to create and manage
                    your blog posts.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BookOpenIcon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Rich Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Create engaging content with our powerful editor and
                    multimedia support.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <UsersIcon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Grow Your Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Connect with readers and expand your reach with our
                    community features.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-600 tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start Blogging?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join our community of writers and start sharing your stories
                  today.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/register">Create Your Blog Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return <HomePage />;
}

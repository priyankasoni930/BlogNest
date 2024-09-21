"use client";

import { useEffect } from "react";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function Header() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <PencilSquareIcon className="h-8 w-8 text-primary mr-2" />
            <Link href={isLoggedIn ? "/dashboard" : "/"}>
              <h1 className="text-2xl font-bold text-gray-900">BlogNest</h1>
            </Link>
          </div>
          {isLoggedIn && (
            <div className="flex items-center space-x-4">
              <Link href="/activity">
                <Button size="sm" className="flex items-center">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Activity
                </Button>
              </Link>
              <Link href="/find-bloggers">
                <Button size="sm" className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Find Bloggers
                </Button>
              </Link>
              <Link href="/search">
                <Button size="sm" className="flex items-center">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative h-8 w-8 rounded-full">U</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100`}
      >
        <AuthProvider>
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

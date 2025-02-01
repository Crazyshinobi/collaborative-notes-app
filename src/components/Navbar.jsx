"use client";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token"); 
    setUsername(null); 
    window.location.href = "/"; 
  };

  return (
    <nav className="px-6 py-4 bg-background border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <Link href="/">
            <h1 className="text-lg font-semibold text-foreground">CollabNotes</h1>
          </Link>
        </div>
        <div className="flex gap-5 items-center">
          {username ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <div className="flex gap-2 items-center">
                    <CircleUserRound />
                    <div>{`Hi ${username}`}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => window.location.href = "/login"}>
              Log In
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

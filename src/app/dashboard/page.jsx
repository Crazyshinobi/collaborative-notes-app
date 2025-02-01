"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { CreateNote } from "@/components/CreateNote";
import { Button } from "@/components/ui/button";
import { ViewNotes } from "@/components/ViewNotes";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [refreshNotes, setRefreshNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleNoteCreated = () => {
    setRefreshNotes((prev) => !prev);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    setRefreshNotes((prev) => !prev); // Trigger refresh to fetch search results
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Input and Button */}
          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <Input
              className="flex-1"
              type="text"
              placeholder="Search the notes by title or content"
              value={searchQuery} // Bind search input value
              onChange={handleSearchInputChange} // Handle input change
            />
            <Button className="shrink-0" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Filter Dropdown */}
          <div className="flex-1 sm:w-auto">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="owned">Owned by you</SelectItem>
                <SelectItem value="shared">Shared with you</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Note Button */}
          <CreateNote onNoteCreated={handleNoteCreated} />
        </div>
        {/* Pass searchQuery and filter to ViewNotes */}
        <ViewNotes
          key={refreshNotes}
          searchQuery={searchQuery}
          filter={filter}
        />
      </div>
    </>
  );
}

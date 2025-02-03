"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/hooks/use-toast";
import { EditNote } from "./EditNote";
import { ShareNote } from "./ShareNote";

export function ViewNotes({ searchQuery, filter }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Construct the API URL with search query and filter
      let url = "/api/notes";
      if (searchQuery) {
        url = `/api/notes/search?q=${searchQuery}`;
      } else if (filter === "owned") {
        url = "/api/notes/filter?type=owned";
      } else if (filter === "shared") {
        url = "/api/notes/filter?type=shared";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        setNotes(response.data.notes);
      } else {
        throw new Error(response?.data?.message || "Failed to fetch notes.");
      }
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle note deletion
  const handleDelete = async (noteId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axios.delete(`/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        toast({
          title: "Note deleted successfully!",
          variant: "success",
        });
        fetchNotes(); // Refresh the notes list
      } else {
        throw new Error(response?.data?.error || "Failed to delete note.");
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response.data.error || "An unexpected error occurred.",
      });
    }
  };

  // Polling: Fetch notes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotes();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [searchQuery, filter]);

  // Fetch notes on initial render and when searchQuery or filter changes
  useEffect(() => {
    fetchNotes();
  }, [searchQuery, filter]);

  if (loading) {
    return <div className="p-6">Loading notes...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <>
      <h1 className="text-3xl mt-10">Notes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-5">
        {notes &&
          notes.map((note) => (
            <Card key={note._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  <div className="py-2">
                    Created on:{" "}
                    <span className="font-semibold">
                      {new Date(note.createdAt).toLocaleDateString("en-GB")}
                    </span>{" "}
                    | Owner:{" "}
                    <span className="font-semibold">{note.owner.username}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{note.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  <EditNote noteId={note._id} onNoteCreated={fetchNotes} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note._id)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                  <ShareNote noteId={note._id} fetchNotes={fetchNotes} />
                </div>
                {note.sharedWith && note.sharedWith.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Shared with:{" "}
                    <span className="font-semibold">
                      {note.sharedWith.map((user) => user.username).join(", ")}
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
      </div>
    </>
  );
}
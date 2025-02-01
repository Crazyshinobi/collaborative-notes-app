"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useToast } from "@/components/hooks/use-toast";
import { useState, useEffect } from "react"; // Add useEffect
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function EditNote({ noteId, onNoteCreated }) {
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchNoteDetails();
    }
  }, [isOpen, noteId]);

  // Fetch note details by ID
  const fetchNoteDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axios.get(`/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        const note = response.data.note;
        setTitle(note.title);
        setContent(note.content);
      } else {
        throw new Error(
          response?.data?.message || "Failed to fetch note details."
        );
      }
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const payload = { title, content };
      const response = await axios.put(`/api/notes/${noteId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        setTitle("");
        setContent("");
        toast({
          title: "Note updated successfully!",
          description: "Your note has been updated.",
          variant: "success",
        });
        onNoteCreated(); // Refresh the notes list
        setIsOpen(false); // Close the dialog
        router.refresh(); // Refresh the page
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: response?.data?.message || "Unable to update the note.",
        });
        console.error(response);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.error || "An unexpected error occurred.",
      });
      console.error("Note update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full sm:w-auto">
          <Edit className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Update a Note
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Update a note by modifying the title or content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Title Input */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Add your title here"
                  required
                />
              </div>

              {/* Content Input */}
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  className="resize-none"
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add your content here"
                  required
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mt-4 text-center text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <AlertDialogFooter className="flex mt-6">
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
}

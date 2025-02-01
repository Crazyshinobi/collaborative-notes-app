"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useToast } from "@/components/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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

export function CreateNote({ onNoteCreated }) {
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State to control the AlertDialog

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
      const response = await axios.post("/api/notes", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        setTitle("");
        setContent("");
        toast({
          title: "Note created successfully!",
          description: "Your note has been saved.",
          variant: "success",
        });
        onNoteCreated(); 
        setIsOpen(false); 
        router.refresh(); 
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: response?.data?.message || "Unable to create the note.",
        });
        console.error(response);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "An unexpected error occurred.",
      });
      console.error("Note creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <div className="flex gap-2 items-center">
            <Plus className="h-4 w-4" />
            <span>Create a Note</span>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Create a Note
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Create a note by adding both Title and Content
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
                {loading ? "Creating..." : "Create"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
}
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useToast } from "@/components/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react"; // Import UserX for remove collaborator icon
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";

export function ShareNote({ noteId, fetchNotes }) {
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState("view"); // Default permission
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("add"); // Default action: add collaborator

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

      if (action === "add") {
        // Payload for sharing the note
        const payload = {
          sharedWithEmail: email,
          permissions: permissions,
        };

        // Send POST request to share the note
        const response = await axios.post(
          `/api/notes/${noteId}/share`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response?.data?.success) {
          setEmail("");
          setPermissions("view"); // Reset permissions to default
          toast({
            title: "Note shared successfully!",
            description: `The note has been shared with ${email}.`,
            variant: "success",
          });
        } else {
          throw new Error(response?.data?.message || "Unable to share the note.");
        }
      } else if (action === "remove") {
        // Send DELETE request to remove collaborator
        const response = await axios.delete(
          `/api/notes/${noteId}/share/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response?.data?.success) {
          setEmail("");
          toast({
            title: "Collaborator removed successfully!",
            description: `The collaborator has been removed.`,
            variant: "success",
          });
        } else {
          throw new Error(response?.data?.message || "Unable to remove collaborator.");
        }
      }

      setIsOpen(false); // Close the dialog
      router.refresh(); // Refresh the page
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "An unexpected error occurred.",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
      fetchNotes(); // Refresh the notes list
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full sm:w-auto">
          <Settings className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Manage Collaborators
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Add or remove collaborators for this note.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Action Selection (Add/Remove) */}
              <div className="grid gap-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={action}
                  onValueChange={(value) => setAction(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Collaborator</SelectItem>
                    <SelectItem value="remove">Remove Collaborator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Input */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter collaborator email"
                  required
                />
              </div>

              {/* Permissions Dropdown (Only for Add Collaborator) */}
              {action === "add" && (
                <div className="grid gap-2">
                  <Label htmlFor="permissions">Permissions</Label>
                  <Select
                    value={permissions}
                    onValueChange={(value) => setPermissions(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                {loading
                  ? action === "add"
                    ? "Adding..."
                    : "Removing..."
                  : action === "add"
                  ? "Add Collaborator"
                  : "Remove Collaborator"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </CardContent>
      </AlertDialogContent>
    </AlertDialog>
  );
}
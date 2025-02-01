"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/components/hooks/use-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function LoginForm({ className, ...props }) {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null); // Reset error state on form submission

      const payload = { email, password };
      const response = await axios.post("/api/auth/login", payload);

      // Check if login was successful
      if (response?.data?.success) {
        setEmail(""); // Clear email input after successful login
        setPassword(""); // Clear password input
        const token = response.data.token; // Get the token from the response
        const name = response.data.name;
        // Store the token (e.g., in localStorage or cookies)
        localStorage.setItem("token", token);
        localStorage.setItem("username", name);
        toast({
          title: "Login successful!",
          description: "Welcome back!",
          variant: "success",
        });

        console.log("User Login:", response.data);

        // Redirect user to the dashboard or another protected page (only after mounting)
        if (isMounted) {
          router.push("/dashboard"); // Redirect to the dashboard or other page
        }
      } else {
        // In case of failure
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: response?.data?.message || "Unable to log you in.",
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
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Ensure loading state is cleared
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-[80vh] pt-16">
        {/* Adjust this */}
        <div className="flex-grow flex items-center justify-center px-6 md:px-10">
          <div className="w-full max-w-sm">
            <div className={cn("flex flex-col gap-6", className)} {...props}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Login</CardTitle>
                  <CardDescription className="text-center">
                    Enter your email below to login to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                      {/* Email Input */}
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="m@example.com"
                          required
                        />
                      </div>

                      {/* Password Input */}
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                        </div>
                        <Input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          id="password"
                          type="password"
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                      <div className="mt-4 text-center text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Signup Link */}
                    <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/signup"
                        className="underline underline-offset-4"
                      >
                        Sign up
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

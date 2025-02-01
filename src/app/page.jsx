import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Collaborate on Notes
            <br />
            <span className="text-primary">in Real-Time</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A modern workspace for your team to create, edit, and share notes
            seamlessly.
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-4"
            >
              Get Started
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8 py-4"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Feature Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="bg-card p-8 rounded-lg border">
            <div className="w-12 h-12 rounded-md bg-primary/10 text-primary mb-6 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-muted-foreground">
              Simultaneous editing with instant updates
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border">
            <div className="w-12 h-12 rounded-md bg-primary/10 text-primary mb-6 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Organized Workspace
            </h3>
            <p className="text-muted-foreground">
              Folders, tags, and powerful search
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border">
            <div className="w-12 h-12 rounded-md bg-primary/10 text-primary mb-6 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Version History
            </h3>
            <p className="text-muted-foreground">
              Track changes and restore previous versions
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            Copyright © {new Date().getFullYear()} CollabNotes. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

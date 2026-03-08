import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Access() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Force hard reload to update state and get past middleware cleanly
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect password");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Access Required - Nice FC</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">Nice FC</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please enter the shared password to access the site.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent sm:text-sm"
                placeholder="Enter shared password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Validating..." : "Enter Site"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

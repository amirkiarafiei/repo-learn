"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface StorageData {
  tutorials: string[];
  repos: string[];
  stats: {
    tutorialsCount: number;
    reposCount: number;
    tutorialsSize: string;
    reposSize: string;
    totalSize: string;
  };
}

export default function Home() {
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchStorage = async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      setStorage(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: string, deleteType: "all" | "cache") => {
    setDeleting(id);
    setOpenMenu(null);
    try {
      await fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deleteType }),
      });
      await fetchStorage(); // Refresh
    } catch {
      // Ignore
    } finally {
      setDeleting(null);
    }
  };

  const formatName = (id: string) => id.replace(/_/g, "/");

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-blue-500">Repo</span>Learn
          </h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/new"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Repository
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            AI-powered tutorials from{" "}
            <span className="text-blue-500">any codebase</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Give RepoLearn a GitHub URL, watch it analyze the code in real-time,
            and get beginner-friendly tutorials tailored for users or developers.
          </p>
          <div className="pt-4">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Your Tutorials Section */}
      <section className="px-6 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Tutorials</h3>
            {storage?.stats && (
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>📁 Tutorials: {storage.stats.tutorialsSize}</span>
                <span>💾 Cache: {storage.stats.reposSize}</span>
                <span className="text-zinc-400">Total: {storage.stats.totalSize}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading...</div>
          ) : !storage?.tutorials?.length ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No tutorials yet. Add a repository to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storage.tutorials.map((id) => (
                <div
                  key={id}
                  className={`relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 ${deleting === id ? "opacity-50" : ""
                    }`}
                >
                  {/* Card content */}
                  <Link href={`/tutorial/${id}`} className="block">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-zinc-200 truncate">
                          {formatName(id)}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {storage.repos.includes(id) ? "📦 Cached" : "☁️ No cache"}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* 3-dot menu button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenu(openMenu === id ? null : id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {openMenu === id && (
                    <div
                      ref={menuRef}
                      className="absolute top-10 right-3 z-10 w-48 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg py-1"
                    >
                      {storage.repos.includes(id) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(id, "cache")}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                        >
                          <span>🗑️</span> Delete Cache Only
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(id, "all")}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <span>⚠️</span> Delete All
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-zinc-500">
          RepoLearn — Deep Agents for Codebase Understanding
        </div>
      </footer>
    </main>
  );
}

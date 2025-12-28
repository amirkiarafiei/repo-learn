"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/Toast";

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
  const { addToast } = useToast();

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
      await fetchStorage();
      addToast(
        deleteType === "all"
          ? `Deleted ${id.replace(/_/g, "/")}`
          : `Cleared cache for ${id.replace(/_/g, "/")}`,
        "success"
      );
    } catch {
      addToast("Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  const formatName = (id: string) => id.replace(/_/g, "/");

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 px-4 py-2 glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-blue-500">Repo</span>
            <span className="text-white">Learn</span>
          </h1>
          <nav className="flex items-center gap-3">
            <a
              href="https://github.com/amirkiarafiei/repo-learn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
            <Link
              href="/new"
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover-lift"
            >
              <span className="text-base transition-transform group-hover:rotate-90">+</span>
              Add Repository
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center space-y-6 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            AI-powered tutorials from{" "}
            <span className="gradient-text">any codebase</span>
          </h2>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Give RepoLearn a GitHub URL, watch it analyze the code in real-time,
            and get beginner-friendly tutorials tailored for users or developers.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/new"
              className="group inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover-lift"
            >
              Get Started
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            {["Real-Time Visualization", "Deep Agent Architecture", "Markdown Export"].map((feature) => (
              <div key={feature} className="px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Tutorials Section */}
      <section className="px-6 py-16 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold">Your Tutorials</h3>
              <p className="text-zinc-500 text-sm mt-1">Manage your generated tutorials</p>
            </div>
            {storage?.stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  <span className="text-zinc-400">Tutorials</span>
                  <span className="font-mono text-zinc-200">{storage.stats.tutorialsSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <span className="text-zinc-400">Cache</span>
                  <span className="font-mono text-zinc-200">{storage.stats.reposSize}</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <span className="text-zinc-400">Total:</span>
                  <span className="font-mono text-zinc-200 ml-2">{storage.stats.totalSize}</span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                  <div className="skeleton h-5 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : !storage?.tutorials?.length ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-zinc-400 text-lg mb-2">No tutorials yet</p>
              <p className="text-zinc-600 text-sm">Add a repository to generate your first tutorial!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {storage.tutorials.map((id) => (
                <div
                  key={id}
                  className={`relative group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover-lift ${deleting === id ? "opacity-50 scale-95" : ""
                    }`}
                >
                  <Link href={`/tutorial/${id}`} className="block">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
                          {formatName(id)}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          {/* Docs badge - always present if tutorial exists */}
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Docs
                          </span>
                          {/* Code badge - only if repo is cached */}
                          {storage.repos.includes(id) ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Code
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-500 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                              No Code
                            </span>
                          )}
                        </div>
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
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {openMenu === id && (
                    <div
                      ref={menuRef}
                      className="absolute top-12 right-4 z-20 w-56 rounded-xl border border-zinc-600 bg-zinc-900 shadow-2xl py-2 animate-fade-in"
                    >
                      {storage.repos.includes(id) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(id, "cache")}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-amber-400">🗑️</span>
                          <div>
                            <div className="font-medium">Clear Code Cache</div>
                            <div className="text-xs text-zinc-400">Keep docs, remove cloned repo</div>
                          </div>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(id, "all")}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                      >
                        <span>⚠️</span>
                        <div>
                          <div className="font-medium">Delete All</div>
                          <div className="text-xs text-red-300/70">Remove docs and code cache</div>
                        </div>
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
      <footer className="border-t border-zinc-800/50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">
            RepoLearn — Deep Agents for Codebase Understanding
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://www.amirkia.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-blue-400 transition-colors"
            >
              www.amirkia.tech
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="https://scholar.google.com/citations?user=9geFFmwAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-blue-400 transition-colors"
            >
              Google Scholar
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

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
      <header className="border-b border-zinc-800/50 px-6 py-4 glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Repo</span>
            <span className="text-zinc-100">Learn</span>
          </h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/new"
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover-lift"
            >
              <span className="text-lg transition-transform group-hover:rotate-90">+</span>
              Add Repository
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center space-y-8 animate-fade-in">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-zinc-300 animate-float">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Powered by Deep Agents
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            AI-powered tutorials from{" "}
            <span className="gradient-text">any codebase</span>
          </h2>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Give RepoLearn a GitHub URL, watch it analyze the code in real-time,
            and get beginner-friendly tutorials tailored for users or developers.
          </p>

          <div className="pt-6 flex items-center justify-center gap-4">
            <Link
              href="/new"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover-lift animate-pulse-glow"
            >
              Get Started
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            {["Real-time Progress", "Multi-Agent System", "Markdown Export"].map((feature) => (
              <div key={feature} className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-400">
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
                          {storage.repos.includes(id) ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Cached
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                              No cache
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
                      className="absolute top-12 right-4 z-20 w-52 rounded-xl border border-zinc-700 bg-zinc-800 shadow-2xl py-2 animate-fade-in"
                    >
                      {storage.repos.includes(id) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(id, "cache")}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/50 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-amber-400">🗑️</span>
                          <div>
                            <div>Clear Cache</div>
                            <div className="text-xs text-zinc-500">Keep tutorial, remove repo</div>
                          </div>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(id, "all")}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                      >
                        <span>⚠️</span>
                        <div>
                          <div>Delete All</div>
                          <div className="text-xs text-red-400/60">Remove tutorial and cache</div>
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
      <footer className="border-t border-zinc-800/50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">
            RepoLearn — Deep Agents for Codebase Understanding
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span>Built with LangGraph</span>
            <span>•</span>
            <span>Powered by OpenRouter</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

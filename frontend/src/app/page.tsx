"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import { useJob } from "@/context/JobContext";

interface TutorialEntry {
  id: string;
  audience: "user" | "dev";
  fullId: string;
  stars: number | null;
  starsFormatted: string | null;
}

interface StorageData {
  tutorials: TutorialEntry[];
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
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const { activeJob } = useJob();

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

  const handleDelete = async (id: string, audience: "user" | "dev", deleteType: "all" | "cache" | "audience") => {
    const fullId = `${id}:${audience}`;
    setDeleting(fullId);
    setOpenMenu(null);
    try {
      await fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, audience, deleteType }),
      });
      await fetchStorage();
      addToast(
        deleteType === "all"
          ? `Deleted ${id.replace(/_/g, "/")}`
          : deleteType === "audience"
            ? `Deleted ${audience} version of ${id.replace(/_/g, "/")}`
            : `Cleared cache for ${id.replace(/_/g, "/")}`,
        "success"
      );
    } catch {
      addToast("Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsWiping(true);
    setShowDeleteAllModal(false);
    try {
      await fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "system", deleteType: "all" }),
      });
      await fetchStorage();
      addToast("System wiped successfully", "success");
    } catch {
      addToast("Failed to wipe system", "error");
    } finally {
      setIsWiping(false);
    }
  };

  const formatName = (id: string) => id.replace(/_/g, " / ");

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 px-4 py-2 bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-blue-600">Repo</span>
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
            <span className="text-blue-600">any codebase</span>
          </h2>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Give RepoLearn a GitHub URL, watch it analyze the code in real-time,
            and get beginner-friendly tutorials tailored for users or developers.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/new"
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover-lift"
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
            <div className="flex-1">
              <h3 className="text-2xl font-bold">Your Tutorials</h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-zinc-500 text-sm">Manage your generated tutorials</p>
                {storage?.stats && (
                  <div className="flex items-center gap-2.5 text-[11px] translate-y-[1px]">
                    <span className="text-zinc-800">•</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-zinc-500">Docs:</span>
                      <span className="text-emerald-400/70 font-medium">{storage.stats.tutorialsSize}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/5 border border-amber-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                      <span className="text-zinc-500">Code:</span>
                      <span className="text-amber-400/70 font-medium">{storage.stats.reposSize}</span>
                    </div>
                    <div className="text-zinc-600 font-light ml-0.5">
                      Total: <span className="text-zinc-400">{storage.stats.totalSize}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Delete All button - Always visible */}
            <button
              onClick={() => setShowDeleteAllModal(true)}
              disabled={isWiping}
              className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-all px-4 py-2 rounded-lg hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 disabled:opacity-30"
            >
              {isWiping ? "Wiping..." : "Delete All"}
            </button>
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
              {/* Add Repository Card - First position */}
              <Link
                href="/new"
                className="group rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-5 transition-all hover:border-blue-500/50 hover:bg-zinc-800/50 flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center mb-2 group-hover:bg-blue-900/30 group-hover:border-blue-500/50 transition-all">
                  <span className="text-xl text-zinc-400 group-hover:text-blue-400">+</span>
                </div>
                <span className="text-sm font-medium text-zinc-400 group-hover:text-blue-300 transition-colors">Add Repository</span>
              </Link>

              {/* Active Generating Job Card */}
              {activeJob && activeJob.status === "generating" && (
                <Link
                  href={`/job/${activeJob.id}`}
                  className="relative group rounded-xl border border-blue-500/30 bg-blue-900/10 p-5 transition-all hover:border-blue-500/50 overflow-hidden cursor-pointer"
                >
                  {/* Orbiting spinner effect */}
                  <div className="absolute top-0 right-0 p-3 opacity-50">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-blue-100 truncate pr-8">
                        {formatName(activeJob.repoId)}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Generating...
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-blue-300/70 font-medium">
                          {activeJob.audience === "user" ? "User" : "Dev"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-blue-300/50">
                    Click to view progress →
                  </div>
                </Link>
              )}

              {storage.tutorials.map((tutorial) => (
                <div
                  key={tutorial.fullId}
                  className={`relative group rounded-xl border border-zinc-700/80 bg-zinc-900 p-5 transition-all hover:border-zinc-500 hover:bg-zinc-800/80 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 cursor-pointer ${deleting === tutorial.fullId ? "opacity-50 scale-95" : ""
                    }`}
                >
                  <Link href={`/tutorial/${tutorial.id}?audience=${tutorial.audience}`} className="block">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
                          {formatName(tutorial.id)}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {/* Docs badge - always present */}
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Docs
                          </span>
                          {/* Code badge - only if repo is cached */}
                          {storage.repos.includes(tutorial.id) ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
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
                    {/* Bottom row: Stars and Audience info */}
                    <div className="flex items-center justify-between mt-3">
                      {tutorial.starsFormatted ? (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-zinc-400">{tutorial.starsFormatted}</span>
                        </div>
                      ) : <div />}

                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                        {tutorial.audience === "user" ? "User-friendly" : "Developer-friendly"}
                      </span>
                    </div>
                  </Link>

                  {/* 3-dot menu button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenu(openMenu === tutorial.fullId ? null : tutorial.fullId);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {openMenu === tutorial.fullId && (
                    <div
                      ref={menuRef}
                      className="absolute top-12 right-4 z-50 w-32 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1 animate-fade-in"
                    >
                      <button
                        type="button"
                        onClick={() => handleDelete(tutorial.id, tutorial.audience, "audience")}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                      >
                        <span>🗑</span>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
          }
        </div >
      </section >

      {/* Footer */}
      < footer className="border-t border-zinc-800/50 px-6 py-6" >
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
      </footer >

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDeleteAllModal(false)}
          ></div>
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-3">System Wipe</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Are you sure you want to delete <span className="text-white font-medium whitespace-nowrap">everything</span>?
              This will permanently remove all tutorials, reasoning history, and cached repositories.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 font-medium hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-[1.5] px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </main >
  );
}

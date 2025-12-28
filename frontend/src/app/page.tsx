import Link from "next/link";

export default function Home() {
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

      {/* Tutorials Grid (placeholder) */}
      <section className="px-6 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-semibold mb-6">Your Tutorials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Empty state */}
            <div className="col-span-full text-center py-12 text-zinc-500">
              <p>No tutorials yet. Add a repository to get started!</p>
            </div>
          </div>
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

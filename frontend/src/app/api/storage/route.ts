import { NextRequest, NextResponse } from "next/server";
import { readdir, rm, stat } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "..", "data");
const TUTORIALS_DIR = path.join(DATA_DIR, "tutorials");
const REPOS_DIR = path.join(DATA_DIR, "repositories");

// Helper to get directory size recursively
async function getDirSize(dirPath: string): Promise<number> {
    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        let size = 0;
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                size += await getDirSize(fullPath);
            } else {
                const s = await stat(fullPath);
                size += s.size;
            }
        }
        return size;
    } catch {
        return 0;
    }
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

// GET /api/storage - Get storage stats and tutorials list
export async function GET() {
    try {
        // Get tutorials
        const tutorialEntries = await readdir(TUTORIALS_DIR, { withFileTypes: true });
        const tutorials = tutorialEntries
            .filter((e) => e.isDirectory() && !e.name.startsWith("."))
            .map((e) => e.name);

        // Get repos
        const repoEntries = await readdir(REPOS_DIR, { withFileTypes: true }).catch(() => []);
        const repos = (repoEntries as { isDirectory: () => boolean; name: string }[])
            .filter((e) => e.isDirectory() && !e.name.startsWith("."))
            .map((e) => e.name);

        // Calculate sizes
        const tutorialsSize = await getDirSize(TUTORIALS_DIR);
        const reposSize = await getDirSize(REPOS_DIR);

        return NextResponse.json({
            tutorials,
            repos,
            stats: {
                tutorialsCount: tutorials.length,
                reposCount: repos.length,
                tutorialsSize: formatBytes(tutorialsSize),
                reposSize: formatBytes(reposSize),
                totalSize: formatBytes(tutorialsSize + reposSize),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to get storage info" }, { status: 500 });
    }
}

// DELETE /api/storage - Delete tutorial and/or cache
export async function DELETE(request: NextRequest) {
    try {
        const { id, deleteType } = await request.json();
        // id format: "unjs_destr" (matches folder names)
        // deleteType: "all" (tutorial + repo) or "cache" (repo only)

        if (!id || !deleteType) {
            return NextResponse.json({ error: "Missing id or deleteType" }, { status: 400 });
        }

        const tutorialPath = path.join(TUTORIALS_DIR, id);
        const repoPath = path.join(REPOS_DIR, id);

        if (deleteType === "all") {
            // Delete both tutorial and repo
            await rm(tutorialPath, { recursive: true, force: true }).catch(() => { });
            await rm(repoPath, { recursive: true, force: true }).catch(() => { });
        } else if (deleteType === "cache") {
            // Delete only the repo (cache)
            await rm(repoPath, { recursive: true, force: true }).catch(() => { });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}

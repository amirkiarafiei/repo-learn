import { NextRequest, NextResponse } from "next/server";
import { readdir, rm, stat, readFile, writeFile } from "fs/promises";
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

// Format star count (e.g., 1234 -> "1.2k")
function formatStars(stars: number): string {
    if (stars >= 1000) {
        return (stars / 1000).toFixed(1) + "k";
    }
    return String(stars);
}

// Check if a directory contains markdown files (is a valid tutorial)
async function hasMarkdownFiles(dirPath: string): Promise<boolean> {
    try {
        const entries = await readdir(dirPath);
        return entries.some(e => e.endsWith(".md"));
    } catch {
        return false;
    }
}

// Fetch GitHub stars for a repo (with caching)
async function getGitHubStars(repoId: string, metadataPath: string): Promise<number | null> {
    // Try to read cached stars from metadata
    try {
        const metaContent = await readFile(metadataPath, "utf-8");
        const meta = JSON.parse(metaContent);
        // Use cached value if less than 24 hours old
        if (meta.stars !== undefined && meta.starsUpdatedAt) {
            const age = Date.now() - new Date(meta.starsUpdatedAt).getTime();
            if (age < 24 * 60 * 60 * 1000) {
                return meta.stars;
            }
        }
    } catch {
        // No metadata or parse error
    }

    // Convert repoId (e.g., "unjs_destr") to GitHub API format
    const parts = repoId.split("_");
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts.slice(1).join("_"); // Handle repos with underscores in name

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "RepoLearn",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!res.ok) return null;

        const data = await res.json();
        const stars = data.stargazers_count || 0;

        // Cache in metadata
        try {
            let existingMeta = {};
            try {
                const existing = await readFile(metadataPath, "utf-8");
                existingMeta = JSON.parse(existing);
            } catch { /* no existing */ }

            await writeFile(metadataPath, JSON.stringify({
                ...existingMeta,
                stars,
                starsUpdatedAt: new Date().toISOString(),
            }, null, 2));
        } catch { /* ignore cache write errors */ }

        return stars;
    } catch {
        return null;
    }
}

// Tutorial entry with audience information
interface TutorialEntry {
    id: string;          // e.g., "unjs_destr"
    audience: "user" | "dev";
    fullId: string;      // e.g., "unjs_destr:user" for uniqueness
    stars: number | null;
    starsFormatted: string | null;
}

// GET /api/storage - Get storage stats and tutorials list (with audience awareness)
export async function GET() {
    try {
        // Get tutorial folders
        const tutorialEntries = await readdir(TUTORIALS_DIR, { withFileTypes: true });
        const tutorialFolders = tutorialEntries
            .filter((e) => e.isDirectory() && !e.name.startsWith("."))
            .map((e) => e.name);

        // Build tutorials list with audience detection
        const tutorials: TutorialEntry[] = [];

        // Cache stars per repo (avoid duplicate API calls for user/dev versions)
        const starsCache = new Map<string, number | null>();

        for (const folder of tutorialFolders) {
            const folderPath = path.join(TUTORIALS_DIR, folder);
            const metadataPath = path.join(folderPath, "metadata.json");

            // Get stars (cached per repo)
            let stars = starsCache.get(folder);
            if (stars === undefined) {
                stars = await getGitHubStars(folder, metadataPath);
                starsCache.set(folder, stars);
            }

            // Check for user/ subfolder
            const userPath = path.join(folderPath, "user");
            if (await hasMarkdownFiles(userPath)) {
                tutorials.push({
                    id: folder,
                    audience: "user",
                    fullId: `${folder}:user`,
                    stars: stars ?? null,
                    starsFormatted: stars !== null ? formatStars(stars) : null,
                });
            }

            // Check for dev/ subfolder
            const devPath = path.join(folderPath, "dev");
            if (await hasMarkdownFiles(devPath)) {
                tutorials.push({
                    id: folder,
                    audience: "dev",
                    fullId: `${folder}:dev`,
                    stars: stars ?? null,
                    starsFormatted: stars !== null ? formatStars(stars) : null,
                });
            }

            // Legacy: Check for markdown files directly in folder (no audience subfolder)
            // Treat as "user" by default for backwards compatibility
            const directMdFiles = await readdir(folderPath).catch(() => []);
            const hasDirect = directMdFiles.some(f => f.endsWith(".md") && f !== "metadata.json");
            if (hasDirect && !await hasMarkdownFiles(userPath) && !await hasMarkdownFiles(devPath)) {
                tutorials.push({
                    id: folder,
                    audience: "user",
                    fullId: `${folder}:user`,
                    stars: stars ?? null,
                    starsFormatted: stars !== null ? formatStars(stars) : null,
                });
            }
        }

        // Get repos (cached code)
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
        console.error("Storage API error:", error);
        return NextResponse.json({ error: "Failed to get storage info" }, { status: 500 });
    }
}

// DELETE /api/storage - Delete tutorial and/or cache
export async function DELETE(request: NextRequest) {
    try {
        const { id, audience, deleteType } = await request.json();
        // id format: "unjs_destr" (matches folder names)

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const tutorialPath = path.join(TUTORIALS_DIR, id);
        const repoPath = path.join(REPOS_DIR, id);

        console.log(`[Storage API] DELETE request for ${id} (audience: ${audience}, type: ${deleteType})`);

        if (deleteType === "cache") {
            // Deprecated but keeping for internal safety if needed
            // The UI will no longer use this. 
            await rm(repoPath, { recursive: true, force: true }).catch(() => { });
        } else {
            // Smart Delete Logic
            if (audience) {
                // 1. Delete specific audience subfolder
                const audiencePath = path.join(tutorialPath, audience);
                console.log(` - Deleting audience folder: ${audiencePath}`);
                await rm(audiencePath, { recursive: true, force: true }).catch(() => { });
            } else {
                // 2. No audience? User wants to wipe the whole repo name
                console.log(` - Deleting entire tutorial root: ${tutorialPath}`);
                await rm(tutorialPath, { recursive: true, force: true }).catch(() => { });
            }

            // 3. Count remaining versions
            let hasRemainingVersions = false;
            try {
                const entries = await readdir(tutorialPath);
                // A version exists if there is a 'user' folder, 'dev' folder, or legacy .md files
                const hasUser = entries.includes("user") && audience !== "user";
                const hasDev = entries.includes("dev") && audience !== "dev";
                const hasLegacy = entries.some(f => f.endsWith(".md") && f !== "metadata.json");

                // Extra check: must actually contain files to count as a version
                if (hasUser) {
                    const userFiles = await readdir(path.join(tutorialPath, "user")).catch(() => []);
                    if (userFiles.some(f => f.endsWith(".md"))) hasRemainingVersions = true;
                }
                if (!hasRemainingVersions && hasDev) {
                    const devFiles = await readdir(path.join(tutorialPath, "dev")).catch(() => []);
                    if (devFiles.some(f => f.endsWith(".md"))) hasRemainingVersions = true;
                }
                if (!hasRemainingVersions && hasLegacy) hasRemainingVersions = true;

            } catch {
                // If folder doesn't exist, no versions remain
                hasRemainingVersions = false;
            }

            // 4. Cleanup repo and root if nothing left
            if (!hasRemainingVersions) {
                console.log(` - No versions remaining for ${id}. Cleaning up repo and root metadata.`);
                await rm(repoPath, { recursive: true, force: true }).catch(() => { });
                await rm(tutorialPath, { recursive: true, force: true }).catch(() => { });
            } else {
                console.log(` - Other versions still exist for ${id}. Repository preserved.`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}

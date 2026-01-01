import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile, rm } from "fs/promises";
import path from "path";

// Data directory for tutorials
const TUTORIALS_DIR = path.join(process.cwd(), "..", "data", "tutorials");
const REPOS_DIR = path.join(process.cwd(), "..", "data", "repositories");

// GET /api/tutorials/[id] - Get tutorial files
// Query params:
//   - audience: "user" | "dev" (defaults to "user")
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get("audience") || "user";

    try {
        // Find the actual directory case-insensitively
        const allEntries = await readdir(TUTORIALS_DIR);
        const matchedDirName = allEntries.find(
            (entry) => entry.toLowerCase() === id.toLowerCase()
        );

        if (!matchedDirName) {
            return NextResponse.json(
                { error: "Tutorial directory not found" },
                { status: 404 }
            );
        }

        const tutorialDir = path.join(TUTORIALS_DIR, matchedDirName);

        // Check for audience subdirectory first (user/ or dev/)
        const audienceDir = path.join(tutorialDir, audience);
        let targetDir = tutorialDir;
        let actualAudience = audience;  // Track what we actually found

        try {
            const audienceEntries = await readdir(audienceDir);
            if (audienceEntries.some(f => f.endsWith(".md"))) {
                targetDir = audienceDir;
                actualAudience = audience;  // Exact match
            } else {
                // Requested audience folder exists but has no .md files
                // Return 404 - don't fallback
                return NextResponse.json(
                    { error: `No tutorial files found for ${audience} audience` },
                    { status: 404 }
                );
            }
        } catch {
            // Requested audience folder doesn't exist at all
            // For the overwrite check, this means the tutorial doesn't exist
            // Return 404 - don't silently fallback to opposite audience
            return NextResponse.json(
                { error: `Tutorial not found for ${audience} audience` },
                { status: 404 }
            );
        }

        const entries = await readdir(targetDir, { withFileTypes: true });
        const files = entries
            .filter((e) => e.isFile() && e.name.endsWith(".md"))
            .map((e) => e.name);

        if (files.length === 0) {
            return NextResponse.json(
                { error: "No tutorial files found" },
                { status: 404 }
            );
        }

        // Read all markdown files
        const contents: Record<string, string> = {};
        for (const file of files) {
            const content = await readFile(path.join(targetDir, file), "utf-8");
            contents[file] = content;
        }

        return NextResponse.json({
            id,
            name: id.replace(/_/g, "/"),
            audience: actualAudience,  // Return what we ACTUALLY found
            files,
            contents,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Tutorial not found" },
            { status: 404 }
        );
    }
}

// DELETE /api/tutorials/[id] - Delete tutorial files (for retry/reset)
// Query params:
//   - audience: "user" | "dev"
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get("audience");

    if (!audience) {
        return NextResponse.json({ error: "Audience required" }, { status: 400 });
    }

    try {
        // Safe path construction
        const safeId = id.replace(/[^a-zA-Z0-9_-]/g, ""); // Basic sanitization
        const safeAudience = audience.replace(/[^a-z]/g, "");

        const audienceDir = path.join(TUTORIALS_DIR, safeId, safeAudience);
        const repoDir = path.join(REPOS_DIR, safeId);

        console.log(`[API] Cleaning up for ${safeId}:`);
        console.log(` - Deleting tutorial audience dir: ${audienceDir}`);
        console.log(` - Deleting cloned repo dir: ${repoDir}`);

        // Parallel deletion for robustness
        await Promise.all([
            rm(audienceDir, { recursive: true, force: true }),
            rm(repoDir, { recursive: true, force: true })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete failed:", error);
        return NextResponse.json(
            { error: "Failed to delete tutorial" },
            { status: 500 }
        );
    }
}

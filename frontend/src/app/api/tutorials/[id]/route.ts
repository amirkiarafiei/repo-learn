import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

// Data directory for tutorials
const TUTORIALS_DIR = path.join(process.cwd(), "..", "data", "tutorials");

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

        try {
            const audienceEntries = await readdir(audienceDir);
            if (audienceEntries.some(f => f.endsWith(".md"))) {
                targetDir = audienceDir;
            }
        } catch {
            // Fallback: try opposite audience or main dir
            const oppositeAudience = audience === "user" ? "dev" : "user";
            const oppositeDir = path.join(tutorialDir, oppositeAudience);
            try {
                const oppEntries = await readdir(oppositeDir);
                if (oppEntries.some(f => f.endsWith(".md"))) {
                    targetDir = oppositeDir;
                }
            } catch {
                // Use main dir
            }
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
            audience,
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

import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

const REPOS_DIR = path.join(process.cwd(), "..", "data", "repositories");

// Helper to recursively get all files
async function getFiles(dir: string, baseDir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        // Skip hidden files/dirs and common ignored folders
        if (entry.name.startsWith(".") ||
            entry.name === "node_modules" ||
            entry.name === "__pycache__" ||
            entry.name === "dist" ||
            entry.name === "build") {
            continue;
        }

        if (entry.isDirectory()) {
            files.push(...(await getFiles(fullPath, baseDir)));
        } else {
            files.push(relativePath);
        }
    }
    return files;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Safety check: ensure repo exists
    const repoPath = path.join(REPOS_DIR, id);
    try {
        await stat(repoPath);
    } catch {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    try {
        const files = await getFiles(repoPath, repoPath);
        return NextResponse.json({ files });
    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

// Data directory for tutorials
const TUTORIALS_DIR = path.join(process.cwd(), "..", "data", "tutorials");

// GET /api/tutorials/[id] - Get tutorial files
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tutorialDir = path.join(TUTORIALS_DIR, id);

    try {
        // Check for user/ subdirectory first (where tutorials are stored)
        const userDir = path.join(tutorialDir, "user");
        let targetDir = tutorialDir;

        try {
            await readdir(userDir);
            targetDir = userDir;
        } catch {
            // No user subdir, use main dir
        }

        const entries = await readdir(targetDir, { withFileTypes: true });
        const files = entries
            .filter((e) => e.isFile() && e.name.endsWith(".md"))
            .map((e) => e.name);

        // Read all markdown files
        const contents: Record<string, string> = {};
        for (const file of files) {
            const content = await readFile(path.join(targetDir, file), "utf-8");
            contents[file] = content;
        }

        return NextResponse.json({
            id,
            name: id.replace(/_/g, "/"),
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

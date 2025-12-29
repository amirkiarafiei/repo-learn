import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const REPOS_DIR = path.join(process.cwd(), "..", "data", "repositories");

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
        return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Security check: Ensure path does not traverse out of repo dir
    const repoPath = path.resolve(REPOS_DIR, id);
    const fullPath = path.resolve(repoPath, filePath);

    if (!fullPath.startsWith(repoPath)) {
        return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    try {
        // Check if file exists and is a file
        const stats = await stat(fullPath);
        if (!stats.isFile()) {
            return NextResponse.json({ error: "Not a file" }, { status: 400 });
        }

        const content = await readFile(fullPath, "utf-8");
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}

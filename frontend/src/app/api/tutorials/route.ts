import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

// Data directory for tutorials
const TUTORIALS_DIR = path.join(process.cwd(), "..", "data", "tutorials");

// GET /api/tutorials - List all tutorials
export async function GET() {
    try {
        const entries = await readdir(TUTORIALS_DIR, { withFileTypes: true });
        const tutorials = entries
            .filter((e) => e.isDirectory() && !e.name.startsWith("."))
            .map((e) => ({
                id: e.name,
                name: e.name.replace(/_/g, "/"), // Convert back to repo format
            }));

        return NextResponse.json({ tutorials });
    } catch {
        return NextResponse.json({ tutorials: [] });
    }
}

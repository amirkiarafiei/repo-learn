import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "..", "data");
const TUTORIALS_DIR = path.join(DATA_DIR, "tutorials");

// GET /api/tutorials/[id]/metadata - Get metadata including thread_id
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const metadataPath = path.join(TUTORIALS_DIR, id, "metadata.json");

        try {
            const content = await readFile(metadataPath, "utf-8");
            return NextResponse.json(JSON.parse(content));
        } catch {
            // No metadata file exists yet
            return NextResponse.json({ threadId: null });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to read metadata" }, { status: 500 });
    }
}

// POST /api/tutorials/[id]/metadata - Save metadata including thread_id
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const tutorialDir = path.join(TUTORIALS_DIR, id);
        const metadataPath = path.join(tutorialDir, "metadata.json");

        // Ensure directory exists
        await mkdir(tutorialDir, { recursive: true });

        // Read existing metadata if any
        let existingMetadata = {};
        try {
            const content = await readFile(metadataPath, "utf-8");
            existingMetadata = JSON.parse(content);
        } catch {
            // No existing metadata
        }

        // Merge and write
        const newMetadata = {
            ...existingMetadata,
            ...body,
            updatedAt: new Date().toISOString(),
        };

        await writeFile(metadataPath, JSON.stringify(newMetadata, null, 2));

        return NextResponse.json({ success: true, metadata: newMetadata });
    } catch (error) {
        console.error("Failed to save metadata:", error);
        return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 });
    }
}

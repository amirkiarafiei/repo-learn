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
        const searchParams = request.nextUrl.searchParams;
        const audience = searchParams.get("audience");

        const rootMetadataPath = path.join(TUTORIALS_DIR, id, "metadata.json");
        const audienceMetadataPath = audience ? path.join(TUTORIALS_DIR, id, audience, "metadata.json") : null;

        let metadata = { threadId: null };

        // 1. Read root metadata (contains stars, common info)
        try {
            const rootContent = await readFile(rootMetadataPath, "utf-8");
            metadata = { ...metadata, ...JSON.parse(rootContent) };
        } catch { /* ignore */ }

        // 2. Read audience-specific metadata (contains threadId)
        if (audienceMetadataPath) {
            try {
                const audienceContent = await readFile(audienceMetadataPath, "utf-8");
                metadata = { ...metadata, ...JSON.parse(audienceContent) };
            } catch { /* ignore */ }
        }

        return NextResponse.json(metadata);
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
        const { audience, ...dataToSave } = body;

        // Determine where to save based on content
        // threadId and agent-specific status should go to audience subfolder if audience is provided
        // Other things (like stars) go to root

        let targetDir = path.join(TUTORIALS_DIR, id);

        // Fix: Check for status as well, so "generating" status goes to the correct folder
        const isAudienceSpecific =
            dataToSave.threadId !== undefined ||
            dataToSave.status !== undefined ||
            dataToSave.snapshot !== undefined;

        console.log(`[API Metadata] POST id=${id} audience=${audience}`, { isAudienceSpecific, keys: Object.keys(dataToSave) });

        if (audience && isAudienceSpecific) {
            targetDir = path.join(targetDir, audience);
            console.log(`[API Metadata] Targeting audience folder: ${targetDir}`);
        } else {
            console.log(`[API Metadata] Targeting root folder: ${targetDir}`);
        }

        const metadataPath = path.join(targetDir, "metadata.json");

        // Ensure directory exists
        await mkdir(targetDir, { recursive: true });

        // Read existing metadata at targetPath if any
        let existingMetadata = {};
        try {
            const content = await readFile(metadataPath, "utf-8");
            existingMetadata = JSON.parse(content);
        } catch { /* ignore */ }

        // Merge and write
        const newMetadata = {
            ...existingMetadata,
            ...dataToSave,
            updatedAt: new Date().toISOString(),
        };

        await writeFile(metadataPath, JSON.stringify(newMetadata, null, 2));

        return NextResponse.json({ success: true, metadata: newMetadata });
    } catch (error) {
        console.error("Failed to save metadata:", error);
        return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 });
    }
}

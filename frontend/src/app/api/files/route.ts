import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

// Define paths relative to the project root (repo-learn/frontend)
const DATA_DIR = path.join(process.cwd(), "..", "data");
const REPOS_DIR = path.join(DATA_DIR, "repositories");
const TUTORIALS_DIR = path.join(DATA_DIR, "tutorials");

export interface FileNode {
    name: string;
    type: "file" | "dir";
    path: string;
    children?: FileNode[];
}

// Helper: Recursively build tree
async function buildTree(dirPath: string, relativePathStr: string, maxDepth = 10, currentDepth = 0): Promise<FileNode[]> {
    if (currentDepth > maxDepth) return [];

    try {
        const entries = await readdir(dirPath, { withFileTypes: true });

        // Sort: Directories first, then files
        entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

        const nodes: FileNode[] = [];

        for (const entry of entries) {
            // Skip hidden files/dirs (e.g., .git)
            if (entry.name.startsWith(".")) continue;

            const fullPath = path.join(dirPath, entry.name);
            const nodePath = path.join(relativePathStr, entry.name);

            if (entry.isDirectory()) {
                nodes.push({
                    name: entry.name,
                    type: "dir",
                    path: nodePath,
                    children: await buildTree(fullPath, nodePath, maxDepth, currentDepth + 1)
                });
            } else {
                nodes.push({
                    name: entry.name,
                    type: "file",
                    path: nodePath
                });
            }
        }
        return nodes;
    } catch (error) {
        // If directory doesn't exist or access denied, return empty
        return [];
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const repoId = searchParams.get("repoId");
    const audience = searchParams.get("audience");

    if (!repoId || !audience) {
        return NextResponse.json({ error: "Missing repoId or audience params" }, { status: 400 });
    }

    try {
        // 1. Build Repo Tree
        // Path: data/repositories/{repoId}
        const repoPath = path.join(REPOS_DIR, repoId);
        const repoTree = await buildTree(repoPath, `repositories/${repoId}`);

        // 2. Build Tutorial Tree
        // Path: data/tutorials/{repoId}/{audience}
        const tutorialPath = path.join(TUTORIALS_DIR, repoId, audience);
        const tutorialTree = await buildTree(tutorialPath, `tutorials/${repoId}/${audience}`);

        return NextResponse.json({
            repo: {
                name: repoId,
                type: "dir",
                path: `repositories/${repoId}`,
                children: repoTree
            },
            tutorial: {
                name: audience, // Display as "dev" or "user"
                type: "dir",
                path: `tutorials/${repoId}/${audience}`,
                children: tutorialTree
            }
        });
    } catch (error) {
        console.error("Files API Error:", error);
        return NextResponse.json({ error: "Failed to fetch file system" }, { status: 500 });
    }
}

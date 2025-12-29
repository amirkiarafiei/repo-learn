import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";
import JSZip from "jszip";
import puppeteer from "puppeteer";
import { marked } from "marked";

const TUTORIALS_DIR = path.join(process.cwd(), "..", "data", "tutorials");

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "markdown"; // markdown | pdf
    const audience = searchParams.get("audience") || "user";

    const tutorialDir = path.join(TUTORIALS_DIR, id);
    const audienceDir = path.join(tutorialDir, audience);

    try {
        const entries = await readdir(audienceDir);
        const files = entries
            .filter((f) => f.endsWith(".md"))
            .sort((a, b) => a.localeCompare(b));

        if (files.length === 0) {
            return NextResponse.json({ error: "No tutorial files found" }, { status: 404 });
        }

        const zip = new JSZip();

        if (type === "markdown") {
            for (const file of files) {
                const content = await readFile(path.join(audienceDir, file));
                zip.file(file, content);
            }
        } else if (type === "pdf") {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            try {
                for (const file of files) {
                    const mdContent = await readFile(path.join(audienceDir, file), "utf-8");
                    const htmlContent = await marked(mdContent);

                    const page = await browser.newPage();

                    // Simple HTML wrapper with basic styling
                    const styledHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                    max-width: 800px;
                                    margin: 40px auto;
                                    padding: 0 20px;
                                }
                                pre {
                                    background: #f4f4f4;
                                    padding: 15px;
                                    border-radius: 5px;
                                    overflow-x: auto;
                                }
                                code {
                                    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
                                    font-size: 0.9em;
                                    background: #f4f4f4;
                                    padding: 2px 4px;
                                    border-radius: 3px;
                                }
                                img {
                                    max-width: 100%;
                                    height: auto;
                                }
                                h1, h2, h3 { color: #1a202c; }
                                h1 { border-bottom: 2px solid #edf2f7; padding-bottom: 10px; }
                            </style>
                        </head>
                        <body>
                            ${htmlContent}
                        </body>
                        </html>
                    `;

                    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
                    const pdfBuffer = await page.pdf({
                        format: 'A4',
                        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
                        printBackground: true
                    });

                    const pdfFileName = file.replace(".md", ".pdf");
                    zip.file(pdfFileName, pdfBuffer);
                    await page.close();
                }
            } finally {
                await browser.close();
            }
        }

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

        return new Response(new Uint8Array(zipBuffer), {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${id}_${audience}_export.zip"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}

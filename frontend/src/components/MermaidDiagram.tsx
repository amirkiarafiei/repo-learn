"use client";

import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";

// Initialize mermaid once with a dark theme matching the app's design system
let initialized = false;

function initMermaid() {
    if (initialized) return;
    initialized = true;

    mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
            // Core background & text
            background: "#0d1117",
            primaryColor: "#1e3a5f",
            primaryTextColor: "#e4e4e7",
            primaryBorderColor: "#3b82f6",

            // Secondary elements
            secondaryColor: "#1e1b4b",
            secondaryTextColor: "#c4b5fd",
            secondaryBorderColor: "#6366f1",

            // Tertiary elements
            tertiaryColor: "#1a1a2e",
            tertiaryTextColor: "#a1a1aa",
            tertiaryBorderColor: "#3f3f46",

            // Lines & labels
            lineColor: "#52525b",
            textColor: "#e4e4e7",

            // Fonts
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontSize: "14px",

            // Node styling
            nodeBorder: "#3b82f6",
            nodeTextColor: "#e4e4e7",

            // Edges
            edgeLabelBackground: "#18181b",

            // Notes
            noteBkgColor: "#1e293b",
            noteTextColor: "#cbd5e1",
            noteBorderColor: "#334155",

            // Pie / other
            mainBkg: "#1e3a5f",
        },
        flowchart: { curve: "basis", padding: 16 },
        sequence: { mirrorActors: false },
        darkMode: true,
    });
}

interface MermaidDiagramProps {
    chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const uniqueId = useId().replace(/:/g, "_");

    useEffect(() => {
        let cancelled = false;

        async function render() {
            initMermaid();

            try {
                const { svg: renderedSvg } = await mermaid.render(
                    `mermaid-${uniqueId}`,
                    chart.trim()
                );
                if (!cancelled) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to render diagram");
                    setSvg(null);
                }
            }
        }

        render();
        return () => { cancelled = true; };
    }, [chart, uniqueId]);

    // Error fallback — show raw code
    if (error) {
        return (
            <div className="mermaid-container mermaid-error">
                <div className="mermaid-error-badge">⚠ Diagram Error</div>
                <pre className="mermaid-fallback-code">
                    <code>{chart}</code>
                </pre>
            </div>
        );
    }

    // Loading state
    if (!svg) {
        return (
            <div className="mermaid-container mermaid-loading">
                <div className="mermaid-loading-dot" />
                <span>Rendering diagram…</span>
            </div>
        );
    }

    // Success — render the SVG
    return (
        <div
            ref={containerRef}
            className="mermaid-container"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

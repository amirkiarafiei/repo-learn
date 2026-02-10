"use client";

import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

// Initialize mermaid once with a dark theme matching the app's design system
let initialized = false;

function initMermaid() {
    if (initialized) return;
    initialized = true;

    mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
            background: "#0d1117",
            primaryColor: "#1e3a5f",
            primaryTextColor: "#e4e4e7",
            primaryBorderColor: "#3b82f6",
            secondaryColor: "#1e1b4b",
            secondaryTextColor: "#c4b5fd",
            secondaryBorderColor: "#6366f1",
            tertiaryColor: "#1a1a2e",
            tertiaryTextColor: "#a1a1aa",
            tertiaryBorderColor: "#3f3f46",
            lineColor: "#52525b",
            textColor: "#e4e4e7",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontSize: "14px",
            nodeBorder: "#3b82f6",
            nodeTextColor: "#e4e4e7",
            edgeLabelBackground: "#18181b",
            noteBkgColor: "#1e293b",
            noteTextColor: "#cbd5e1",
            noteBorderColor: "#334155",
            mainBkg: "#1e3a5f",
        },
        flowchart: { curve: "basis", padding: 16 },
        sequence: { mirrorActors: false },
        darkMode: true,
    });
}

const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
        <div className="mermaid-controls absolute top-2 right-2 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={() => zoomIn(0.25)}
                title="Zoom In"
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-300 transition-all shadow-xl backdrop-blur-md"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
            <button
                onClick={() => zoomOut(0.25)}
                title="Zoom Out"
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-300 transition-all shadow-xl backdrop-blur-md"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>
            <button
                onClick={() => resetTransform()}
                title="Reset View"
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-300 transition-all shadow-xl backdrop-blur-md"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
};

interface MermaidDiagramProps {
    chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const uniqueId = useId().replace(/:/g, "_");

    useEffect(() => {
        let cancelled = false;

        async function render() {
            initMermaid();
            try {
                // We use a temporary container to render the Mermaid chart
                // efficiently without cluttering the main DOM
                const { svg: renderedSvg } = await mermaid.render(
                    `mermaid-${uniqueId}`,
                    chart.trim()
                );

                if (!cancelled) {
                    // Post-process the SVG to make it responsive and compatible with panning
                    // We remove hardcoded width/height/max-width and let the zoom wrapper take control
                    const cleanedSvg = renderedSvg
                        .replace(/width="[^"]*"/, 'width="100%"')
                        .replace(/height="[^"]*"/, 'height="100%"')
                        .replace(/style="[^"]*max-width:[^;]*;?"/, '')
                        .replace(/style="[^"]*"/, '');

                    setSvg(cleanedSvg);
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

    if (!svg) {
        return (
            <div className="mermaid-container mermaid-loading h-[300px]">
                <div className="mermaid-loading-dot" />
                <span>Generating diagram...</span>
            </div>
        );
    }

    return (
        <div className="mermaid-container relative group h-[600px] overflow-hidden bg-[#0d1117] rounded-xl border border-zinc-800/80 shadow-inner">
            <TransformWrapper
                initialScale={1}
                minScale={0.05}
                maxScale={10}
                centerOnInit={true}
                limitToBounds={false}
                wheel={{ step: 0.1, smoothStep: 0.005 }}
                alignmentAnimation={{ sizeX: 0, sizeY: 0 }} // Disable snapping
                doubleClick={{ disabled: false }}
            >
                <Controls />
                <TransformComponent
                    wrapperClass="!w-full !h-full"
                    contentClass="!w-full !h-full flex items-center justify-center p-12"
                >
                    <div
                        className="cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center select-none"
                        style={{
                            // We use a slight transform to fix some sub-pixel rendering issues in Chrome
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden'
                        }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
}

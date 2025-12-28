"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
    exiting?: boolean;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: Toast["type"]) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

function ToastContainer({
    toasts,
    removeToast,
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl glass
            ${toast.exiting ? "toast-exit" : "toast-enter"}
            ${toast.type === "success"
                            ? "border-emerald-500/50"
                            : toast.type === "error"
                                ? "border-red-500/50"
                                : "border-blue-500/50"
                        }
          `}
                >
                    {/* Icon */}
                    <span className="text-lg">
                        {toast.type === "success" && "✓"}
                        {toast.type === "error" && "✕"}
                        {toast.type === "info" && "ℹ"}
                    </span>

                    {/* Message */}
                    <span
                        className={`text-sm font-medium ${toast.type === "success"
                                ? "text-emerald-300"
                                : toast.type === "error"
                                    ? "text-red-300"
                                    : "text-blue-300"
                            }`}
                    >
                        {toast.message}
                    </span>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={() => removeToast(toast.id)}
                        className="ml-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}

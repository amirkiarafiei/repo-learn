"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ActiveJob {
    id: string;         // Job UUID
    repoId: string;     // format: owner_repo
    threadId: string;   // LangGraph thread ID
    runId?: string;     // LangGraph run ID (optional for backward compatibility/active runs)
    audience: "user" | "dev";
    status: "generating" | "completed";
    startTime: number;
    depth: "basic" | "detailed";
    githubUrl: string;  // Original GitHub URL (e.g., https://github.com/owner/repo)
    continuationCount?: number; // Number of times "Continue" was clicked
}

interface JobContextType {
    activeJob: ActiveJob | null;
    startJob: (job: Omit<ActiveJob, "status" | "startTime">) => void;
    completeJob: () => void;
    clearJob: () => void;
    updateJob: (updates: Partial<ActiveJob>) => void;
    isLoading: boolean; // True while hydrating from localStorage
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
    const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("repo-learn-active-job");
            if (stored) {
                setActiveJob(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to parse active job from storage", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Persist to localStorage whenever activeJob changes
    useEffect(() => {
        if (!isLoading) {
            if (activeJob) {
                localStorage.setItem("repo-learn-active-job", JSON.stringify(activeJob));
            } else {
                localStorage.removeItem("repo-learn-active-job");
            }
        }
    }, [activeJob, isLoading]);

    const startJob = (jobData: Omit<ActiveJob, "status" | "startTime">) => {
        const newJob: ActiveJob = {
            ...jobData,
            status: "generating",
            startTime: Date.now(),
        };
        setActiveJob(newJob);
    };

    const completeJob = () => {
        if (activeJob) {
            setActiveJob({ ...activeJob, status: "completed" });
        }
    };

    const clearJob = () => {
        setActiveJob(null);
    };

    const updateJob = (updates: Partial<ActiveJob>) => {
        if (activeJob) {
            setActiveJob({ ...activeJob, ...updates });
        }
    };

    return (
        <JobContext.Provider value={{ activeJob, startJob, completeJob, clearJob, updateJob, isLoading }}>
            {children}
        </JobContext.Provider>
    );
}

export function useJob() {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error("useJob must be used within a JobProvider");
    }
    return context;
}

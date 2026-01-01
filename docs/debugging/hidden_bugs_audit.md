# Hidden Bugs Audit Report

**Date:** January 1, 2026
**Auditor:** Deep Code Review
**Status:** ✅ ALL CRITICAL ISSUES FIXED

---

## Executive Summary

A deep review of the codebase revealed **6 critical bugs** that combine to cause the observed symptoms:
1. Agent restarts mid-way through generation
2. TODO list resets to "Loading/Planning"
3. "Tutorial generation failed or file not found" error on completion

**All bugs have been fixed in this session.**

---

## 🐛 Bug #1: Misdiagnosis - Original Was Correct

**File:** `useAgentStream.ts` (onFinish handler)
**Severity:** 🟢 No Actual Bug (Corrected)

**Original Analysis (WRONG):**
We initially thought `onFinish` calling `onComplete` unconditionally was a bug. It wasn't.

**What Actually Happened:**
Per LangGraph SDK documentation, `onFinish` should ALWAYS trigger completion logic. Errors go to `onError` callback. We briefly introduced a validation check that broke this:

```typescript
// BROKEN CODE (briefly introduced, then reverted):
if (hasMessages || hasTodos) {
    options.onComplete?.();  // Only called if validation passes - THIS WAS WRONG
}
```

**Current State:** Restored correct behavior where `onFinish` always signals completion.

---

## 🐛 Bug #2: Missing `useRef` Guard for `submitAnalysis` (CRITICAL)

**File:** `JobPage.tsx` (line 69-77)
**Severity:** 🔴 Critical

**Problem:**
The `useEffect` that auto-starts analysis uses `hasStarted` state, but React state updates are asynchronous. If the effect runs again before the state update propagates, `submitAnalysis` can be called multiple times.

**Impact:**
- Agent starts → component re-renders → effect runs again before `hasStarted` updates
- Multiple analysis runs interfere with each other
- TODO list appears to reset because a new stream starts

**Code:**
```typescript
useEffect(() => {
    if (!hasStarted && !streamLoading) {
        setHasStarted(true);       // ← State update is async!
        submitAnalysis(githubUrl); // ← Can be called again before state updates
    }
}, [isReadonly, githubUrl, hasStarted, streamLoading, submitAnalysis, audience, isComplete]);
```

**Fix:** Use a `useRef` to synchronously guard against double execution.

---

## 🐛 Bug #3: `isComplete` Guard is Missing from Auto-Start (MODERATE)

**File:** `JobPage.tsx` (line 70)
**Severity:** 🟠 Moderate

**Problem:**
The `isComplete` is already in the dependency array and there's an early return for it, BUT if the effect's dependencies cause it to re-run (e.g., `audience` changes), the `hasStarted` state persists, which is correct. However, `isComplete` being `true` AFTER a successful run doesn't prevent a re-render from causing issues if combined with Bug #2.

This is more of an amplifier for Bug #2.

---

## 🐛 Bug #4: Thread ID Confusion / UUID Mismatch (CRITICAL)

**File:** `useAgentStream.ts` (line 204)
**Severity:** 🔴 Critical

**Problem:**
When `submitAnalysis` is called, it generates a UUID for the thread if one doesn't exist:
```typescript
const newThreadId = threadId ?? crypto.randomUUID();
```

But this `newThreadId` is passed to `stream.submit()` and the `onThreadId` callback from `useStream` is supposed to update `threadId`. However, there's a race:
1. `submitAnalysis` creates `newThreadId = "abc-123"`
2. `stream.submit({...}, { threadId: "abc-123" })`
3. LangGraph SDK may call `onThreadId("abc-123")` asynchronously
4. Before that callback fires, if `submitAnalysis` is called again (Bug #2), it creates ANOTHER UUID
5. Now we have two threads running!

**Impact:**
- Duplicate agents running simultaneously
- State gets mixed between threads
- TODO list resets because we're now watching a different thread

**Fix:** Generate UUID synchronously and use a ref to ensure single execution.

---

## 🐛 Bug #5: `saveThreadMetadata` Called with Potentially Null `threadId` (MODERATE)

**File:** `JobPage.tsx` (line 91)
**Severity:** 🟠 Moderate

**Problem:**
```typescript
saveThreadMetadata(repoId, liveStream.threadId, audience);
```
`liveStream.threadId` can be `string | null`, but `saveThreadMetadata` expects `string`.

TypeScript should catch this, but the check `if (isComplete && githubUrl && liveStream.threadId)` does make it truthy at that point. However, there's no guarantee the threadId is actually valid for the current run.

---

## 🐛 Bug #6: View Tutorial Link Uses Raw GitHub URL (MODERATE)

**File:** `JobPage.tsx` (line 188)
**Severity:** 🟠 Moderate

**Problem:**
```typescript
<Link href={`/tutorial/${encodeURIComponent(githubUrl)}`} ...>
```

This passes the entire GitHub URL (e.g., `https://github.com/owner/repo`) to the tutorial page, but the tutorial API expects `owner_repo` format. This link will ALWAYS fail.

**Impact:**
- "View Tutorial →" button after completion leads to 404
- Users can't navigate to their tutorial

**Fix:** Convert to `repoId` format before building the link.

---

## 🐛 Bug #7: Completion Detection Too Strict (CRITICAL) - NEW

**File:** `useAgentStream.ts` (onFinish handler)
**Severity:** 🔴 Critical

**Problem:**
The `onFinish` handler was checking if `stateObj?.messages` and `stateObj?.todos` were present before calling `onComplete`. However, the state passed to `onFinish` might not contain these fields in the expected structure, especially with DeepAgents.

**Code (before fix):**
```typescript
const hasMessages = stateObj?.messages && stateObj.messages.length > 0;
const hasTodos = stateObj?.todos && stateObj.todos.length > 0;

if (hasMessages || hasTodos) {
    options.onComplete?.(); // Only called if state looks "complete"
} else {
    // NEVER CALLED onComplete even when agent finished successfully!
}
```

**Impact:**
- Agent finishes successfully → `onFinish` fires → state validation fails → `onComplete` never called
- Subagents stay in "Working..." state
- No redirect to tutorial page
- Thread metadata never saved → "View Visualization" link broken

**Fix (implemented):**
1. Added `onError` handler to catch errors explicitly
2. Simplified `onFinish` to trust that if stream finished without error, agent is done
3. Created idempotent `signalCompletion()` helper that safely marks everything as done
4. Added proper logging for debugging

---
 
 ## 🐛 Bug #8: Thread Persistence Loss & Polling Cross-talk (MODERATE)
 
 **Files:** `usePersistentAgent.ts`, `useThreadHistory.ts`, `JobPage.tsx`
 **Severity:** 🟠 Moderate
 
 **Problem:**
 1. **Persistence Loss**: LangGraph dev server stores thread state in-memory. If the server is restarted (e.g., stopping/starting the backend), all `thread_id` records become 404. Since tutorial metadata stores these IDs, clicking "Visualization Panel" leads to an unhelpful raw HTTP error.
 2. **Polling Cross-talk**: `usePersistentAgent` (which handles active jobs) polls `useJob().activeJob`. If a user views a *historical* job in readonly mode while they have a (dead) active job in `localStorage`, the live agent hook tries to poll the dead thread, flooding the console with 404s and potentially showing errors on the wrong page.
 
 **Impact:**
 - Confusing raw 404 errors for users after server restarts.
 - Console errors reported as "logical bugs" by developers.
 - Incorrect error display if two threads are being tracked simultaneously.
 
 **Fix (implemented):**
 1. **Graceful Error Handling**: Updated `useThreadHistory` and `usePersistentAgent` to catch 404 errors and provide a human-friendly message: *"Session history lost (404). Local development server resets state if restarted."*
 2. **Polling Disable**: Added a `disabled` option to `usePersistentAgent`.
 3. **Context Sensitivity**: `JobPage.tsx` now passes `disabled: isReadonly` to `usePersistentAgent` when in history mode, effectively silencing active job polling while viewing history.
 4. **Fixed Typo**: Corrected "Tweet 404" typo in previous error message logs.
 
 ---
 
 ## Recommended Fixes
 
 ### Priority 1: Add `useRef` Guard ✅ DONE
 Prevent double execution of `submitAnalysis` using a synchronous guard.
 
 ### Priority 2: Fix Completion Detection ✅ DONE
 Trust `onFinish` and add `onError` handler for explicit error handling.
 
 ### Priority 3: Fix View Tutorial Link ✅ DONE
 Convert GitHub URL to repo ID format.
 
 ### Priority 4: Validate Thread ID ✅ DONE
 Ensure `threadId` is valid before using in redirect logic.
 
 ### Priority 5: Handle Persistence Loss ✅ DONE
 Catch 404s and prevent background cross-talk when viewing history.
 
 ### Priority 6: Fix RepoId Resolution for Snapshot Fallback ✅ DONE
 In readonly mode, use `tutorialId` instead of deriving from `githubUrl` to enable snapshot metadata fetching.
 
 ---
 
 *This audit was last updated on January 1, 2026 at 16:47 local time.*

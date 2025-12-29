# Root Cause Analysis: Tutorial Redirect Loop & Navigation Issues

**Date:** 2024-05-22
**Status:** Resolved

## 1. Problem Description
Users experienced two related issues:
1.  **Redirect Loop/Error**: Upon agent completion, the user was redirected to a "Tutorial not found" page, or sometimes an infinite loop, instead of the generated tutorial.
2.  **Navigation Failure**: Clicking "Back to Tutorial" from the Agent Visualization panel (Job Page) resulted in a 404 error.

## 2. Root Cause Analysis (RCA)

Investigation revealed a "perfect storm" of three distinct minor issues combining to cause critical failure:

### A. The "Case Sensitivity" Mismatch (The "Silly Bug")
*   **Issue**: The backend tool `git_clone` was inconsistently handling repository names. While it sometimes lowercased them (or the filesystem did), the frontend's valid URLs (e.g., `GitHub.com/User/Repo`) were passed as-is to the redirect logic.
*   **Impact**: The frontend would try to fetch `/api/tutorials/User_Repo`, but the actual directory on disk was `data/tutorials/user_repo`. Since Linux filesystems are case-sensitive, the API returned 404.

### B. The "Premature Redirect" Race Condition
*   **Issue**: The `useAgentStream` hook's `onFinish` callback was firing blindly when the stream closed, even if it closed due to an error.
*   **Impact**: If the agent crashed (e.g., "Provider returned error"), the UI would still trigger `isComplete=true` -> `useEffect` -> `router.push(...)`. The user would be whisked away from the error message to a non-existent tutorial page.

### C. The "Audience Amnesia"
*   **Issue**: The `audience` parameter (e.g., `?audience=dev`) was not being persisted when navigating between the Tutorial view and the Agent Visualization view.
*   **Impact**: A user viewing a "Dev" tutorial would click "View Visualization", look around, and click "Back". The link lacked `?audience=dev`, defaulting to `user`. If the `user` tutorial didn't exist (or was different), the system threw a 404.

## 3. Implemented Fixes

To permanently resolve these issues, we implemented a "Defense in Depth" strategy:

### 1. Robust Redirect Protection (JobPage)
We modified `frontend/src/app/job/[id]/page.tsx` to include a verification step:
*   **Check First**: Before redirecting, the code now asynchronously pings the Tutorial API.
*   **Stay if Failed**: If the API returns 404, the redirect is aborted, and an error is logged. The user stays on the visualization page to see what happened.

### 2. Case-Insensitive API (Backend/API)
*   **Tools**: Updated `backend/agent/tools.py` to strictly force all repo names to `.lower()` during cloning and path generation.
*   **Route**: Updated `frontend/src/app/api/tutorials/[id]/route.ts` to scan the directory for case-insensitive matches (e.g., matching `User_Repo` request to `user_repo` folder).

### 3. State Persistence (Navigation)
*   **Links**: Updated all `Link` components in `JobPage` and `TutorialPage` to explicitly propagate the `audience` query parameter.
*   **Back Button**: The "Back to Tutorial" button now dynamically constructs its URL using the current state, ensuring a seamless round-trip.

## 4. Verification
*   **Redirect**: Verified code explicitly checks for `res.ok` before `router.push`.
*   **Case**: Verified regex logic handles `GitHub.com` vs `github.com`.
*   **Navigation**: Verified `audience` param is appended to URLs.

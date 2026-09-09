# SaveDino Role Testing Guide

This guide provides clear step-by-step instructions for testing all user roles, permissions, security boundaries, and workflows in SaveDino.

---

## 1. Quick Test Persona Reference

Every core role has a dedicated single test persona:

| Role / Position | Name | Email | Permissions & Scope |
|---|---|---|---|
| **Platform Admin** | Dr. Eleanor Arroway | `admin@savedino.org` | Full access to `/admin`, manage all users, manage teams, assign matchmaking, edit campaigns |
| **Staff Member** | Priya Patel | `staff@savedino.org` | Access to `/admin`, platform operations and read-only squad inspection |
| **Team Leader** | Sarah Chen | `leader@savedino.org` | Leader of *Nova Orbitals*, approve/reject join requests, review astrometry submissions |
| **Team Member** | Marcus Vance | `member@savedino.org` | Member of *Nova Orbitals*, claim image sets, submit discovery reports |
| **Applicant** | Amina Khalil | `applicant@savedino.org` | Has pending join request for *Nova Orbitals* |
| **Solo Student** | Alex Novak | `solo@savedino.org` | Unassigned student in the matchmaking pool |

---

## 2. Seed Campaigns & Teams Structure

### Campaigns
1. **Campaign 1 (ACTIVE): `Pan-STARRS Sky Survey Phase 1` (Code: `AST-2026-A`)**
   - Registration and Team Formation: Started 14 days ago, open for 14 more days.
   - Campaign Period: Started 7 days ago, closes in 14 days.
   - Status: Active search and report submissions in progress.
2. **Campaign 2 (UPCOMING): `Catalina Deep Sky Phase 2` (Code: `AST-2026-B`)**
   - Registration and Team Formation: Open now (closes in 20 days).
   - Campaign Period: Starts in 20 days (after Campaign 1 ends).
   - Status: Upcoming phase.

### Teams
1. **Team 1: `Nova Orbitals` (Invite Code: `NOVA99`)**
   - Campaign: Campaign 1 (`AST-2026-A`)
   - Leader: Sarah Chen (`leader@savedino.org`)
   - Member: Marcus Vance (`member@savedino.org`)
   - Applicant: Amina Khalil (`applicant@savedino.org`, Pending)
   - Image sets:
     - `PS1-26A-01`: Submitted with sample astrometry report
     - `PS1-26A-02`: In progress by Marcus Vance
     - `PS1-26A-03`: Unassigned batch ready for claiming
2. **Team 2: `Cosmic Wardens` (Invite Code: `WARD77`)**
   - Campaign: Campaign 2 (`AST-2026-B`)
   - Status: Forming (Ready for student matchmaking)

---

## 3. Step-by-Step Test Scenarios

### Test Suite A: Admin Security and Access Control

#### Goal: Verify that only Admin and Staff can access `/admin`, and unauthorized roles are blocked.

1. **Test Leader/Member Block**:
   - Open the Dev Persona Switcher in the bottom-left corner and select **Sarah Chen** (`leader@savedino.org`).
   - Notice the navigation bar does not show the **Admin Console** button.
   - In your browser address bar, navigate directly to `http://localhost:3000/admin`.
   - **Expected Result**: You are blocked on the server and redirected to `/campaigns`.

2. **Test Solo Student Block**:
   - Switch to **Alex Novak** (`solo@savedino.org`).
   - Navigate to `http://localhost:3000/admin`.
   - **Expected Result**: You are blocked and redirected to `/campaigns`.

3. **Test Admin Access**:
   - Switch to **Dr. Eleanor Arroway** (`admin@savedino.org`).
   - Notice the **Admin Console** button is now visible in the top navigation bar.
   - Click **Admin Console** or visit `http://localhost:3000/admin`.
   - **Expected Result**: The full admin control center opens, displaying tabs for Users, Matchmaking, Teams, and Campaigns.

4. **Test Admin Team Participation Restrictions**:
   - As **Dr. Eleanor Arroway** (`admin@savedino.org`), go to `/campaigns`.
   - Try clicking **Form Squad** or **Join with Code**.
   - **Expected Result**: The action is blocked with a notice that administrators organize campaigns and cannot form or join participant teams. Direct API calls (`POST /api/teams`, `POST /api/teams/join`, `POST /api/teams/[teamId]/requests`) return 403 Forbidden.

---

### Test Suite B: Team Join Requests and Leader Moderation

#### Goal: Verify that applicants can submit join requests and leaders can accept them.

1. **Verify Applicant State**:
   - Switch to **Amina Khalil** (`applicant@savedino.org`).
   - Visit `/campaigns` and view *Nova Orbitals*.
   - **Expected Result**: Her card displays a **Pending Request** badge.

2. **Leader Approves Request**:
   - Switch to **Sarah Chen** (`leader@savedino.org`).
   - Visit `/teams` and click into *Nova Orbitals*.
   - Open the **Join Requests** tab.
   - Click the **Approve** button on Amina Khalil's request.
   - **Expected Result**: Request moves from pending to approved.

3. **Verify New Member Access**:
   - Switch back to **Amina Khalil** (`applicant@savedino.org`).
   - Refresh the page or visit `/teams`.
   - **Expected Result**: Amina is now an active member of *Nova Orbitals* with access to the team workspace and image sets.

---

### Test Suite C: FITS Image Batch Claiming and Astrometry Reports

#### Goal: Verify team members can claim unassigned image batches and leaders can finalize submissions.

1. **Member Claims Batch**:
   - Switch to **Marcus Vance** (`member@savedino.org`).
   - Go to the *Nova Orbitals* workspace.
   - Find the unassigned image set `PS1-26A-03`.
   - Click **Claim Image Set**.
   - **Expected Result**: The image set status changes to **In Progress** and is assigned to Marcus.

2. **Member Submits Discovery Report**:
   - Click into `PS1-26A-03`.
   - Enter MPC discovery report lines or check **Mark Clean (No Asteroids Found)**.
   - Click **Submit Report**.
   - **Expected Result**: Status updates to **Submitted** and enters the leader review queue.

3. **Leader Final Approval**:
   - Switch to **Sarah Chen** (`leader@savedino.org`).
   - Review Marcus Vance's submission in the team dashboard.
   - Click **Approve Submission**.
   - **Expected Result**: The report is verified for campaign scoring.

---

### Test Suite D: Solo Student Matchmaking Pool

#### Goal: Verify unassigned students can be matched into recruiting teams by administrators.

1. **Check Solo Student View**:
   - Switch to **Alex Novak** (`solo@savedino.org`).
   - Go to `/campaigns`.
   - **Expected Result**: Alex has no active team and sees options to browse open teams or wait for matching.

2. **Admin Assigns Student to Team**:
   - Switch to **Dr. Eleanor Arroway** (`admin@savedino.org`).
   - Go to `/admin?tab=matchmaking`.
   - Locate Alex Novak in the unassigned pool.
   - Select *Cosmic Wardens* from the team dropdown and click **Assign to Squad**.
   - **Expected Result**: Success notification appears and Alex is removed from the unassigned list.

3. **Verify Match Result**:
   - Switch back to **Alex Novak** (`solo@savedino.org`).
   - Go to `/teams`.
   - **Expected Result**: Alex is now a member of *Cosmic Wardens*.

---

### Test Suite E: Admin and Staff Read-Only Squad Workspace Inspection

#### Goal: Verify that Admin and Staff can open any squad URL in read-only mode without being a team member.

1. **Admin Inspects Competitor Squad**:
   - Switch to **Dr. Eleanor Arroway** (`admin@savedino.org`).
   - Go to `/teams` and click into *Nova Orbitals* (or visit `/team/[teamId]`).
   - **Expected Result**: The workspace opens successfully. A violet **Organizer Read-Only Mode** banner appears at the top.
   - You can inspect the squad roster, active image batches, astrometry candidates, and submitted discovery reports in read-only mode.
   - Claiming image sets is disabled for organizers so student batches are preserved.

2. **Staff Inspects Squad**:
   - Switch to **Priya Patel** (`staff@savedino.org`).
   - Click into *Nova Orbitals*.
   - **Expected Result**: Staff can review the team's progress and image submissions in read-only mode.

---

### Test Suite F: Instant Database Reset

- Click the **Reset DB** button in the Dev Persona Switcher toolbar at any time.
- This will wipe all transient changes and restore all campaigns, teams, image sets, and user roles back to their clean initial state.

# 04. Roles & Permissions Matrix 🛡️

This document describes the role hierarchy for the SaveDino Discord server, the critical role ordering requirements for the bot, and dynamic campaign role binding.

---

## 👑 Role Hierarchy Structure

In Discord, roles must be ordered from top to bottom. Higher roles override and manage permissions of lower roles.

```text
▲ HIGH PRIORITY (Top of Role List)
│
├── 🔴 [Bot Role] SaveDino Bot        (MUST be above @Citizen Scientist)
├── 👑 @SEDS Executive / Admin        (Full Administrator privileges)
├── 🛡️ @Campaign Lead / Moderator     (Manage messages, kick/timeout, review candidates)
├── 🚀 @Squad Leader                  (Lead teams, manage squad threads)
├── 🪐 @Citizen Scientist             (Verified via /link on SaveDino platform)
├── 🤖 Dyno / Music Bots              (Automated bots)
└── 👥 @everyone                      (Base permissions for unverified visitors)
│
▼ LOW PRIORITY (Bottom of Role List)
```

---

## ⚠️ Critical Rule: Bot Role Ordering

> [!CAUTION]
> Discord does not allow a bot to assign or modify any role that is positioned **higher** than the bot's own highest role in **Server Settings $\rightarrow$ Roles**.

To avoid `403 Forbidden: Missing Permissions` errors:

1. Go to **Server Settings** $\rightarrow$ **Roles**.
2. Click and drag the **`SaveDino Bot`** role so that it is positioned **above** `@Citizen Scientist`, `@Squad Leader`, and all campaign roles.

---

## 📋 Role Details & Configuration

### 1. `@SEDS Executive / Admin`

- **Color**: Electric Violet (`#8b5cf6`)
- **Key Permissions**:
  - `Administrator`
  - `Manage Server`, `Manage Channels`, `Manage Roles`

### 2. `@Campaign Lead / Moderator`

- **Color**: Emerald Green (`#10b981`)
- **Key Permissions**:
  - `Manage Messages` (Delete spam, pin announcements)
  - `Mute Members`, `Deafen Members`, `Move Members` in voice channels
  - `Moderate Members` (Timeout)
  - `Manage Threads`

### 3. `@Squad Leader`

- **Color**: Sky Blue (`#38bdf8`)
- **Key Permissions**:
  - `Send Messages in Threads`
  - `Create Public/Private Threads`
  - `Priority Speaker` in Squad Voice Channels

### 4. `@Citizen Scientist` _(Assigned automatically via SaveDino Link)_

- **Color**: Vibrant Blue (`#5865f2`)
- **Environment Variable**: `DISCORD_MEMBER_ROLE_ID`
- **Key Permissions**:
  - `Send Messages`
  - `Attach Files` & `Embed Links` (To share Astrometrica charts and FITS screenshots)
  - `Add Reactions`
  - `Use External Emojis`
  - `Connect` & `Speak` in Squad Voice Hubs

### 5. `@everyone` _(Unlinked / New Visitors)_

- **Key Permissions**:
  - `View Channels` (Public read-only channels)
  - `Read Message History`
  - `Use Application Commands` (Allows running `/link`)
  - ❌ `Send Messages` disabled in general discussion until linked to prevent spam bots.

---

## 🎯 Dynamic Campaign Roles

SaveDino supports campaign-specific roles. When an administrator creates an asteroid search campaign in the admin panel, they can specify a `discordRoleId` for that campaign:

- When a participant links their account, `app/api/discord/claim-link/route.ts` loops through their active campaign registrations (`team.event.discordRoleId`) and automatically assigns their campaign badge role (e.g. `@AIASC Oct 2026 Participant`).

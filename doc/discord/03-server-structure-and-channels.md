# 03. Server Structure & Channel Layout 🏛️

This guide outlines the recommended Discord category and channel architecture for SaveDino, including permissions, visibility matrices, and ready-to-use starter templates.

---

## 📁 Category & Channel Hierarchy

```text
📁 ━━━━━ WELCOME & INFO ━━━━━
├── 📢・announcements         [Read-only for @everyone, Staff post]
├── 📜・rules-and-faq         [Read-only, Community rules & FAQ]
├── 🔗・link-account          [Instructions on using /link]
└── 👋・welcome               [Welcome messages & intro chat]

📁 ━━━━━ COMMUNITY ━━━━━
├── 💬・general               [General discussions & networking]
├── 🚀・discoveries           [SaveDino Bot broadcasts asteroid discoveries]
├── 📸・setups-and-astrophoto [Telescope setups, Astrometrica screenshots]
└── 🤖・bot-commands          [Where users can run /link, /rank, etc.]

📁 ━━━━━ CAMPAIGNS & ANALYSIS ━━━━━
├── 🪐・asteroid-hunting      [Main analysis discussion & FITS file questions]
├── 🛡️・squad-headquarters    [Bot generates private squad threads here]
├── 🔍・candidate-review      [Squad leaders & mentors verify MPC reports]
└── 📚・resources-and-guides  [Tutorials for Astrometrica, MPC format, etc.]

📁 ━━━━━ SQUAD VOICE HUBS ━━━━━
├── 🔊 Squad Room 1           [Voice coordination room]
├── 🔊 Squad Room 2           [Voice coordination room]
└── 🔊 Stage: Campaign Briefing [For live webinars, briefings, workshops]

📁 ━━━━━ SUPPORT & LOGS ━━━━━
├── 🎫・support-desk          [Dyno Ticket Embed panel]
└── 🔒・bot-logs              [Private channel for Dyno/Bot logs & moderation]
```

---

## 🔒 Channel Permissions Matrix

| Channel                   | `@everyone`              | `@Citizen Scientist` (Verified)    | Staff / Execs                  |
| :------------------------ | :----------------------- | :--------------------------------- | :----------------------------- |
| `#📢・announcements`      | Read Only                | Read Only                          | Send Messages, Mention `@here` |
| `#📜・rules-and-faq`      | Read Only                | Read Only                          | Manage Messages                |
| `#🔗・link-account`       | Read Only                | Read Only                          | Manage Messages                |
| `#👋・welcome`            | Read & Send Messages     | Read & Send Messages               | Full Control                   |
| `#💬・general`            | Read Only (until linked) | Read & Send Messages               | Full Control                   |
| `#🚀・discoveries`        | Read Only                | Read Only (Add Reactions)          | Bot & Staff Post               |
| `#🪐・asteroid-hunting`   | Read Only (until linked) | Read & Send Messages, Attach Files | Full Control                   |
| `#🛡️・squad-headquarters` | Read Only                | Create/Join Threads                | Bot Creates Threads            |
| `#🎫・support-desk`       | View & Click Buttons     | View & Click Buttons               | Handle Tickets                 |
| `#🔒・bot-logs`           | **Hidden (No View)**     | **Hidden (No View)**               | View & Manage Logs             |

---

## 📝 Copy-Paste Channel Templates

### 1. `#📜・rules-and-faq` (Starter Message)

```markdown
# 🦖 Welcome to the SaveDino Discord Community!

Empowering Sri Lankan students and space enthusiasts to discover asteroids and contribute to NASA / IASC citizen science campaigns.

---

### 📜 Community Guidelines

1. **Respect Fellow Explorers**: Harassment, hate speech, or toxicity will not be tolerated.
2. **Academic & Research Integrity**: Never fabricate Astrometrica observations or share unauthorized campaign data.
3. **No Spam or Self-Promotion**: Keep discussions focused on astronomy, coding, and asteroid hunting.
4. **Official Links Only**: Never click suspicious links or download unverified files. Staff will never DM you asking for passwords.

---

### ❓ Frequently Asked Questions (FAQ)

**Q: How do I participate in asteroid search campaigns?**

> A: Create an account at https://savedino.sedssl.org, form or join a Squad, and link your Discord account!

**Q: How do I get verified in this server?**

> A: Type `/link` in any channel or visit `#🔗・link-account` to connect your SaveDino account. You will automatically receive the **@Citizen Scientist** role.

**Q: Where do I get Astrometrica training?**

> A: Check `#📚・resources-and-guides` for complete video tutorials and configuration settings.
```

---

### 2. `#🔗・link-account` (Starter Message)

```markdown
# 🔗 Connect Your SaveDino Account

To access team voice channels, squad private threads, and official campaign roles:

1. Type `/link` in this channel (or any chat).
2. Click the **Link SaveDino Account** button that appears in your private response.
3. Sign in to your SaveDino account to instantly verify.

✨ **Unlocks:**
• `@Citizen Scientist` Verified Role
• Access to Squad Workspace Channels
• Real-time Asteroid Discovery Feed
```

---

### 3. `#🛡️・squad-headquarters` (Channel Topic & Starter Message)

**Channel Topic**:
`Official Squad Hub — Private squad threads are automatically created here when your team registers on SaveDino.`

**Pinned Welcome Message**:

```markdown
### 🛡️ Squad Headquarters Hub

Whenever a team leader registers a new Squad on https://savedino.sedssl.org/campaigns, our system creates a dedicated discussion thread here.

• Use your squad thread to discuss image sets, compare candidate coordinates, and coordinate Astrometrica analysis.
• Only team members and campaign mentors will have access to private squad workspaces.
```

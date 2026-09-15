# 07. Discord Server Copy-Paste Pack & Onboarding Kit 📦

This file contains copy-paste ready text, channel topics, role colors, starter messages, and native Discord Community Onboarding configurations for setting up the SaveDino Discord server.

---

## 🎨 1. Roles Setup (Names, Colors & Badges)

Create these roles in **Server Settings $\rightarrow$ Roles** (ordered from top to bottom):

| Role Name                   | Hex Color | Discord Permission Tier | Purpose                                                |
| :-------------------------- | :-------- | :---------------------- | :----------------------------------------------------- |
| `🔴 SaveDino Bot`           | `#8B5CF6` | Integrations / Top Bot  | System bot for `/link` and squad thread automations    |
| `🤖 Dyno`                   | `#3B82F6` | Bot / AutoMod           | Support ticketing & moderation                         |
| `👑 SEDS Executive`         | `#8B5CF6` | Administrator           | Core leadership of SEDS Sri Lanka                      |
| `🛡️ Campaign Lead`          | `#10B981` | Moderator               | Campaign mentors, data verifiers, moderators           |
| `🚀 Squad Leader`           | `#38BDF8` | Team Lead               | Captains of registered asteroid hunting squads         |
| `🪐 Citizen Scientist`      | `#6366F1` | Verified Member         | Given automatically when account is linked via `/link` |
| `🔭 Campaign Participant`   | `#F59E0B` | Event Badge             | Assigned to members enrolled in active campaigns       |
| `👥 Explorer` (`@everyone`) | `#94A3B8` | Base                    | Default role for new visitors                          |

---

## 🚀 2. Discord Native Community Onboarding

In **Server Settings $\rightarrow$ Onboarding**:

### Step 1: Default Channels (Channels everyone sees before answering questions)

- `#📢・announcements`
- `#📜・rules-and-faq`
- `#🔗・link-account`
- `#👋・welcome`
- `#💬・general`

### Step 2: Custom Onboarding Questions

#### Question 1: _"What brings you to SaveDino?"_

- 🔘 **Option 1**: `🔭 Hunting for Asteroids in Campaigns` $\rightarrow$ Assigns role: `@Campaign Participant`, unlocks `#🪐・asteroid-hunting`, `#📚・resources-and-guides`
- 🔘 **Option 2**: `👥 Looking to join or create a Squad` $\rightarrow$ Unlocks `#🛡️・squad-headquarters`, `#💬・general`
- 🔘 **Option 3**: `🛰️ Space Science & Astronomy Fan` $\rightarrow$ Unlocks `#📸・setups-and-astrophoto`, `#💬・general`

#### Question 2: _"What updates would you like to receive?"_

- 🔘 **Option 1**: `🚨 New Dataset & Observation Alerts` $\rightarrow$ Assigns role: `@Dataset Alerts`, unlocks `#🚀・discoveries`
- 🔘 **Option 2**: `🎓 Workshops & Training Sessions` $\rightarrow$ Unlocks `#📢・announcements`

---

## 🏛️ 3. Complete Channels & Channel Topics

### Category: `📁 ━━━━━ WELCOME & INFO ━━━━━`

#### `#📢・announcements`

- **Topic**: `Official updates, campaign schedules, and news from SEDS Sri Lanka & SaveDino.`

#### `#📜・rules-and-faq`

- **Topic**: `Community guidelines, code of conduct, and answers to frequently asked questions.`

#### `#🔗・link-account`

- **Topic**: `Type /link here to connect your SaveDino account and unlock squad workspaces.`

#### `#👋・welcome`

- **Topic**: `Welcome to new space explorers! Introduce yourself and meet fellow researchers.`

---

### Category: `📁 ━━━━━ COMMUNITY ━━━━━`

#### `#💬・general`

- **Topic**: `General astronomy chat, space exploration discussions, and community networking.`

#### `#🚀・discoveries`

- **Topic**: `Automated discovery broadcast feed. Asteroid candidates submitted by SaveDino squads.`

#### `#📸・setups-and-astrophoto`

- **Topic**: `Share your telescope setups, astrophotography, and Astrometrica analysis screens.`

#### `#🤖・bot-commands`

- **Topic**: `Run utility commands, check leaderboards, and execute bot interactions.`

---

### Category: `📁 ━━━━━ CAMPAIGNS & ANALYSIS ━━━━━`

#### `#🪐・asteroid-hunting`

- **Topic**: `Active campaign coordination, image set discussions, moving object identification.`

#### `#🛡️・squad-headquarters`

- **Topic**: `Official Squad Hub — Private squad threads are automatically created here.`

#### `#🔍・candidate-review`

- **Topic**: `Verification zone for squad leaders and campaign mentors to inspect MPC coordinate logs.`

#### `#📚・resources-and-guides`

- **Topic**: `Tutorials, software configuration files, and step-by-step Astrometrica guides.`

---

### Category: `📁 ━━━━━ SQUAD VOICE HUBS ━━━━━`

#### `🔊 Squad Room 1` & `🔊 Squad Room 2`

- **Topic**: `Voice and screen-share coordination for squads analyzing dataset frames.`

#### `🔊 Stage: Campaign Briefing`

- **Topic**: `Live webinars, opening ceremonies, and dataset training sessions.`

---

### Category: `📁 ━━━━━ SUPPORT & LOGS ━━━━━`

#### `#🎫・support-desk`

- **Topic**: `Need help? Click the button below to open a private support ticket with our team.`

#### `#🔒・bot-logs` (Private for Staff)

- **Topic**: `Automated audit logs, ticket transcripts, and security moderation alerts.`

---

## 📝 4. Ready-to-Paste Messages for Key Channels

### 📌 Copy-Paste for `#📜・rules-and-faq`

```markdown
# 🦖 Welcome to SaveDino Citizen Science!

**SaveDino** is Sri Lanka's premier citizen science platform for asteroid search campaigns, operated in partnership with **SEDS Sri Lanka** and international astronomical research programs.

---

### 📜 Server Rules & Code of Conduct

1. **Be Respectful & Collaborative**: Treat fellow researchers, mentors, and staff with courtesy. No harassment, discrimination, or offensive remarks.
2. **Scientific & Data Integrity**: Never fabricate Astrometrica observations or share unauthorized campaign image sets. Accuracy is essential for genuine asteroid discoveries.
3. **No Phishing, Scams, or Self-Promotion**: Unsolicited advertising, server invite links, crypto promotions, and malicious links will result in an immediate ban.
4. **Use Appropriate Channels**: Keep campaign discussions in `#🪐・asteroid-hunting` and squad discussions in your private squad threads.
5. **Staff Guidance**: Follow instructions given by `@Campaign Lead` and `@SEDS Executive`.

---

### ❓ Frequently Asked Questions (FAQ)

**Q: How do I participate in asteroid search campaigns?**

> A: Register on the platform at https://savedino.sedssl.org, form or join a squad under the **Campaigns** tab, and link your Discord account!

**Q: How do I verify my Discord account?**

> A: Go to `#🔗・link-account` and type `/link`. Click the private button to connect your SaveDino account and instantly receive the **@Citizen Scientist** role.

**Q: What software do we use for asteroid hunting?**

> A: We use **Astrometrica** configured with Pan-STARRS or Catalina Sky Survey astronomical catalogues. Visit `#📚・resources-and-guides` for complete installation instructions.

**Q: Where can I get help if I run into an error?**

> A: Visit `#🎫・support-desk` and click **Open Support Ticket** to speak directly with campaign moderators.
```

---

### 📌 Copy-Paste for `#🔗・link-account`

```markdown
# 🔗 Link Your SaveDino Account

Connect your Discord account to SaveDino to unlock full community access, private squad channels, and official campaign roles.

---

### 🚀 3 Simple Steps to Connect:

1. **Type `/link`** in this channel (or any chat).
2. **Click the button** in the private reply from SaveDino Bot.
3. **Sign in** to your SaveDino dashboard to complete the instant link.

---

### ✨ What You Unlock:

- 🪐 **`@Citizen Scientist` Verified Role**
- 🛡️ **Auto-access to your Squad's Private Thread**
- 💬 **Full Chat & File Upload Permissions**
- 🚀 **Real-time Discovery Alerts & Leaderboard Badges**
```

---

### 📌 Copy-Paste for `#📚・resources-and-guides`

```markdown
# 📚 Asteroid Search Campaign Starter Pack

Get ready for observation campaigns with these official guides and resources:

---

### 🛠️ 1. Astrometrica Setup & Installation

- **Download Astrometrica**: http://www.astrometrica.at/
- **Program Configuration**: Download the official configuration (`.cfg`) file for the active campaign from your SaveDino dashboard: https://savedino.sedssl.org/campaigns

---

### 🔍 2. Identifying Asteroid Candidates (The 4-Image Blink Technique)

1. **Load Image Set**: Open the 4 FITS images for your assigned dataset.
2. **Astrometry $\rightarrow$ Data Reduction**: Align the star fields with the astronomical reference catalogue.
3. **Blink Images**: Watch for objects moving in a straight line at a constant speed across all 4 frames.
4. **SNR & PSF Check**: Ensure the candidate has a Signal-to-Noise Ratio (SNR) $> 3.0$ and a clean point-spread function (circular, not a streak or cosmic ray artefact).

---

### 📝 3. Reporting Format (MPC Format)

- Save your measured candidates using the standard Minor Planet Center (MPC) 80-column format.
- Submit your completed report directly through your squad dashboard on SaveDino!
```

---

### 📌 Copy-Paste for `#📢・announcements` (Launch Announcement)

```markdown
# 🚀 SaveDino Asteroid Search Platform is Live!

Welcome researchers, students, and space enthusiasts! We are excited to officially launch the **SaveDino Community Server**.

SaveDino brings automated squad matchmaking, Astrometrica dataset tracking, and discovery broadcasting directly to Sri Lankan students participating in asteroid search campaigns.

---

### 🏁 Quick Start Checklist:

1. 📖 Read `#📜・rules-and-faq`
2. 🔗 Link your account in `#🔗・link-account` using `/link`
3. 👥 Form or join a squad at https://savedino.sedssl.org
4. 🪐 Check `#📚・resources-and-guides` to prepare your Astrometrica workspace!

Let's protect planet Earth and discover new minor planets together! 🪐🦖
```

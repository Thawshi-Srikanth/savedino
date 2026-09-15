# 05. Dyno Bot & Support Desk Setup 🎫

This guide covers configuring the **Dyno Bot** support ticket desk and AutoMod filters for the SaveDino community server.

---

## 1. Adding Dyno to Your Server

1. Visit [dyno.gg](https://dyno.gg) and click **Add to Server**.
2. Select your SaveDino Discord server and authorize with recommended permissions.
3. Open the Dyno Web Dashboard for your server.

---

## 2. Setting Up Support Ticket Desk (Embed Panel)

Navigate to **Modules** $\rightarrow$ **Tickets** in the Dyno dashboard.

### 📋 Panel Configuration Settings

- **Panel Name**: `SaveDino & SEDS SL Support Desk`
- **Channel**: Select `#🎫・support-desk`
- **Message Type**: `Embed Message`
- **Embed Title**: `SaveDino Support Desk`
- **Embed Color**: `#8b5cf6` (Electric Violet)
- **Embed Description**:
  ```text
  Need assistance with the SaveDino platform or asteroid search campaigns?

  Click the button below to open a private support ticket with our team:

  • 🔑 Account login & email issues
  • 👥 Squad & recruitment support
  • 📊 Asteroid campaign scoring & Astrometrica FITS issues
  • 🐛 Bug reports & platform feedback
  ```
- **Footer Text**: `SEDS Sri Lanka • SaveDino Citizen Science`
- **Button Text**: `Open Support Ticket`
- **Button Color / Style**: Violet / Blurple

---

### ⚙️ Ticket Channel & Routing Settings

| Setting                       | Value                                           |
| :---------------------------- | :---------------------------------------------- |
| **Ticket Channel Name**       | `ticket-{ticketnumber}`                         |
| **Max Open Tickets per User** | `1`                                             |
| **Staff Roles**               | `@SEDS Executive`, `@Campaign Lead / Moderator` |
| **Mention Roles on Open**     | `@Campaign Lead / Moderator`                    |
| **Ticket Type**               | `Channels`                                      |
| **Open Tickets Category**     | `📁 SUPPORT TICKETS`                            |
| **Resolved Tickets Category** | `📁 SUPPORT TICKETS`                            |
| **Closed Tickets Category**   | `📁 SUPPORT TICKETS`                            |
| **Transcript Log Channel**    | `#🔒・bot-logs`                                 |

---

### 📝 Ticket Intake Form (Optional / Recommended)

Enable **Customize ticket form** and configure the fields:

1. **Dropdown: Issue Category**:
   - `Account / Login / Verification Issue`
   - `Squad & Teammate Coordination`
   - `Astrometrica / Dataset / FITS Error`
   - `Bug Report or Platform Feedback`
2. **Subject Field**: `Short summary of your issue (e.g. Cannot open Set 4)`
3. **Details Field**: `Detailed explanation and any error messages`

---

## 3. Dyno AutoMod & Safety Filter Setup

Navigate to **Modules** $\rightarrow$ **AutoMod** in Dyno.

### 🚫 Banned Words & Phishing List

Add the following words and phrases to **Banned Words**:

### 🛡️ Recommended AutoMod Actions

1. **Action**: `Delete Message` & `Warn User` _(Mute 10 minutes on 3rd infraction)_.
2. **Ignored Roles**: `@SEDS Executive`, `@Campaign Lead / Moderator`.
3. **Log Channel**: `#🔒・bot-logs`.
4. **Anti-Link / Discord Invites**: Enable `Block Discord Invites` (except official SEDS links).
5. **Anti-Spam**: Enable `Fast Message Spam` (Deletes > 5 messages in 3 seconds).

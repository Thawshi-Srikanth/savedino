# 01. Developer Portal & Bot Setup 🛠️

This guide walks through configuring your Discord Application in the Discord Developer Portal, obtaining API keys, and setting up environment variables in SaveDino.

---

## 1. Create Discord Application

1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** in the top right.
3. Name your application: `SaveDino` (or `SaveDino SEDS SL`).
4. Agree to Discord's Developer Terms and click **Create**.

---

## 2. General Information & Credentials

On the **General Information** page:

1. **App Icon**: Upload the official SaveDino / Dinosaur icon (`public/android-chrome-512x512.png` or `public/apple-touch-icon.png`).
2. **Description**:
   > SaveDino Asteroid Search Campaign Platform — Empowering Sri Lankan students in citizen science asteroid discovery.
3. **Application ID / Client ID**: Copy this value $\rightarrow$ `DISCORD_CLIENT_ID`.
4. **Public Key**: Copy this 64-character hex string $\rightarrow$ `DISCORD_PUBLIC_KEY`.
   > [!IMPORTANT]
   > The **Public Key** is required for Discord to verify slash command webhooks. Do not confuse it with the Client Secret.
5. **Interactions Endpoint URL**: Set to:
   ```
   https://savedino.sedssl.org/api/discord/interactions
   ```
   _(For local testing with ngrok: `https://<your-ngrok-subdomain>.ngrok-free.app/api/discord/interactions`)_.
   Discord will send a test `PING (Type 1)` request when you save this URL.

---

## 3. Configure OAuth2 Settings

1. In the sidebar, navigate to **OAuth2** $\rightarrow$ **General**.
2. **Client Secret**: Click **Reset Secret** to generate and copy the secret $\rightarrow$ `DISCORD_CLIENT_SECRET`.
3. **Redirects**: Add your platform redirect URLs:
   - Production: `https://savedino.sedssl.org/api/auth/callback/discord`
   - Local Development: `http://localhost:3000/api/auth/callback/discord`

---

## 4. Bot Setup & Privileged Intents

1. In the sidebar, navigate to **Bot**.
2. **Username**: Set to `SaveDino Bot` or `SaveDino System`.
3. **Token**: Click **Reset Token** and copy the bot token $\rightarrow$ `DISCORD_BOT_TOKEN`.
   > [!CAUTION]
   > Keep this token secret. Never commit it to git or reveal it on client-side code.
4. **Public Bot**: Enable/Disable depending on preference (can be kept public or private).
5. **Privileged Gateway Intents**:
   - Enable **Server Members Intent** (Allows role assignment and member lookups).
   - Enable **Message Content Intent** (Optional, recommended for automated support bots).

---

## 5. Generate Bot Invite Link (Adding Bot to Server)

1. In the sidebar, navigate to **OAuth2** $\rightarrow$ **OAuth2 URL Generator**.
2. **Scopes**: Select:
   - `bot`
   - `applications.commands`
3. **Bot Permissions**: Select:
   - **General**:
     - `Manage Roles` _(To give `@Citizen Scientist` upon linking)_
     - `Manage Channels` _(Optional)_
     - `View Channels`
   - **Text Permissions**:
     - `Send Messages`
     - `Send Messages in Threads`
     - `Create Public Threads`
     - `Create Private Threads`
     - `Embed Links`
     - `Attach Files`
     - `Read Message History`
     - `Mention @everyone, @here, and All Roles`
     - `Use External Emojis`
4. Copy the generated URL at the bottom:
   ```
   https://discord.com/oauth2/authorize?client_id=<YOUR_CLIENT_ID>&permissions=2415930432&scope=bot%20applications.commands
   ```
5. Open this link in your browser, select your Discord server, and click **Authorize**.

---

## 6. Obtain Guild & Role IDs

In Discord Settings $\rightarrow$ **Advanced** $\rightarrow$ Enable **Developer Mode**.

1. **Server / Guild ID**: Right-click your server icon $\rightarrow$ Click **Copy Server ID** $\rightarrow$ `DISCORD_GUILD_ID`.
2. **Member Role ID**: Go to Server Settings $\rightarrow$ **Roles** $\rightarrow$ Right-click `@Citizen Scientist` $\rightarrow$ Click **Copy Role ID** $\rightarrow$ `DISCORD_MEMBER_ROLE_ID`.
3. **Public Invite Link**: Create a permanent (never expires) invite link to `#👋・welcome` or `#📢・announcements` $\rightarrow$ `NEXT_PUBLIC_DISCORD_INVITE_URL`.

---

## 7. Environment Variables Reference

Add these keys to your `.env` and production hosting settings (e.g. Vercel / Railway / Coolify):

```env
# ---------------------------------------------------------------------------
# Social Logins (Discord OAuth)
# ---------------------------------------------------------------------------
DISCORD_CLIENT_ID="123456789012345678"
DISCORD_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ---------------------------------------------------------------------------
# Discord Bot & Automation ($0 Free REST API Engine)
# ---------------------------------------------------------------------------
DISCORD_BOT_TOKEN="MTIz...xxxxxxxxxxxxxxxxxxxx"
DISCORD_PUBLIC_KEY="e4a9b...64_character_hex_key..."
DISCORD_GUILD_ID="134567890123456789"
DISCORD_MEMBER_ROLE_ID="134567890987654321"
NEXT_PUBLIC_DISCORD_INVITE_URL="https://discord.gg/your-code"
```

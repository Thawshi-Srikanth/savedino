# 02. Architecture & Codebase APIs 💻

This document details the code implementation of SaveDino's Discord integration across `lib/discord.ts`, Route Handlers, authentication, and security logic.

---

## 1. Core Module: `lib/discord.ts`

Located at: [lib/discord.ts](file:///home/thawshi/code/savedino/lib/discord.ts)

### Primary Functions

#### `sendDiscordMessage(channelId, content, embeds)`

Sends a JSON message or rich embed to a Discord channel via standard `POST https://discord.com/api/v10/channels/{channelId}/messages`.

- **Authorization**: `Bot ${DISCORD_BOT_TOKEN}`
- **Embed Styling**: Electric Violet (`0x8b5cf6`), Emerald Green (`0x10b981`), or Discord Blurple (`0x5865f2`).

#### `createSquadThread(params)`

Creates a private (or fallback public) discussion thread for a newly created asteroid hunting squad.

- **Thread Name Sanitization**: Converts names to clean kebab-case: `squad-{squadName}`.
- **Thread Type**: Type `12` (Private Thread) or Type `11` (Public Thread).
- **Auto Archive**: `10080` minutes (7 days).
- **Welcome Embed**: Posts instructions explaining that the thread is a dedicated workspace.
- **Auto-Leader Join**: Automatically adds the squad leader if their Discord user ID is linked.

#### `assignDiscordRole(discordUserId, roleId, guildId?)`

Assigns a Discord role to a user via `PUT https://discord.com/api/v10/guilds/{guildId}/members/{discordUserId}/roles/{roleId}`.

- Returns `true` if HTTP status is `204 No Content` or `200 OK`.

#### `addMemberToThread(threadId, discordUserId)`

Adds a team member to a squad thread via `PUT https://discord.com/api/v10/channels/{threadId}/thread-members/{discordUserId}`.

#### `notifySquadCreated(params)`

Broadcasts a clean notification card when a new squad registers, displaying:

- Squad Leader Name
- Squad Invite Code
- Recruitment Status (Open / Closed)
- Direct link to join on SaveDino

#### `notifyAsteroidDiscovery(params)`

Broadcasts verified asteroid candidate discoveries with:

- Dataset / Set Name
- Observation / Candidate count
- Squad credits

---

## 2. Cryptographic Security & Signatures

### Ed25519 Webhook Signature (`verifyDiscordSignature`)

Discord requires all incoming webhook calls to be signed using **Ed25519**. The implementation validates the raw request buffer against the application's `DISCORD_PUBLIC_KEY`:

```typescript
// Convert Discord 64-char hex public key to SPKI DER format for Node crypto
const keyDer = Buffer.concat([
  Buffer.from("302a300506032b6570032100", "hex"), // Ed25519 SPKI ASN.1 header
  Buffer.from(publicKeyHex, "hex"),
]);
const publicKey = crypto.createPublicKey({
  key: keyDer,
  format: "der",
  type: "spki",
});

return crypto.verify(
  null,
  Buffer.from(timestamp + rawBody),
  publicKey,
  Buffer.from(signature, "hex")
);
```

### HMAC Token Generation & Verification

When a user types `/link` in Discord, SaveDino generates a signed HMAC-SHA256 payload valid for 15 minutes:

- `generateDiscordLinkToken(discordUserId, username)`:
  - Payload: `${discordUserId}:${username}:${expiresAt}`
  - Signature: HMAC-SHA256 using `BETTER_AUTH_SECRET`
  - Encoded: Base64URL
- `verifyDiscordLinkToken(token)`:
  - Validates expiry and uses `crypto.timingSafeEqual` to prevent timing attacks.

---

## 3. Webhook Endpoint: `/api/discord/interactions`

Located at: [app/api/discord/interactions/route.ts](file:///home/thawshi/code/savedino/app/api/discord/interactions/route.ts)

### Interaction Types Handled:

1. **PING (Type 1)**: Responds immediately with `{ type: 1 }` (Required for Discord Developer Portal setup validation).
2. **APPLICATION_COMMAND (Type 2)**:
   - Command: `/link`
   - Checks if user's Discord ID is already linked in Prisma `Account` table.
   - If linked $\rightarrow$ Returns Ephemeral Embed showing connected account.
   - If not linked $\rightarrow$ Generates signed token and returns an Ephemeral Action Button pointing to `/link-discord?token={token}`.

> [!NOTE]
> All replies use Discord Flag `64` (`EPHEMERAL`), ensuring the link and token are only visible to the user who ran the command.

---

## 4. Claim Endpoint: `/api/discord/claim-link`

Located at: [app/api/discord/claim-link/route.ts](file:///home/thawshi/code/savedino/app/api/discord/claim-link/route.ts)

When the user clicks the link button and visits `/link-discord?token=...`:

1. Verifies the user is logged into SaveDino (`auth.api.getSession`).
2. Validates the HMAC token and expiration (`verifyDiscordLinkToken`).
3. Upserts the `Account` record with `providerId = "discord"` and `accountId = discordUserId`.
4. **Auto-Role Sync**:
   - Assigns `DISCORD_MEMBER_ROLE_ID` (`@Citizen Scientist`).
   - Checks all campaigns the user is registered in and assigns `event.discordRoleId`.
   - Adds the user to their squad's private Discord thread (`team.discordThreadId`).
5. Tracks the `discord_account_linked` event in PostHog analytics.

---

## 5. Slash Command Registration Endpoint

Located at: [app/api/admin/discord/register-commands/route.ts](file:///home/thawshi/code/savedino/app/api/admin/discord/register-commands/route.ts)

Allows administrators to sync the `/link` command with Discord REST API:

```http
POST /api/admin/discord/register-commands
Content-Type: application/json

{
  "guildId": "134567890123456789" // Optional: Guild ID for instant test sync, or omit for global
}
```

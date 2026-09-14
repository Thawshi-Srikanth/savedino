/**
 * SaveDino Discord Bot & REST API Automation Engine ($0 Cost)
 * Uses Discord Standard REST API v10 with Bot Authorization Token.
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10';

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number; // Integer color e.g. 0x8b5cf6 for Electric Violet
  fields?: DiscordEmbedField[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

/**
 * Helper to send a clean Discord message / embed to a specific channel
 */
export async function sendDiscordMessage(
  channelId: string,
  content: string | null,
  embeds?: DiscordEmbed[]
): Promise<{ id: string; channel_id: string } | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !channelId) {
    return null;
  }

  try {
    const res = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content || undefined,
        embeds: embeds || undefined,
      }),
    });

    if (!res.ok) {
      console.error('[Discord Bot] Error sending message:', await res.text());
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('[Discord Bot] Network error sending message:', error);
    return null;
  }
}

/**
 * Creates a Private Discord Thread for a Squad inside the squads channel
 */
export async function createSquadThread(params: {
  channelId: string;
  squadName: string;
  teamCode: string;
  leaderDiscordUserId?: string | null;
}): Promise<{ threadId: string; threadUrl: string } | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!token || !params.channelId) return null;

  try {
    // Sanitize thread name (max 100 chars, clean characters)
    const threadName = `squad-${params.squadName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 80)}`;

    // Type 12 = GUILD_PRIVATE_THREAD, 11 = GUILD_PUBLIC_THREAD
    // Auto archive duration: 10080 minutes (7 days)
    const res = await fetch(`${DISCORD_API_BASE}/channels/${params.channelId}/threads`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: threadName,
        auto_archive_duration: 10080,
        type: 12, // Private Thread
        invitable: true,
      }),
    });

    if (!res.ok) {
      // Fallback: If private threads require level permissions or fail, try public thread (type 11)
      const errText = await res.text();
      console.warn('[Discord Bot] Private thread creation attempt:', errText);

      const fallbackRes = await fetch(`${DISCORD_API_BASE}/channels/${params.channelId}/threads`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: threadName,
          auto_archive_duration: 10080,
          type: 11, // Public Thread
        }),
      });

      if (!fallbackRes.ok) {
        console.error('[Discord Bot] Thread creation failed:', await fallbackRes.text());
        return null;
      }

      const threadData = await fallbackRes.json();
      const threadUrl = guildId
        ? `https://discord.com/channels/${guildId}/${threadData.id}`
        : `https://discord.com/channels/@me/${threadData.id}`;

      // Post welcome message inside the thread
      await sendDiscordMessage(threadData.id, null, [
        {
          title: `${params.squadName} • Squad Workspace`,
          description: `Private coordination thread for squad **${params.squadName}** (\`${params.teamCode}\`).\nUse this thread to share observations, coordinate analysis, and discuss candidates.`,
          color: 0x8b5cf6,
          footer: { text: 'SaveDino Asteroid Search Campaign' },
        },
      ]);

      if (params.leaderDiscordUserId) {
        await addMemberToThread(threadData.id, params.leaderDiscordUserId);
      }

      return { threadId: threadData.id, threadUrl };
    }

    const threadData = await res.json();
    const threadUrl = guildId
      ? `https://discord.com/channels/${guildId}/${threadData.id}`
      : `https://discord.com/channels/@me/${threadData.id}`;

    // Post welcome message inside the thread
    await sendDiscordMessage(threadData.id, null, [
      {
        title: `${params.squadName} • Squad Workspace`,
        description: `Private coordination thread for squad **${params.squadName}** (\`${params.teamCode}\`).\nUse this thread to share observations, coordinate analysis, and discuss candidates.`,
        color: 0x8b5cf6,
        footer: { text: 'SaveDino Asteroid Search Campaign' },
      },
    ]);

    if (params.leaderDiscordUserId) {
      await addMemberToThread(threadData.id, params.leaderDiscordUserId);
    }

    return { threadId: threadData.id, threadUrl };
  } catch (error) {
    console.error('[Discord Bot] Network error creating squad thread:', error);
    return null;
  }
}

/**
 * Add a member to a Discord thread
 */
export async function addMemberToThread(threadId: string, discordUserId: string): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !threadId || !discordUserId) return false;

  try {
    const res = await fetch(`${DISCORD_API_BASE}/channels/${threadId}/thread-members/${discordUserId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error('[Discord Bot] Error adding member to thread:', error);
    return false;
  }
}

/**
 * Assign a Discord Role to a server member
 */
export async function assignDiscordRole(
  discordUserId: string,
  roleId: string,
  guildId?: string
): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const targetGuild = guildId || process.env.DISCORD_GUILD_ID;

  if (!token || !targetGuild || !discordUserId || !roleId) {
    return false;
  }

  try {
    const res = await fetch(
      `${DISCORD_API_BASE}/guilds/${targetGuild}/members/${discordUserId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok && res.status !== 204) {
      console.error('[Discord Bot] Error assigning role:', await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Discord Bot] Network error assigning role:', error);
    return false;
  }
}

/**
 * Clean, Minimal Broadcast for Squad Creation (No Emoji Spam)
 */
export async function notifySquadCreated(params: {
  channelId?: string | null;
  campaignTitle: string;
  teamName: string;
  leaderName: string;
  inviteCode: string;
  isRecruiting: boolean;
  recruitmentNotes?: string | null;
  maxTeamSize?: number | null;
  threadUrl?: string | null;
}) {
  if (!params.channelId) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://savedino.sedssl.org';
  const joinUrl = `${appUrl}/teams/join?code=${params.inviteCode}`;

  const fields: DiscordEmbedField[] = [
    { name: 'Squad Leader', value: params.leaderName, inline: true },
    { name: 'Squad Code', value: `\`${params.inviteCode}\``, inline: true },
    {
      name: 'Status',
      value: params.isRecruiting ? 'Recruiting Members' : 'Closed Squad',
      inline: true,
    },
  ];

  if (params.recruitmentNotes && params.isRecruiting) {
    fields.push({
      name: 'Notes',
      value: params.recruitmentNotes,
      inline: false,
    });
  }

  fields.push({
    name: 'Join Squad',
    value: `[Apply to join with code \`${params.inviteCode}\`](${joinUrl})`,
    inline: false,
  });

  const embed: DiscordEmbed = {
    title: `Squad Established: ${params.teamName}`,
    description: `New asteroid hunting squad registered for **${params.campaignTitle}**.`,
    url: joinUrl,
    color: 0x8b5cf6, // Electric Violet (#8b5cf6)
    fields,
    footer: {
      text: 'SaveDino Citizen Science • SEDS Sri Lanka',
    },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordMessage(params.channelId, null, [embed]);
}

/**
 * Clean, Minimal Broadcast for Asteroid Discovery (No Emoji Spam)
 */
export async function notifyAsteroidDiscovery(params: {
  channelId?: string | null;
  campaignTitle: string;
  teamName: string;
  setName: string;
  candidateCount: number;
}) {
  if (!params.channelId) return;

  const embed: DiscordEmbed = {
    title: `Asteroid Candidates Reported`,
    description: `Squad **${params.teamName}** submitted verified discoveries for dataset **${params.setName}** in **${params.campaignTitle}**.`,
    color: 0x10b981, // Emerald Green (#10b981)
    fields: [
      { name: 'Dataset', value: `\`${params.setName}\``, inline: true },
      { name: 'Observations', value: `${params.candidateCount} Candidates`, inline: true },
      { name: 'Squad', value: params.teamName, inline: true },
    ],
    footer: {
      text: 'SaveDino Asteroid Search Campaign • SEDS Sri Lanka',
    },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordMessage(params.channelId, null, [embed]);
}

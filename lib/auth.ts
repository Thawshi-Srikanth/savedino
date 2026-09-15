import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "./prisma";
import { sendMagicLinkEmail } from "./email";
import { checkEarlyAccessPermission } from "./early-access";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://*.trycloudflare.com",
    "https://without-clicks-laser-magic.trycloudflare.com",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "https://savedino.sedssl.org",
  ],
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url, metadata }) => {
        // Enforce Early Access pre-registration whitelist
        const access = await checkEarlyAccessPermission(email);
        if (!access.allowed) {
          throw new Error(
            "EARLY_ACCESS_REQUIRED: SaveDino is currently in Early Access for pre-registered citizen scientists."
          );
        }
        await sendMagicLinkEmail({ email, url, token });
      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      enabled: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // Enforce Early Access pre-registration whitelist for new accounts
          const access = await checkEarlyAccessPermission(user.email);
          if (!access.allowed) {
            throw new Error(
              "EARLY_ACCESS_REQUIRED: SaveDino is currently in Early Access for pre-registered citizen scientists."
            );
          }

          // Automatic First Account Admin Provisioning:
          // If no accounts exist in the database, automatically assign admin role to the first user.
          const userCount = await prisma.user.count();
          const role = userCount === 0 ? "admin" : user.role || "user";
          const metadata = (context as any)?.metadata || {};

          return {
            data: {
              ...user,
              role,
              institution: user.institution || metadata.institution || null,
              country: user.country || metadata.country || "Sri Lanka",
              whatsapp: (user as any).whatsapp || metadata.whatsapp || null,
              image: user.image || `Astro-Dino-${Math.floor(100 + Math.random() * 900)}`,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "discord"],
      allowDifferentEmails: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      institution: {
        type: "string",
        required: false,
      },
      country: {
        type: "string",
        required: false,
      },
      whatsapp: {
        type: "string",
        required: false,
      },
    },
  },
});
// Auth configuration reloaded

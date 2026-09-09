import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "./prisma";
import { sendMagicLinkEmail } from "./email";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url, metadata }) => {
        await sendMagicLinkEmail({ email, url, token });
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
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
              country: user.country || metadata.country || null,
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
    },
  },
});

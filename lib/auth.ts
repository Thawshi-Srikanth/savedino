import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Automatic First Account Admin Provisioning:
          // If no accounts exist in the database, automatically assign admin role to the first user.
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }
          return { data: user };
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

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
};

const basePrisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

// Proxy wrapper to sanitize Better-Auth account operations and prevent unknown argument errors
export const prisma = new Proxy(basePrisma, {
  get(target, prop, receiver) {
    if (prop === "account") {
      const accountModel = (target as any).account;
      if (!accountModel) return undefined;
      return new Proxy(accountModel, {
        get(accTarget, accProp) {
          if (accProp === "create") {
            return async (args: any) => {
              if (args?.data && "issuer" in args.data) {
                const { issuer, ...cleanData } = args.data;
                return accTarget.create({ ...args, data: cleanData });
              }
              return accTarget.create(args);
            };
          }
          if (accProp === "createMany") {
            return async (args: any) => {
              if (Array.isArray(args?.data)) {
                const cleanData = args.data.map(({ issuer, ...rest }: any) => rest);
                return accTarget.createMany({ ...args, data: cleanData });
              }
              return accTarget.createMany(args);
            };
          }
          return Reflect.get(accTarget, accProp, accTarget);
        },
      });
    }
    return Reflect.get(target, prop, receiver);
  },
});

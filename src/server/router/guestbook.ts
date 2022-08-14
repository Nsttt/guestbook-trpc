import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const guestbookRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("getAllMessages", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.guestbook.findMany({
          select: {
            name: true,
            message: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("postNewMessage", {
    input: z.object({
      name: z.string(),
      message: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.guestbook.create({
          data: {
            name: input.name,
            message: input.message,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
